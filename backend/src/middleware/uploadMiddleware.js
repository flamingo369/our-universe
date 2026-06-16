const multer = require('multer');

// Use memory storage for uploading to Supabase Storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// File filter for all files
const anyFilter = (req, file, cb) => {
  cb(null, true);
};

// Upload single image (profile photo, gallery photo, etc.)
const uploadSingle = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: imageFilter
}).single('photo');

// Upload multiple images
const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Max 10 files
  },
  fileFilter: imageFilter
}).array('photos', 10);

// Upload any file type (for attachments)
const uploadAny = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: anyFilter
}).single('file');

// Error handling wrapper
const handleUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  uploadAny: handleUpload(uploadAny),
  storage
};