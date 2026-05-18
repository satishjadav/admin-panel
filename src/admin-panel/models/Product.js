const { pool } = require('../../config/database');

const Product = {
  // Get all products
  getAll: async () => {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  // Get product by ID
  getById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Create product
  create: async (productData) => {
    const { name, description, price, category_id, stock, image, status } = productData;
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, category_id, stock, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, stock, image, status || 1]
    );
    return { id: result.insertId, ...productData };
  },

  // Update product
  update: async (id, productData) => {
    const { name, description, price, category_id, stock, image, status } = productData;
    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ?, image = ?, status = ? WHERE id = ?',
      [name, description, price, category_id, stock, image, status, id]
    );
    return { id, ...productData };
  },

  // Delete product
  delete: async (id) => {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return true;
  },

  // Update status
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE products SET status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  },

  // Update stock
  updateStock: async (id, quantity) => {
    await pool.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, id]
    );
    return true;
  }
};

module.exports = Product;
