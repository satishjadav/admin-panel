const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/stats', verifyToken, isAdmin, dashboardController.getStats);
router.get('/analytics', verifyToken, isAdmin, dashboardController.getSalesAnalytics);

module.exports = router;