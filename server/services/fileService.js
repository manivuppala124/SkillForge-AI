// server/services/fileService.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const createUploadsDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    await createUploadsDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.user.id}_${uniqueId}${fileExtension}`;
    cb(null, fileName);
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload resume function
const uploadResume = async (req, res, next) => {
  try {
    console.log(`📄 Processing resume upload for user ${req.user.id}: ${req.file.originalname}`);
    
    // File information
    const fileData = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      size: req.file.size,
      uploadedAt: new Date(),
      userId: req.user.id
    };

    // Add file data to request for controller
    req.uploadedFile = fileData;
    
    console.log(`✅ Resume uploaded successfully: ${req.file.filename}`);
    next();
    
  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Delete file function
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`🗑️ File deleted: ${filePath}`);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  upload: upload.single('resume'),
  uploadResume,
  deleteFile
};
