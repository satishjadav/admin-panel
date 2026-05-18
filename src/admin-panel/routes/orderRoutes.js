const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
router.get('/stats', verifyToken, isAdmin, orderController.getOrderStats);
router.get('/:id', verifyToken, isAdmin, orderController.getOrderById);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;