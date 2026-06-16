const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getPhotos,
  getPhoto,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  likePhoto,
  unlikePhoto,
  addComment
} = require('../controllers/galleryController');

// All routes are protected
router.use(protect);

// Get all photos
router.get('/', getPhotos);

// Upload photo
router.post('/upload', uploadSingle, uploadPhoto);

// Get single photo
router.get('/:id', getPhoto);

// Update photo
router.put('/:id', updatePhoto);

// Delete photo
router.delete('/:id', deletePhoto);

// Like photo
router.post('/:id/like', likePhoto);

// Unlike photo
router.delete('/:id/like', unlikePhoto);

// Add comment to photo
router.post('/:id/comment', addComment);

module.exports = router;