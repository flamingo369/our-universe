const { supabaseAdmin } = require('../config/supabase');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        username
      }
    });

    if (authError) {
      // Check for duplicate email
      if (authError.message.includes('duplicate')) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Update profile with additional info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        name,
        username,
        relationship_start_date: null
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Generate token for immediate login
    const { data: { session } } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: process.env.FRONTEND_URL
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: profile || {
        id: authData.user.id,
        email,
        name,
        username
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update last seen
    await supabaseAdmin
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', data.user.id);

    res.json({
      success: true,
      token: data.session.access_token,
      user: profile
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.email;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // Check for duplicate username
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      user: data
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/uploadphoto
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to Supabase Storage
    const filePath = `public/${userId}/${Date.now()}-${req.file.originalname}`;
    
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('profile-photos')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    // Update profile with photo URL
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    res.json({
      success: true,
      profilePhoto: publicUrl,
      user: updatedProfile
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  // With Supabase, logout is handled client-side
  // This endpoint is kept for compatibility
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  logout
};