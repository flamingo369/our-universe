const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all memories
// @route   GET /api/memories
// @access  Public (within app)
const getMemories = async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('memories')
      .select(`
        *,
        creator:created_by (id, name, profile_photo_url)
      `)
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);

    query = query.order('memory_date', { ascending: false }).limit(parseInt(limit));

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
      memories: data
    });

  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single memory
// @route   GET /api/memories/:id
// @access  Public (within app)
const getMemory = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .select(`
        *,
        creator:created_by (id, name, profile_photo_url),
        photos:memory_photos (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    res.json({
      success: true,
      memory: data
    });

  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create memory
// @route   POST /api/memories
// @access  Private
const createMemory = async (req, res) => {
  try {
    const created_by = req.userId;
    const { title, description, memory_date, category, location, mood, tags } = req.body;

    if (!title || !memory_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and memory date'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('memories')
      .insert({
        created_by,
        title,
        description: description || '',
        memory_date,
        category: category || 'special',
        location: location || null,
        mood: mood || '❤️',
        tags: tags || []
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
      memory: data
    });

  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update memory
// @route   PUT /api/memories/:id
// @access  Private
const updateMemory = async (req, res) => {
  try {
    const { title, description, memory_date, category, location, mood, tags, is_featured } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (memory_date !== undefined) updates.memory_date = memory_date;
    if (category !== undefined) updates.category = category;
    if (location !== undefined) updates.location = location;
    if (mood !== undefined) updates.mood = mood;
    if (tags !== undefined) updates.tags = tags;
    if (is_featured !== undefined) updates.is_featured = is_featured;

    const { data, error } = await supabaseAdmin
      .from('memories')
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
      memory: data
    });

  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete memory
// @route   DELETE /api/memories/:id
// @access  Private
const deleteMemory = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('memories')
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
      message: 'Memory deleted successfully'
    });

  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory
};