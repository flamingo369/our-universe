const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all users (for two-user app, returns both users)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, username, email, profile_photo_url, location_country, location_city, last_seen, is_active')
      .eq('is_active', true);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      count: data.length,
      users: data
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: data
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get partner user
// @route   GET /api/users/partner/my
// @access  Private
const getPartner = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Get current user's partner
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('partner_id')
      .eq('id', currentUserId)
      .single();

    if (userError || !currentUser || !currentUser.partner_id) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get partner's profile
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', currentUser.partner_id)
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found'
      });
    }

    res.json({
      success: true,
      partner
    });

  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { favorite_color, theme, location_country, location_city, location_lat, location_lng, relationship_start_date } = req.body;

    const updates = {};
    if (favorite_color !== undefined) updates.favorite_color = favorite_color;
    if (theme !== undefined) updates.theme = theme;
    if (location_country !== undefined) updates.location_country = location_country;
    if (location_city !== undefined) updates.location_city = location_city;
    if (location_lat !== undefined) updates.location_lat = location_lat;
    if (location_lng !== undefined) updates.location_lng = location_lng;
    if (relationship_start_date !== undefined) updates.relationship_start_date = relationship_start_date;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
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
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Link partner
// @route   PUT /api/users/partner/link
// @access  Private
const linkPartner = async (req, res) => {
  try {
    const { partnerEmail } = req.body;
    const currentUserId = req.userId;

    // Find partner by email
    const { data: partnerAuth, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(partnerEmail);

    if (authError || !partnerAuth?.user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    const partnerId = partnerAuth.user.id;

    // Check if same user
    if (partnerId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot link yourself as partner'
      });
    }

    // Update current user's partner
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ partner_id: partnerId })
      .eq('id', currentUserId);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    // Update partner's partner (mutual linking)
    await supabaseAdmin
      .from('profiles')
      .update({ partner_id: currentUserId })
      .eq('id', partnerId);

    res.json({
      success: true,
      message: 'Partner linked successfully'
    });

  } catch (error) {
    console.error('Link partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getPartner,
  updateSettings,
  linkPartner
};