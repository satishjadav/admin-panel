const { pool } = require('../../config/database');

const Order = {
  // Get all orders with filters
  getAll: async (filters = {}, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, c.name as customer_name, c.email as customer_email,
             COUNT(oi.id) as items_count,
             SUM(oi.total) as order_total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
    const params = [];
    const countParams = [];

    // Apply filters
    if (filters.order_status) {
      query += ' AND o.order_status = ?';
      countQuery += ' AND o.order_status = ?';
      params.push(filters.order_status);
      countParams.push(filters.order_status);
    }

    if (filters.payment_status) {
      query += ' AND o.payment_status = ?';
      countQuery += ' AND o.payment_status = ?';
      params.push(filters.payment_status);
      countParams.push(filters.payment_status);
    }

    if (filters.payment_method) {
      query += ' AND o.payment_method = ?';
      countQuery += ' AND o.payment_method = ?';
      params.push(filters.payment_method);
      countParams.push(filters.payment_method);
    }

    if (filters.start_date && filters.end_date) {
      query += ' AND DATE(o.created_at) BETWEEN ? AND ?';
      countQuery += ' AND DATE(o.created_at) BETWEEN ? AND ?';
      params.push(filters.start_date, filters.end_date);
      countParams.push(filters.start_date, filters.end_date);
    }

    if (filters.search) {
      query += ' AND (o.order_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)';
      countQuery += ' AND (o.order_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    const [countRows] = await pool.execute(countQuery, countParams);

    return {
      orders: rows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  },

  // Get order by ID with details
  getById: async (id) => {
    // Get order info
    const [orderRows] = await pool.execute(
      `SELECT o.*, c.name as customer_name, c.email as customer_email, 
              c.mobile as customer_mobile
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    // Get order items
    const [itemRows] = await pool.execute(
      `SELECT oi.*, p.name as product_name, p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    if (orderRows.length === 0) return null;

    return {
      ...orderRows[0],
      items: itemRows
    };
  },

  // Update order status
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  },

  // Update payment status
  updatePaymentStatus: async (id, status) => {
    await pool.execute(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  }
};

module.exports = Order;
