const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const BusinessSetting = sequelize.define('BusinessSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
},
  {
    tableName: 'business_setting',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

module.exports = BusinessSetting;