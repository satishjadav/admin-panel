const express = require('express');
const businessController = require('../controllers/businessController');
const router = express.Router();

// ================= USER SIDE ROUTES =================

// Tour List
router.get('/about-us', businessController.aboutUs);
router.get('/cancellation-policy', businessController.cancellationPolicy);
router.get('/privacy-policy', businessController.privacyPolicy);
router.get('/terms-and-conditions', businessController.termsAndConditions);

module.exports = router;
