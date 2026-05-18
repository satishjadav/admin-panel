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
  },

  // Update FCM token
  updateFcmToken: async (id, token) => {
    await pool.execute(
      'UPDATE admins SET cm_firebase_token = ? WHERE id = ?',
      [token, id]
    );
  },

  // Get all admin FCM tokens
  getAllFcmTokens: async () => {
    const [rows] = await pool.execute(
      'SELECT cm_firebase_token FROM admins WHERE cm_firebase_token IS NOT NULL AND status = 1'
    );
    return rows.map(r => r.cm_firebase_token);
  }
};

module.exports = Admin;
