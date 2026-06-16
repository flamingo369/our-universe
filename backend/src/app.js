const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorMiddleware = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const letterRoutes = require('./routes/letterRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const bucketRoutes = require('./routes/bucketRoutes');
const capsuleRoutes = require('./routes/capsuleRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/bucket-list', bucketRoutes);
app.use('/api/capsules', capsuleRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Our Universe API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Our Universe API',
    description: 'Private space for Ajesh & Shofi',
    version: '1.0.0'
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;