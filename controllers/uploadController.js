const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Single file upload
exports.singleFileUpload = [
  upload.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // Serve from /uploads/ in your static middleware
    res.json({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      path: `/uploads/${req.file.filename}`,
    });
  }
];

// Multiple files upload
exports.multipleFilesUpload = [
  upload.array('files', 10),
  (req, res) => {
    if (!req.files) return res.status(400).json({ message: "No files uploaded" });
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      path: `/uploads/${file.filename}`,
    }));
    res.json(files);
  }
];