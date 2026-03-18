const Customer = require('../models/Customer');
const TourOrderManagement = require('../models/TourOrderManagement');
const { Op, fn, col } = require('sequelize');
require('dotenv').config();

const customerController = {

  // Get all customers
  getAll: async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const customers = await Customer.findAll({
      where: whereCondition,
      // attributes: {
      //   include: [
      //     [fn('COUNT', col('TourOrderManagements.id')), 'total_orders']
      //   ]
      // },

      // include: [
      //   {
      //     model: TourOrderManagement,
      //     attributes: []
      //   }
      // ],

      // group: ['Customer.id'],

      order: [['id', 'DESC']],

      limit,
      offset

    });

    const total = await Customer.count({ where: whereCondition });

    res.json({
      success: true,
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  },

  // Get customer by ID
  getById: async (req, res) => {
    try {

      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: customer
      });

    } catch (error) {

      console.error('Get customer error:', error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });

    }
  },

  // Get customer orders
  getOrders: async (req, res) => {
    try {

      const orders = await Order.findAll({
        where: { customer_id: req.params.id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: orders
      });

    } catch (error) {

      console.error('Get customer orders error:', error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });

    }
  },

  // Update customer status
  updateStatus: async (req, res) => {
    try {

      const { status } = req.body;

      if (typeof status !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Status must be a number'
        });
      }

      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.update({ status });

      res.json({
        success: true,
        message: 'Customer status updated successfully'
      });

    } catch (error) {

      console.error('Update customer status error:', error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });

    }
  },

  Customerupdate: async (req, res) => {
    try {

      const { first_name, last_name, email, phone } = req.body;

      const customer = await Customer.findByPk(req.params.id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found"
        });
      }

      await customer.update({
        first_name,
        last_name,
        email,
        phone
      });

      res.json({
        success: true,
        message: "Customer updated successfully",
        customer
      });

    } catch (error) {

      console.error("Update customer error:", error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }
  },

};

module.exports = customerController;