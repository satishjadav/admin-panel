const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllerNew');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
router.get('/stats', verifyToken, isAdmin, orderController.getOrderStats);
router.get('/:id', verifyToken, isAdmin, orderController.getOrderById);
router.get('/invoice/:id', orderController.getOrderInvoice);

// Update payment status
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

// Update tour booking status (order_status: 0-6)
router.put('/:id/tour-status', verifyToken, isAdmin, orderController.updateTourOrderStatus);
router.post('/:id/update-order-status', orderController.updateOrderStatus);
router.post('/:id/collect-payment', orderController.OrderAmountCollect);

module.exports = router;
