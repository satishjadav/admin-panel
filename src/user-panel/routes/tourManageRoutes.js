const express = require('express');
const router = express.Router();
const tourManageController = require('../controllers/tourManageController');
const orderController = require('../../admin-panel/controllers/orderController');

// ================= USER SIDE ROUTES =================

// Tour List
router.get('/tours', tourManageController.tourList);

// Tour Details
router.get('/tour/:id', tourManageController.tourDetails);

router.get('/get/:id', orderController.getOrderById);
router.get('/invoice/:id', orderController.getOrderInvoice);

module.exports = router;
