const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCapsules,
  getCapsule,
  createCapsule,
  updateCapsule,
  deleteCapsule,
  unlockCapsule
} = require('../controllers/capsuleController');

// All routes are protected
router.use(protect);

// Get all time capsules
router.get('/', getCapsules);

// Create time capsule
router.post('/', createCapsule);

// Get single time capsule
router.get('/:id', getCapsule);

// Update time capsule
router.put('/:id', updateCapsule);

// Unlock time capsule
router.post('/:id/unlock', unlockCapsule);

// Delete time capsule
router.delete('/:id', deleteCapsule);

module.exports = router;