// controllers/tourOrderController.js
const { Op } = require('sequelize');
const easyInvoice = require('easyinvoice');
// const TourOrderManagement = require('../models/TourOrderManagement');
const User = require('../models/Customer');
const Tour = require('../models/TourManagement');
const { TourOrderManagement, TourManagement } = require('../models/associations');

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

exports.getOrderInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await TourOrderManagement.findOne({
      where: { id: orderId },
      include: [
        { model: TourManagement, as: 'tour', attributes: ['tour_name'] }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customer details
    const customer = {
      name: "Customer",
      phone: order.phone_number || 'N/A',
      email: "",
    };

    // Calculate unit price safely
    const quantity = order.qty || 1;
    const unitPrice = quantity > 0 ? (order.price / quantity) : order.price;

    const products = [
      {
        quantity: quantity,
        description: `${order.tour?.tour_name || 'Tour'} - Per Head`,
        tax: order.gst || 0,
        price: unitPrice,
      }
    ];

    const invoiceData = {
      apiKey: 'free',
      mode: 'development',
      sender: {
        company: "Mahakal AstroTech Pvt Ltd",
        address: "2nd Floor, 22, Athrav Building, Near Vasavada Petrol Pump, Freganj, Ujjain (M.P.) 456010 India",
        zip: "456010",
        city: "Ujjain",
        country: "India"
      },
      client: {
        company: customer.name,
        address: "",
        zip: "",
        city: "",
        country: "",
        custom1: `Phone: ${customer.phone}`,
        custom2: `Email: ${customer.email}`,
      },
      information: {
        number: `TO${order.id}`,
        date: new Date(order.created_at).toLocaleDateString('en-GB'),
        "due-date": new Date(order.created_at).toLocaleDateString('en-GB')
      },
      products: products,
      settings: {
        currency: "INR",
        locale: "en-IN",
        "tax-notation": "gst",
        "margin-top": 25,
        "margin-right": 25,
        "margin-left": 25,
        "margin-bottom": 25,
      }
    };

    // Create invoice
    const result = await easyinvoice.createInvoice(invoiceData);

    const pdfBuffer = Buffer.from(result.pdf, 'base64');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message // Remove this in production
    });
  }
};
// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const order = await TourOrderManagement.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({
      payment_status,
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

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await TourOrderManagement.count();
    const pendingOrders = await TourOrderManagement.count({
      where: { payment_status: 'pending' }
    });
    const paidOrders = await TourOrderManagement.count({
      where: { payment_status: 'paid' }
    });
    const failedOrders = await TourOrderManagement.count({
      where: { payment_status: 'failed' }
    });

    const totalRevenue = await TourOrderManagement.sum('final_price', {
      where: { payment_status: 'paid' }
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