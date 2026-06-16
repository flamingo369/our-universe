const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  addReaction,
  removeReaction
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

// Get messages for a room
router.get('/messages/:room', getMessages);

// Send a message
router.post('/messages', sendMessage);

// Mark message as read
router.put('/messages/:id/read', markAsRead);

// Delete a message
router.delete('/messages/:id', deleteMessage);

// Add reaction to message
router.post('/messages/:id/reactions', addReaction);

// Remove reaction from message
router.delete('/messages/:id/reactions/:emoji', removeReaction);

module.exports = router;