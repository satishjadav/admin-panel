const express = require('express');
const multer = require('multer');
const upload = multer();
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
router.post('/inquery', contactController.storeInquiry);
router.get('/contact', contactController.getAll);

router.post('/send-booking-success', upload.none(), businessController.sendBookingSuccessNotification);

module.exports = router;
