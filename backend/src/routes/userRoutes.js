const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  getPartner,
  updateSettings,
  linkPartner
} = require('../controllers/userController');

// All routes are protected
router.use(protect);

// Get all users
router.get('/', getUsers);

// Get partner
router.get('/partner', getPartner);

// Update settings (location, theme, etc.)
router.put('/settings', updateSettings);

// Link partner
router.put('/partner/link', linkPartner);

// Get user by ID
router.get('/:id', getUserById);

module.exports = router;