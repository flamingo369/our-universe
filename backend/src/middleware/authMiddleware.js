const { supabaseAdmin } = require('../config/supabase');

// Protect routes - verify Supabase JWT token
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, invalid token' 
      });
    }

    // Get or create user profile in database
    let profile = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(result => result.data);

    // Create profile if it doesn't exist
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          profile_photo_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        // Still allow access but with minimal user data
        profile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          profile_photo_url: user.user_metadata?.avatar_url || null
        };
      } else {
        profile = newProfile;
      }
    }

    // Attach user to request object
    req.user = profile;
    req.userId = user.id;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        let profile = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(result => result.data);

        if (profile) {
          req.user = profile;
          req.userId = user.id;
          req.token = token;
        } else {
          // Create profile if doesn't exist
          const { data: newProfile } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
              profile_photo_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (newProfile) {
            req.user = newProfile;
            req.userId = user.id;
            req.token = token;
          }
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without user info if there's an error
    next();
  }
};

module.exports = { protect, optional };