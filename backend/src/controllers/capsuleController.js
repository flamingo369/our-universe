const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all time capsules
// @route   GET /api/capsules
// @access  Private
const getCapsules = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('time_capsules')
      .select(`
        *,
        creator:created_by (id, name, profile_photo_url)
      `)
      .eq('is_active', true);

    if (status) query = query.eq('status', status);

    query = query.order('unlock_date', { ascending: true }).limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      count: data.length,
      capsules: data
    });

  } catch (error) {
    console.error('Get capsules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single time capsule
// @route   GET /api/capsules/:id
// @access  Private
const getCapsule = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .select(`
        *,
        creator:created_by (id, name, profile_photo_url),
        attachments:time_capsule_attachments (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    res.json({
      success: true,
      capsule: data
    });

  } catch (error) {
    console.error('Get capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create time capsule
// @route   POST /api/capsules
// @access  Private
const createCapsule = async (req, res) => {
  try {
    const created_by = req.userId;
    const { title, content, unlock_date, mood, tags } = req.body;

    if (!title || !content || !unlock_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and unlock date'
      });
    }

    // Check if unlock date is in the future
    if (new Date(unlock_date) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Unlock date must be in the future'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .insert({
        created_by,
        title,
        content,
        unlock_date,
        mood: mood || '❤️',
        tags: tags || [],
        status: 'locked'
      })
      .select(`
        *,
        creator:created_by (id, name, profile_photo_url)
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      capsule: data
    });

  } catch (error) {
    console.error('Create capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update time capsule
// @route   PUT /api/capsules/:id
// @access  Private
const updateCapsule = async (req, res) => {
  try {
    const { title, content, unlock_date, mood, tags, status } = req.body;

    // Check if capsule is still locked
    const { data: existing } = await supabaseAdmin
      .from('time_capsules')
      .select('status, unlock_date')
      .eq('id', req.params.id)
      .single();

    if (existing && existing.status === 'unlocked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update an unlocked capsule'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (unlock_date !== undefined) updates.unlock_date = unlock_date;
    if (mood !== undefined) updates.mood = mood;
    if (tags !== undefined) updates.tags = tags;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .update(updates)
      .eq('id', req.params.id)
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
      capsule: data
    });

  } catch (error) {
    console.error('Update capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete time capsule
// @route   DELETE /api/capsules/:id
// @access  Private
const deleteCapsule = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .update({ is_active: false })
      .eq('id', req.params.id)
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
      message: 'Capsule deleted successfully'
    });

  } catch (error) {
    console.error('Delete capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unlock time capsule (if unlock date has passed)
// @route   POST /api/capsules/:id/unlock
// @access  Private
const unlockCapsule = async (req, res) => {
  try {
    const { data: capsule, error: fetchError } = await supabaseAdmin
      .from('time_capsules')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    if (capsule.status === 'unlocked') {
      return res.status(400).json({
        success: false,
        message: 'Capsule is already unlocked'
      });
    }

    if (new Date(capsule.unlock_date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Capsule cannot be unlocked yet. Unlock date is in the future.'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('time_capsules')
      .update({ 
        status: 'unlocked',
        unlocked_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
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
      capsule: data,
      message: 'Capsule unlocked! Enjoy your memories!'
    });

  } catch (error) {
    console.error('Unlock capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCapsules,
  getCapsule,
  createCapsule,
  updateCapsule,
  deleteCapsule,
  unlockCapsule
};