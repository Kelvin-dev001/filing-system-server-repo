const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Create a new registration
router.post('/', registrationController.createRegistration);

// Get all registrations with pagination & search
router.get('/', registrationController.getRegistrations);

// Get a registration by ID
router.get('/:id', registrationController.getRegistrationById);

// Update a registration
router.put('/:id', registrationController.updateRegistration);

// Delete a registration (optional, for completeness)
router.delete('/:id', registrationController.deleteRegistration);

// Search registrations by name (legacy)
router.get('/search', registrationController.searchRegistrations);

module.exports = router;