const Razorpay = require("razorpay");
const crypto = require("crypto");
const TourOrderManagement = require('../models/tourOrders');
const { sendWhatsAppMessage } = require('../../utils/whatsappcopy');
const BusinessSetting = require("../../models/business_setting");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to format phone number for WhatsApp (add +91 for India)
const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If it's 10 digits, add 91 (India country code)
  if (digits.length === 10) {
    return '91' + digits;
  }
  // If it already has country code, just add +
  if (digits.length === 12) {
    return digits;
  }
  return phone;
};

// ✅ CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount, booking_data } = req.body;

    if (!booking_data) {
      return res.status(400).json({ error: "Booking data is required" });
    }

    // Parse booking_data if it's a string
    const bookingData = typeof booking_data === 'string'
      ? JSON.parse(booking_data)
      : booking_data;

    // Calculate GST (assuming 18% GST)
    const taxSetting = await BusinessSetting.findOne({
      where: { key: 'tax' }
    });
    const GST_PERCENTAGE = taxSetting ? Number(taxSetting.value) : 0;

    // Calculate GST amount
    const gstPrice = ((bookingData.single_amount) * GST_PERCENTAGE) / 100;

    // Calculate base price per person
    // const pricePerPerson = ((bookingData.total_amount - gstPrice) / bookingData.qty);
    

    // Calculate final price (total amount + GST)
    const finalPrice = bookingData.total_amount;

    // Parse date_time to separate travel_date and travel_time
    let travelDate, travelTime;
    if (bookingData.date_time) {
      const dateObj = new Date(bookingData.date_time);
      travelDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      travelTime = dateObj.toTimeString().split(' ')[0]; // HH:MM:SS
    } else {
      const now = new Date();
      travelDate = now.toISOString().split('T')[0];
      travelTime = now.toTimeString().split(' ')[0];
    }

    // Create booking record in tour_orders table
    const bookingRecord = await TourOrderManagement.create({
      tour_id: bookingData.tour_id || 0,
      user_id: 0, // Default to 0 or get from auth if available
      phone_number: bookingData.phone_number || '9999999999',
      pickup_address: bookingData.pickup_location || '',
      pickup_lat: bookingData.pickup_lat || null,
      pickup_long: bookingData.pickup_long || null,
      drop_address: bookingData.drop_location || bookingData.pickup_location || '',
      drop_lat: bookingData.drop_lat || null,
      drop_long: bookingData.drop_long || null,
      travel_date: travelDate,
      travel_time: travelTime,
      qty: bookingData.qty || 1,
      min_price: bookingData.single_amount,
      pay_price: amount,
      price: bookingData.total_amount || 0,
      gst: GST_PERCENTAGE,
      gst_price: gstPrice,
      final_price: finalPrice,
      transaction_id: null, // Will be updated after payment
      payment_status: 'pending',
      payment_method: null, // Map to your ENUM values
      payment_type: bookingData.payment_type || 'full',
      // created_at and updated_at are auto-generated
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
      notes: {
        booking_id: bookingRecord.id, // Store booking ID in Razorpay notes
        tour_id: bookingData.tour_id,
        payment_type: bookingData.payment_type || 'full',
        total_amount: bookingData.total_amount.toString()
      }
    });

    // Update booking record with Razorpay order ID
    await bookingRecord.update({
      transaction_id: order.id
    });

    // Return order with booking ID
    res.json({
      ...order,
      booking_id: bookingRecord.id,
      booking_record: {
        id: bookingRecord.id,
        tour_id: bookingRecord.tour_id,
        final_price: bookingRecord.final_price,
        payment_status: bookingRecord.payment_status,
        travel_date: bookingRecord.travel_date,
        travel_time: bookingRecord.travel_time
      }
    });

  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      error: err.message,
      details: "Failed to create booking order"
    });
  }
};

// ✅ VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id
    } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment successful - update booking record
      const bookingRecord = await TourOrderManagement.findByPk(booking_id);

      if (!bookingRecord) {
        return res.status(404).json({ error: "Booking not found" });
      }
      let paymentMethod = 'card'; // default
      let razorpayMethod = null;
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        razorpayMethod = payment.method;

        const methodMap = {
          'card': 'card',
          'credit_card': 'card',
          'debit_card': 'card',
          'netbanking': 'netbanking',
          'wallet': 'wallet',
          'upi': 'upi',
          'emandate': 'upi',
          'cardless_emi': 'card',
          'paylater': 'card',
          // Add more as needed
        };

        paymentMethod = methodMap[razorpayMethod] || 'card';
      } catch (fetchError) {
        console.warn("Could not fetch payment details:", fetchError);
      }

      await bookingRecord.update({
        transaction_id: razorpay_payment_id,
        payment_status: 'paid',
        payment_method: paymentMethod,
        updated_at: new Date()
      });

      // Send WhatsApp message to user after successful booking
      try {
        const whatsappPhone = formatPhoneForWhatsApp(bookingRecord.phone_number);
        console.log(` ${whatsappPhone}`);
        if (whatsappPhone) {
          const message = `🎉 Booking Confirmed!%0A%0ABooking ID: ${bookingRecord.id}%0ATour ID: ${bookingRecord.tour_id}%0ATravel Date: ${bookingRecord.travel_date}%0APickup: ${bookingRecord.pickup_address}%0APersons: ${bookingRecord.qty}%0AAmount Paid: ₹${bookingRecord.pay_price}%0APayment Status: ${bookingRecord.payment_status}%0A%0AThank you for booking with us!`;

          await sendWhatsAppMessage(whatsappPhone, message);
          console.log(`WhatsApp message sent successfully for booking ${bookingRecord.id}`);
        }
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError);
      }

      res.json({
        success: true,
        message: "Payment verified and booking confirmed",
        booking_id: bookingRecord.id
      });
    } else {
      // Signature verification failed
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const bookingRecord = await TourOrderManagement.findByPk(booking_id);

    if (!bookingRecord) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      success: true,
      data: bookingRecord
    });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.paymentFailed = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      error_code,
      error_description,
      error_reason,
      booking_id
    } = req.body;

    // Find booking record
    const bookingRecord = await TourOrderManagement.findByPk(booking_id);

    if (!bookingRecord) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking status to failed
    await bookingRecord.update({
      payment_status: 'failed',
      updated_at: new Date()
    });

    // Log the failure for debugging
    console.log(`Payment failed for booking ${booking_id}:`, {
      error_code,
      error_description,
      error_reason,
      razorpay_order_id,
      razorpay_payment_id
    });

    res.json({
      success: true,
      message: "Payment failure recorded",
      booking_id: bookingRecord.id,
      payment_status: 'failed'
    });
  } catch (err) {
    console.error("Payment failure update error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.paymentAbandoned = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      booking_id,
      reason
    } = req.body;

    // Find booking record
    const bookingRecord = await TourOrderManagement.findByPk(booking_id);

    if (!bookingRecord) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Don't change status from paid to abandoned
    if (bookingRecord.payment_status !== 'paid') {
      // Log abandonment (you might want to keep status as pending for retry)
      console.log(`Payment abandoned for booking ${booking_id}:`, {
        reason,
        razorpay_order_id
      });

      // Optionally, you could create a separate field for abandonment tracking
      // For now, we'll just log it
    }

    res.json({
      success: true,
      message: "Payment abandonment recorded",
      booking_id: bookingRecord.id,
      current_status: bookingRecord.payment_status
    });
  } catch (err) {
    console.error("Payment abandonment update error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    // Find booking by Razorpay order ID
    const bookingRecord = await TourOrderManagement.findOne({
      where: { transaction_id: order_id }
    });

    if (!bookingRecord) {
      return res.status(404).json({ error: "Booking not found for this order" });
    }

    // Optional: Check with Razorpay API for real-time status
    let razorpayStatus = null;
    try {
      const razorpayOrder = await razorpay.orders.fetch(order_id);
      razorpayStatus = razorpayOrder.status;
    } catch (razorpayError) {
      console.warn("Could not fetch Razorpay order status:", razorpayError);
    }

    res.json({
      success: true,
      booking_id: bookingRecord.id,
      payment_status: bookingRecord.payment_status,
      razorpay_status: razorpayStatus,
      order_details: {
        amount: bookingRecord.final_price,
        tour_id: bookingRecord.tour_id,
        travel_date: bookingRecord.travel_date,
        qty: bookingRecord.qty
      }
    });
  } catch (err) {
    console.error("Check payment status error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.retryPayment = async (req, res) => {
  try {
    const { booking_id } = req.body;

    const bookingRecord = await TourOrderManagement.findByPk(booking_id);

    if (!bookingRecord) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only allow retry for failed or pending payments
    if (!['pending', 'failed'].includes(bookingRecord.payment_status)) {
      return res.status(400).json({
        error: `Cannot retry payment with status: ${bookingRecord.payment_status}`
      });
    }

    // Create new Razorpay order
    const amountToPay = bookingRecord.final_price;

    const newOrder = await razorpay.orders.create({
      amount: amountToPay * 100,
      currency: "INR",
      receipt: "rcpt_retry_" + Date.now(),
      notes: {
        booking_id: bookingRecord.id,
        tour_id: bookingRecord.tour_id,
        payment_type: bookingRecord.payment_type,
        is_retry: 'true'
      }
    });

    // Update booking with new transaction ID
    await bookingRecord.update({
      transaction_id: newOrder.id,
      payment_status: 'pending', // Reset to pending
      updated_at: new Date()
    });

    res.json({
      success: true,
      order_id: newOrder.id,
      booking_id: bookingRecord.id,
      amount: amountToPay
    });

  } catch (err) {
    console.error("Retry payment error:", err);
    res.status(500).json({ error: err.message });
  }
};