const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all photos
// @route   GET /api/gallery
// @access  Public (within app)
const getPhotos = async (req, res) => {
  try {
    const { category, featured, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('photos')
      .select(`
        *,
        uploader:uploaded_by (id, name, profile_photo_url)
      `)
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);

    query = query.order('created_at', { ascending: false }).limit(parseInt(limit));

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
      photos: data
    });

  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single photo
// @route   GET /api/gallery/:id
// @access  Public (within app)
const getPhoto = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('photos')
      .select(`
        *,
        uploader:uploaded_by (id, name, profile_photo_url),
        likes:photo_likes (user_id),
        comments:photo_comments (
          id,
          text,
          created_at,
          commenter:user_id (id, name, profile_photo_url)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    res.json({
      success: true,
      photo: data
    });

  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload a photo
// @route   POST /api/gallery
// @access  Private
const uploadPhoto = async (req, res) => {
  try {
    const uploaded_by = req.userId;
    const { title, description, category, tags, date_taken, location } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to Supabase Storage
    const filePath = `gallery/${Date.now()}-${req.file.originalname}`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('gallery-photos')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('gallery-photos')
      .getPublicUrl(filePath);

    // Create database record
    const { data, error } = await supabaseAdmin
      .from('photos')
      .insert({
        uploaded_by,
        url: publicUrl,
        storage_path: filePath,
        title: title || '',
        description: description || '',
        category: category || 'memories',
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        date_taken: date_taken || null,
        location: location || ''
      })
      .select(`
        *,
        uploader:uploaded_by (id, name, profile_photo_url)
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
      photo: data
    });

  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a photo
// @route   PUT /api/gallery/:id
// @access  Private
const updatePhoto = async (req, res) => {
  try {
    const { title, description, category, tags, is_featured } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (is_featured !== undefined) updates.is_featured = is_featured;

    const { data, error } = await supabaseAdmin
      .from('photos')
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
      photo: data
    });

  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a photo (soft delete)
// @route   DELETE /api/gallery/:id
// @access  Private
const deletePhoto = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('photos')
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
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like a photo
// @route   POST /api/gallery/:id/like
// @access  Private
const likePhoto = async (req, res) => {
  try {
    const user_id = req.userId;
    const photo_id = req.params.id;

    const { error } = await supabaseAdmin
      .from('photo_likes')
      .insert({ photo_id, user_id });

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Already liked'
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Photo liked'
    });

  } catch (error) {
    console.error('Like photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unlike a photo
// @route   DELETE /api/gallery/:id/like
// @access  Private
const unlikePhoto = async (req, res) => {
  try {
    const user_id = req.userId;
    const photo_id = req.params.id;

    const { error } = await supabaseAdmin
      .from('photo_likes')
      .delete()
      .match({ photo_id, user_id });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Photo unliked'
    });

  } catch (error) {
    console.error('Unlike photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Comment on a photo
// @route   POST /api/gallery/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const user_id = req.userId;
    const photo_id = req.params.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('photo_comments')
      .insert({ photo_id, user_id, text })
      .select(`
        *,
        commenter:user_id (id, name, profile_photo_url)
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
      comment: data
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPhotos,
  getPhoto,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  likePhoto,
  unlikePhoto,
  addComment
};