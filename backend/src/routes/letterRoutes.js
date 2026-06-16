const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getLetters,
  getLetter,
  createLetter,
  updateLetter,
  deleteLetter,
  getSentCount,
  getReceivedCount
} = require('../controllers/letterController');

// All routes are protected
router.use(protect);

// Get letter stats
router.get('/stats/sent', getSentCount);
router.get('/stats/received', getReceivedCount);

// Get all letters
router.get('/', getLetters);

// Create a new letter
router.post('/', createLetter);

// Get single letter
router.get('/:id', getLetter);

// Update a letter
router.put('/:id', updateLetter);

// Delete a letter
router.delete('/:id', deleteLetter);

module.exports = router;