const express = require('express');
const router = express.Router();
const { protect, optional } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
  uploadProfilePhoto
} = require('../controllers/authController');

// Public routes
router.post('/signup', optional, signup);
router.post('/login', optional, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.post('/uploadphoto', protect, uploadSingle, uploadProfilePhoto);

module.exports = router;