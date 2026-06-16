const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBucketList,
  getBucketItem,
  createBucketItem,
  updateBucketItem,
  deleteBucketItem
} = require('../controllers/bucketController');

// All routes are protected
router.use(protect);

// Get all bucket list items
router.get('/', getBucketList);

// Create bucket list item
router.post('/', createBucketItem);

// Get single bucket list item
router.get('/:id', getBucketItem);

// Update bucket list item
router.put('/:id', updateBucketItem);

// Delete bucket list item
router.delete('/:id', deleteBucketItem);

module.exports = router;