const express = require('express');
const businessController = require('../controllers/businessController');
const contactController = require('../controllers/contactController');
const router = express.Router();

// ================= USER SIDE ROUTES =================

// Tour List
router.get('/about-us', businessController.aboutUs);
router.get('/cancellation-policy', businessController.cancellationPolicy);
router.get('/privacy-policy', businessController.privacyPolicy);
router.get('/terms-and-conditions', businessController.termsAndConditions);
router.post('/contact', contactController.store);
router.get('/contact', contactController.getAll);

module.exports = router;
