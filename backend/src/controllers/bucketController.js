const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all bucket list items
// @route   GET /api/bucketlist
// @access  Public (within app)
const getBucketList = async (req, res) => {
  try {
    const { status, category, limit = 100 } = req.query;

    let query = supabaseAdmin
      .from('bucket_list_items')
      .select('*')
      .eq('is_active', true);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });

    if (limit) query = query.limit(parseInt(limit));

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
      items: data
    });

  } catch (error) {
    console.error('Get bucket list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single bucket list item
// @route   GET /api/bucketlist/:id
// @access  Public (within app)
const getBucketItem = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bucket_list_items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      item: data
    });

  } catch (error) {
    console.error('Get bucket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create bucket list item
// @route   POST /api/bucketlist
// @access  Private
const createBucketItem = async (req, res) => {
  try {
    const created_by = req.userId;
    const { title, description, category, priority, target_date, notes } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bucket_list_items')
      .insert({
        created_by,
        title,
        description: description || '',
        category: category || 'adventure',
        priority: priority || 'medium',
        target_date: target_date || null,
        notes: notes || '',
        status: 'pending'
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
      item: data
    });

  } catch (error) {
    console.error('Create bucket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update bucket list item
// @route   PUT /api/bucketlist/:id
// @access  Private
const updateBucketItem = async (req, res) => {
  try {
    const { title, description, category, priority, status, target_date, notes, completed_at } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (target_date !== undefined) updates.target_date = target_date;
    if (notes !== undefined) updates.notes = notes;
    if (completed_at !== undefined) updates.completed_at = completed_at;

    const { data, error } = await supabaseAdmin
      .from('bucket_list_items')
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
      item: data
    });

  } catch (error) {
    console.error('Update bucket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete bucket list item
// @route   DELETE /api/bucketlist/:id
// @access  Private
const deleteBucketItem = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bucket_list_items')
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
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete bucket item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getBucketList,
  getBucketItem,
  createBucketItem,
  updateBucketItem,
  deleteBucketItem
};