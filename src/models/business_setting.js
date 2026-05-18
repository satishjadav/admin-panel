const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessSetting = sequelize.define(
  'BusinessSetting',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    key: {
      type: DataTypes.STRING(225),
      allowNull: false,
    },

    value: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'business_setting',
    timestamps: false,
    underscored: true,
  }
);

module.exports = BusinessSetting;