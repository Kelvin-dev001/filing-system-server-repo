const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// For single file (passport photo, attachment, etc)
router.post('/single', uploadController.singleFileUpload);

// For multiple files (if needed)
router.post('/multiple', uploadController.multipleFilesUpload);

module.exports = router;