const { pool } = require('../../config/database');

const Category = {
  // Get all categories (with parent info)
  getAll: async () => {
    const [rows] = await pool.execute(`
      SELECT c.*, p.name as parent_name 
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.parent_id, c.name
    `);
    return rows;
  },

  // Get category by ID
  getById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Create category
  create: async (categoryData) => {
    const { parent_id, name, slug, status } = categoryData;
    const [result] = await pool.execute(
      'INSERT INTO categories (parent_id, name, slug, status) VALUES (?, ?, ?, ?)',
      [parent_id || null, name, slug, status || 1]
    );
    return { id: result.insertId, ...categoryData };
  },

  // Update category
  update: async (id, categoryData) => {
    const { parent_id, name, slug, status } = categoryData;
    await pool.execute(
      'UPDATE categories SET parent_id = ?, name = ?, slug = ?, status = ? WHERE id = ?',
      [parent_id || null, name, slug, status || 1, id]
    );
    return { id, ...categoryData };
  },

  // Delete category
  delete: async (id) => {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  },

  // Update status
  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE categories SET status = ? WHERE id = ?',
      [status, id]
    );
    return true;
  }
};

module.exports = Category;
