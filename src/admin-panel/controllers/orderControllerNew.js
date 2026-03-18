// controllers/tourOrderController.js
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const { TourOrderManagement, TourManagement } = require('../../models');
const { sendWhatsAppMessage } = require('../../utils/whatsappcopy');

// Order status constants
const ORDER_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  PICKED: 2,
  DROPPED: 3,
  REFUNDED: 4,
  CANCELLED: 5,
  COMPLETED: 6
};

// Helper function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  if (digits.length === 12) {
    return digits;
  }
  return phone;
};

// Get all tour orders with optional filters
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      payment_status,
      payment_type,
      sortBy = 'created_at',
      order = 'DESC',
      pageName = null
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { pickup_address: { [Op.like]: `%${search}%` } },
        { drop_address: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { transaction_id: { [Op.like]: `%${search}%` } }
      ];
    }

    if (payment_status) {
      whereConditions.payment_status = payment_status;
    }

    if (payment_type) {
      whereConditions.payment_type = payment_type;
    }
    if (pageName == 'pending') {
      whereConditions.order_status = 0;
    } else if (pageName == 'confirm') {
      whereConditions.order_status = 1;
    } else if (pageName == 'pick') {
      whereConditions.order_status = 2;
    } else if (pageName == 'complete') {
      whereConditions.order_status = 3;
    } else if (pageName == 'refund') {
      whereConditions.order_status = 4;
    } else if (pageName == 'cancel') {
      whereConditions.order_status = 5;
    }
    // Fetch orders with pagination and tour details
    const { count, rows: orders } = await TourOrderManagement.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: TourManagement,
          as: 'tour',
          attributes: ['id', 'tour_name', 'image', 'days', 'price']
        }
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tour orders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await TourOrderManagement.findOne({
      where: { id },
      include: [
        {
          model: TourManagement,
          as: 'tour',
          attributes: ['id', 'tour_name', 'description', 'image', 'days', 'locations', 'itinerary', 'include', 'exclude']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order invoice
exports.getOrderInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await TourOrderManagement.findOne({
      where: { id: orderId },
      include: [{ model: TourManagement, as: 'tour', attributes: ['tour_name', 'days', 'description', 'image'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.id}.pdf`);
      res.send(pdfBuffer);
    });

    // ========== COMPANY HEADER ==========
    doc.fillColor('#1a237e').fontSize(24).font('Helvetica-Bold').text('BitCat ', 40, 40);
    doc.fillColor('#666').fontSize(9).font('Helvetica').text('ujjain mp', 40, 70);
    doc.text('Freganj, Ujjain (M.P.) 456010, India', 40, 82);
    doc.text('GSTIN: N/A', 40, 94);

    // Invoice Box
    doc.rect(380, 35, 175, 70).stroke('#1a237e');
    doc.fillColor('#1a237e').fontSize(12).font('Helvetica-Bold').text('INVOICE', 390, 45);
    doc.fillColor('#333').fontSize(9).font('Helvetica').text(`Invoice No: TO-${order.id.toString().padStart(6, '0')}`, 390, 62);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-GB')}`, 390, 76);
    doc.text(`Order Status: ${order.order_status || 'Confirmed'}`, 390, 90);

    // ========== CUSTOMER DETAILS ==========
    doc.fillColor('#1a237e').fontSize(12).font('Helvetica-Bold').text('BILL TO', 40, 125);
    doc.fillColor('#333').fontSize(10).font('Helvetica');
    doc.text(`Customer Name: ${order.customer_name || 'N/A'}`, 40, 145);
    doc.text(`Phone: ${order.phone_number || 'N/A'}`, 40, 159);
    doc.text(`Email: ${order.email || 'N/A'}`, 40, 173);

    // ========== TRAVEL DETAILS ==========
    doc.fillColor('#1a237e').fontSize(12).font('Helvetica-Bold').text('TRAVEL DETAILS', 300, 125);
    doc.fillColor('#333').fontSize(10).font('Helvetica');
    doc.text(`Travel Date: ${order.travel_date ? new Date(order.travel_date).toLocaleDateString('en-GB') : 'N/A'}`, 300, 145);
    doc.text(`Travel Time: ${order.travel_time || 'N/A'}`, 300, 159);
    doc.text(`Passengers: ${order.qty || 1} Person(s)`, 300, 173);

    // ========== TOUR DETAILS ==========
    doc.fillColor('#1a237e').rect(40, 195, 515, 25).fill();
    doc.fillColor('#fff').fontSize(12).font('Helvetica-Bold').text('TOUR DETAILS', 50, 202);

    doc.fillColor('#333').fontSize(10).font('Helvetica-Bold');
    doc.text('Tour Name:', 40, 235);
    doc.font('Helvetica').text(order.tour?.tour_name || 'Tour Package', 120, 235);

    doc.font('Helvetica-Bold').text('Duration:', 40, 252);
    doc.font('Helvetica').text(`${order.tour?.days || 'N/A'} Days`, 120, 252);

    doc.font('Helvetica-Bold').text('Pickup Location:', 40, 269);
    doc.font('Helvetica').text(order.pickup_address || 'N/A', 140, 269, { width: 400 });

    doc.font('Helvetica-Bold').text('Drop Location:', 40, 286);
    doc.font('Helvetica').text(order.drop_address || 'N/A', 140, 286, { width: 400 });

    // ========== PRICING TABLE ==========
    const tableY = 330;

    // Table Header
    doc.fillColor('#1a237e').rect(40, tableY, 515, 25).fill();
    doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, tableY + 7);
    doc.text('Qty', 280, tableY + 7, { width: 40, align: 'center' });
    doc.text('Rate (₹)', 330, tableY + 7, { width: 70, align: 'right' });
    doc.text('GST (%)', 410, tableY + 7, { width: 50, align: 'center' });
    doc.text('Amount (₹)', 470, tableY + 7, { width: 75, align: 'right' });

    // Table Row
    const rowY = tableY + 25;
    doc.fillColor('#f5f5f5').rect(40, rowY, 515, 30).fill();
    doc.fillColor('#333').fontSize(9).font('Helvetica');

    const unitPrice = order.qty > 0 ? (Number(order.price) / order.qty) : (Number(order.price) || 0);
    doc.text(`${order.tour?.tour_name || 'Tour Package'} - Per Person`, 50, rowY + 9, { width: 220 });
    doc.text(order.qty?.toString() || '1', 280, rowY + 9, { width: 40, align: 'center' });
    doc.text(unitPrice.toFixed(2), 330, rowY + 9, { width: 70, align: 'right' });
    doc.text(`${order.gst || 0}%`, 410, rowY + 9, { width: 50, align: 'center' });
    doc.text((Number(order.price) || 0).toFixed(2), 470, rowY + 9, { width: 75, align: 'right' });

    // ========== TOTALS SECTION ==========
    const totalsY = rowY + 50;

    doc.fillColor('#666').fontSize(10).text('Subtotal:', 380, totalsY);
    doc.fillColor('#333').text(`₹${(Number(order.price) || 0).toFixed(2)}`, 490, totalsY, { width: 60, align: 'right' });

    doc.fillColor('#666').text(`GST (${order.gst || 0}%):`, 380, totalsY + 18);
    doc.fillColor('#333').text(`₹${(Number(order.gst_price) || 0).toFixed(2)}`, 490, totalsY + 18, { width: 60, align: 'right' });

    doc.strokeColor('#ddd').moveTo(380, totalsY + 35).lineTo(555, totalsY + 35).stroke();

    doc.fillColor('#1a237e').fontSize(14).font('Helvetica-Bold').text('TOTAL:', 380, totalsY + 45);
    doc.text(`₹${(Number(order.final_price) || 0).toFixed(2)}`, 490, totalsY + 45, { width: 60, align: 'right' });

    // ========== PAYMENT DETAILS ==========
    const paymentY = totalsY + 80;
    doc.fillColor('#1a237e').fontSize(11).font('Helvetica-Bold').text('PAYMENT INFORMATION', 40, paymentY);
    doc.fillColor('#333').fontSize(10).font('Helvetica');
    doc.text(`Payment Status: ${(order.payment_status || 'Pending').toUpperCase()}`, 40, paymentY + 18);
    doc.text(`Payment Method: ${order.payment_method || 'N/A'}`, 40, paymentY + 34);
    doc.text(`Payment Type: ${order.payment_type || 'N/A'}`, 40, paymentY + 50);
    doc.text(`Transaction ID: ${order.transaction_id || 'N/A'}`, 40, paymentY + 66);

    // ========== FOOTER ==========
    doc.fillColor('#999').fontSize(9).font('Helvetica');
    doc.text('Thank you for choosing Mahakal AstroTech Pvt Ltd!', 40, 750, { align: 'center', width: 515 });
    doc.text('For any queries, contact us at support@mahakalastrotech.com', 40, 765, { align: 'center', width: 515 });

    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (payment status)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, order_id } = req.body;
    if (!order_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }
    const order = await TourOrderManagement.findOne({
      where: { id: order_id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({
      order_status: status,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.OrderAmountCollect = async (req, res) => {
  try {
    const { order_id, amount } = req.body;
    if (!order_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order id and amount required"
      });
    }
    const order = await TourOrderManagement.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    // check payment type
    if (order.payment_type !== "partial") {
      return res.status(400).json({
        success: false,
        message: "This order is not partial payment"
      });
    }
    const newAmount = parseFloat(amount);
    const currentPay = parseFloat(order.pay_price || 0);
    const finalPrice = parseFloat(order.final_price);
    const updatedPayPrice = currentPay + newAmount;
    if (updatedPayPrice > finalPrice) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeds remaining balance"
      });
    }
    // update pay_price
    order.pay_price = updatedPayPrice;
    // update payment status
    if (updatedPayPrice === finalPrice) {
      order.payment_status = "paid";
      order.payment_type = "full";
    }
    await order.save();
    return res.json({
      success: true,
      message: "Payment collected successfully",
      data: order
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// Update tour booking status (order_status)
exports.updateTourOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, notify_customer = true } = req.body;

    const order = await TourOrderManagement.findByPk(id, {
      include: [{ model: TourManagement, as: 'tour' }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({
      order_status: parseInt(order_status),
      updated_at: new Date()
    });

    // Send WhatsApp notification if enabled
    if (notify_customer) {
      try {
        const statusMessages = {
          0: 'Pending - Your booking is under review',
          1: 'Confirmed - Your booking has been confirmed!',
          2: 'Picked - Your pickup has been arranged',
          3: 'Dropped - You have been dropped safely',
          4: 'Refunded - Your payment has been refunded',
          5: 'Cancelled - Your booking has been cancelled',
          6: 'Completed - Thank you for traveling with us!'
        };

        const message = `📋 Booking Update %0A%0ABooking ID: ${order.id}%0AStatus: ${statusMessages[order_status]}%0A%0ATour: ${order.tour?.tour_name || 'N/A'}%0ADate: ${order.travel_date}%0A%0AThank you!`;

        const whatsappPhone = formatPhoneForWhatsApp(order.phone_number);
        if (whatsappPhone) {
          await sendWhatsAppMessage(whatsappPhone, message);
        }
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError);
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating tour order status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {

    const { order_type } = req.query;

    let whereCondition = {};

    // agar order_type pass hua hai
    if (order_type !== undefined) {
      whereCondition.order_status = order_type;
    }

    const totalOrders = await TourOrderManagement.count({
      where: whereCondition
    });

    const pendingOrders = await TourOrderManagement.count({
      where: { ...whereCondition, payment_status: 'pending' }
    });

    const paidOrders = await TourOrderManagement.count({
      where: { ...whereCondition, payment_status: 'paid' }
    });

    const failedOrders = await TourOrderManagement.count({
      where: { ...whereCondition, payment_status: 'failed' }
    });

    const totalRevenue = await TourOrderManagement.sum('final_price', {
      where: { ...whereCondition, payment_status: 'paid' }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        paidOrders,
        failedOrders,
        totalRevenue: totalRevenue || 0
      }
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search orders by tour name
exports.searchOrdersByTour = async (req, res) => {
  try {
    const { tour_name } = req.query;

    const orders = await TourOrderManagement.findAll({
      include: [
        {
          model: TourManagement,
          as: 'tour',
          where: {
            tour_name: { [Op.like]: `%${tour_name}%` }
          },
          attributes: ['id', 'tour_name', 'image']
        }
      ],
      limit: 50
    });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
