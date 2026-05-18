const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Gallery = sequelize.define(
  "Gallery",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING(225),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "gallery",
    timestamps: false,
  }
);

module.exports = Gallery;