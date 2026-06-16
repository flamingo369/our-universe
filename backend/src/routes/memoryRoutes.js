const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory
} = require('../controllers/memoryController');

// All routes are protected
router.use(protect);

// Get all memories
router.get('/', getMemories);

// Create memory
router.post('/', createMemory);

// Get single memory
router.get('/:id', getMemory);

// Update memory
router.put('/:id', updateMemory);

// Delete memory
router.delete('/:id', deleteMemory);

module.exports = router;