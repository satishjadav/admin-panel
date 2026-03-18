const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const TourOrderManagement = require('./TourOrderManagement');

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    first_name: {
      type: DataTypes.STRING
    },

    last_name: {
      type: DataTypes.STRING
    },

    email: {
      type: DataTypes.STRING
    },

    phone: {
      type: DataTypes.STRING
    },

    password: {
      type: DataTypes.STRING
    },

    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  },
  {
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

// Customer.hasMany(TourOrderManagement, {
//   foreignKey: 'user_id'
// });

module.exports = Customer;