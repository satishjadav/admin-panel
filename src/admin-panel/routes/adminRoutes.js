const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.login);

// Protected routes
router.get('/profile', verifyToken, adminController.getProfile);
router.post('/update-fcm-token', verifyToken, adminController.updateFcmToken);

module.exports = router;