const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all letters for current user
// @route   GET /api/letters
// @access  Private
const getLetters = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, theme } = req.query;

    let query = supabaseAdmin
      .from('letters')
      .select(`
        *,
        author:author_id (id, name, profile_photo_url),
        recipient:recipient_id (id, name, profile_photo_url)
      `)
      .or(`author_id.eq.${userId},recipient_id.eq.${userId}`);

    if (status) query = query.eq('status', status);
    if (theme) query = query.eq('theme', theme);

    query = query.order('created_at', { ascending: false });

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
      letters: data
    });

  } catch (error) {
    console.error('Get letters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single letter
// @route   GET /api/letters/:id
// @access  Private
const getLetter = async (req, res) => {
  try {
    const userId = req.userId;

    const { data, error } = await supabaseAdmin
      .from('letters')
      .select(`
        *,
        author:author_id (id, name, profile_photo_url),
        recipient:recipient_id (id, name, profile_photo_url),
        attachments:letter_attachments (*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found'
      });
    }

    // Check authorization
    if (data.author_id !== userId && data.recipient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this letter'
      });
    }

    // Mark as read if recipient
    if (data.recipient_id === userId && data.status !== 'read') {
      await supabaseAdmin
        .from('letters')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', data.id);
    }

    res.json({
      success: true,
      letter: data
    });

  } catch (error) {
    console.error('Get letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new letter
// @route   POST /api/letters
// @access  Private
const createLetter = async (req, res) => {
  try {
    const author_id = req.userId;
    const { recipient_id, title, content, theme, envelope_style, mood, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    // If recipient_id not provided, find the other user (for two-user system)
    let targetRecipientId = recipient_id;
    if (!targetRecipientId) {
      const { data: otherUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .neq('id', author_id)
        .single();
      
      if (userError || !otherUser) {
        return res.status(400).json({
          success: false,
          message: 'Could not find recipient. Make sure both users are registered.'
        });
      }
      targetRecipientId = otherUser.id;
    }

    const { data, error } = await supabaseAdmin
      .from('letters')
      .insert({
        author_id,
        recipient_id: targetRecipientId,
        title,
        content,
        theme: theme || 'romantic',
        envelope_style: envelope_style || 'classic',
        mood: mood || '❤️',
        tags: tags || [],
        status: 'sent',
        delivered_at: new Date().toISOString()
      })
      .select(`
        *,
        author:author_id (id, name, profile_photo_url),
        recipient:recipient_id (id, name, profile_photo_url)
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
      letter: data
    });

  } catch (error) {
    console.error('Create letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a letter
// @route   PUT /api/letters/:id
// @access  Private
const updateLetter = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content, theme, envelope_style, mood, tags, is_favorite } = req.body;

    // Check authorization
    const { data: existing } = await supabaseAdmin
      .from('letters')
      .select('author_id')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this letter'
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (theme !== undefined) updates.theme = theme;
    if (envelope_style !== undefined) updates.envelope_style = envelope_style;
    if (mood !== undefined) updates.mood = mood;
    if (tags !== undefined) updates.tags = tags;
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;

    const { data, error } = await supabaseAdmin
      .from('letters')
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
      letter: data
    });

  } catch (error) {
    console.error('Update letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a letter
// @route   DELETE /api/letters/:id
// @access  Private
const deleteLetter = async (req, res) => {
  try {
    const userId = req.userId;

    const { error } = await supabaseAdmin
      .from('letters')
      .delete()
      .eq('id', req.params.id)
      .eq('author_id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Letter deleted successfully'
    });

  } catch (error) {
    console.error('Delete letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sent letters count
// @route   GET /api/letters/stats/sent
// @access  Private
const getSentCount = async (req, res) => {
  try {
    const userId = req.userId;

    const { count, error } = await supabaseAdmin
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      count: count || 0
    });

  } catch (error) {
    console.error('Get sent count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get received letters count
// @route   GET /api/letters/stats/received
// @access  Private
const getReceivedCount = async (req, res) => {
  try {
    const userId = req.userId;

    const { count, error } = await supabaseAdmin
      .from('letters')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      count: count || 0
    });

  } catch (error) {
    console.error('Get received count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getLetters,
  getLetter,
  createLetter,
  updateLetter,
  deleteLetter,
  getSentCount,
  getReceivedCount
};