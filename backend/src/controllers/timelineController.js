const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all timeline events
// @route   GET /api/timeline
// @access  Public (within app)
const getTimeline = async (req, res) => {
  try {
    const { category, featured, limit = 100 } = req.query;

    let query = supabaseAdmin
      .from('timeline_events')
      .select('*')
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);

    query = query.order('event_date', { ascending: false }).limit(parseInt(limit));

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
      events: data
    });

  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single timeline event
// @route   GET /api/timeline/:id
// @access  Public (within app)
const getTimelineEvent = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('timeline_events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Get timeline event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create timeline event
// @route   POST /api/timeline
// @access  Private
const createTimelineEvent = async (req, res) => {
  try {
    const created_by = req.userId;
    const { title, description, event_date, category, location, lat, lng, is_recurring, recurring_type, mood } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and event date'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('timeline_events')
      .insert({
        created_by,
        title,
        description: description || '',
        event_date,
        category: category || 'special_moment',
        location: location || null,
        lat: lat || null,
        lng: lng || null,
        is_recurring: is_recurring || false,
        recurring_type: recurring_type || null,
        mood: mood || '❤️'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Create timeline event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update timeline event
// @route   PUT /api/timeline/:id
// @access  Private
const updateTimelineEvent = async (req, res) => {
  try {
    const { title, description, event_date, category, location, lat, lng, is_recurring, recurring_type, is_featured, mood } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (event_date !== undefined) updates.event_date = event_date;
    if (category !== undefined) updates.category = category;
    if (location !== undefined) updates.location = location;
    if (lat !== undefined) updates.lat = lat;
    if (lng !== undefined) updates.lng = lng;
    if (is_recurring !== undefined) updates.is_recurring = is_recurring;
    if (recurring_type !== undefined) updates.recurring_type = recurring_type;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (mood !== undefined) updates.mood = mood;

    const { data, error } = await supabaseAdmin
      .from('timeline_events')
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
      event: data
    });

  } catch (error) {
    console.error('Update timeline event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete timeline event
// @route   DELETE /api/timeline/:id
// @access  Private
const deleteTimelineEvent = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('timeline_events')
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
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete timeline event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getTimeline,
  getTimelineEvent,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
};