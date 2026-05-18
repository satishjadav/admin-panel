const express = require('express');
const router = express.Router();
const BusinessSettingController = require('../controllers/BusinessSettingController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', verifyToken, isAdmin, BusinessSettingController.getGSTSettings);
router.post('/update', verifyToken, isAdmin, BusinessSettingController.updateGSTSettings);

router.get('/settings-get', verifyToken, isAdmin, BusinessSettingController.getBusinessSettings);
router.post('/settings-update', verifyToken, isAdmin, BusinessSettingController.updateBusinessSettings);

module.exports = router;
