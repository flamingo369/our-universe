const { supabaseAdmin } = require('../config/supabase');

// @desc    Get messages for a room
// @route   GET /api/chat/messages/:room
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const userId = req.userId;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:sender_id (id, name, profile_photo_url),
        receiver:receiver_id (id, name, profile_photo_url)
      `)
      .eq('room', room)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      count: data.length,
      messages: data
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, type = 'text', room } = req.body;
    const sender_id = req.userId;

    if (!content || !room) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content and room'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id,
        receiver_id,
        content,
        type,
        room
      })
      .select(`
        *,
        sender:sender_id (id, name, profile_photo_url)
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
      message: data
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/chat/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
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
      message: data
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/chat/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', id)
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
      message: data
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:id/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const user_id = req.userId;

    const { data, error } = await supabaseAdmin
      .from('message_reactions')
      .insert({
        message_id: id,
        user_id,
        emoji
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate reaction
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Reaction already exists'
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      reaction: data
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove reaction from message
// @route   DELETE /api/chat/messages/:id/reactions/:emoji
// @access  Private
const removeReaction = async (req, res) => {
  try {
    const { id, emoji } = req.params;
    const user_id = req.userId;

    const { error } = await supabaseAdmin
      .from('message_reactions')
      .delete()
      .match({ message_id: id, user_id, emoji });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Reaction removed'
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  addReaction,
  removeReaction
};