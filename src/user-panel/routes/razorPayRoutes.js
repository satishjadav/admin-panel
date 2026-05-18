const express = require("express");
const router = express.Router();
const razorpayCtrl = require("../controllers/razorpay");

router.post("/order", razorpayCtrl.createOrder);
router.post("/verify", razorpayCtrl.verifyPayment);
router.post('/payment-failed', razorpayCtrl.paymentFailed);
router.post('/payment-abandoned', razorpayCtrl.paymentAbandoned);
router.get('/check-payment/:order_id', razorpayCtrl.checkPaymentStatus);
router.post('/retry-payment', razorpayCtrl.retryPayment);
router.get('/booking/:booking_id', razorpayCtrl.getBookingDetails);


module.exports = router;
