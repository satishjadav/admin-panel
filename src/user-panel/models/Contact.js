const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(225),
    allowNull: false
  },
  phone: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'contact',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Contact;