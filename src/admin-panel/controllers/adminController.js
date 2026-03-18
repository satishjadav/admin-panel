const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminController = {
  // Admin login
  login: async (req, res) => {
    // try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      // Find admin
      const admin = await Admin.findByEmail(email);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password (in production, you should hash password and compare)
      // For demo, assuming password is stored as plain text
      if (password !== admin.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if admin is active
      if (admin.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Update last login
      await Admin.updateLastLogin(admin.id);

      // Create JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...adminData } = admin;

      res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: adminData
      });

    // } catch (error) {
    //   console.error('Login error:', error);
    //   res.status(500).json({
    //     success: false,
    //     message: 'Server error'
    //   });
    // }
  },

  // Get admin profile
  getProfile: async (req, res) => {
    try {
      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

module.exports = adminController;