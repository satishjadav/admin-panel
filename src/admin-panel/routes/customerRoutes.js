const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes protected
router.use(verifyToken, isAdmin);

// Get all customers
router.get('/', customerController.getAll);

// Get customer orders
router.get('/:id/orders', customerController.getOrders);

// Get customer by ID
router.get('/:id', customerController.getById);

// Update customer status
router.patch('/:id/status', customerController.updateStatus);
router.put('/:id', customerController.Customerupdate);

module.exports = router;