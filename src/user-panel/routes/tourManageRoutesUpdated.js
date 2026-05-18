const express = require('express');
const router = express.Router();
const tourManageController = require('../controllers/tourManageControllerUpdated');
const orderController = require('../../admin-panel/controllers/orderControllerNew');

// ================= USER SIDE ROUTES =================

// Tour List
router.get('/tours', tourManageController.tourList);

// Tour Details
router.get('/tour/:id', tourManageController.tourDetails);

// Create Booking (without login - phone number only)
router.post('/booking', tourManageController.createBooking);

// Get Order Details
router.get('/get/:id', orderController.getOrderById);

// Get Invoice
router.get('/invoice/:id', orderController.getOrderInvoice);

module.exports = router;
