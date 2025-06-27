const express = require('express');
const router = express.Router();
const consularFileController = require('../controllers/consularFileController');

// Create a new consular file
router.post('/', consularFileController.createConsularFile);

// Get all consular files with pagination & search
router.get('/', consularFileController.getConsularFiles);

// Get a single consular file by ID
router.get('/:id', consularFileController.getConsularFileById);

// Update a consular file
router.put('/:id', consularFileController.updateConsularFile);

// Delete a consular file
router.delete('/:id', consularFileController.deleteConsularFile);

// Search by fileNumber (legacy)
router.get('/search', consularFileController.searchConsularFiles);

module.exports = router;