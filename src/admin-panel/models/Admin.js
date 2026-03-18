const { pool } = require('../../config/database');

const Admin = {
  // Find admin by email
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  // Find admin by ID
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, status, last_login_at, created_at FROM admins WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Update last login
  updateLastLogin: async (id) => {
    await pool.execute(
      'UPDATE admins SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
  }
};

module.exports = Admin;
