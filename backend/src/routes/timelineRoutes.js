const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTimeline,
  getTimelineEvent,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
} = require('../controllers/timelineController');

// All routes are protected
router.use(protect);

// Get all timeline events
router.get('/', getTimeline);

// Create timeline event
router.post('/', createTimelineEvent);

// Get single timeline event
router.get('/:id', getTimelineEvent);

// Update timeline event
router.put('/:id', updateTimelineEvent);

// Delete timeline event
router.delete('/:id', deleteTimelineEvent);

module.exports = router;