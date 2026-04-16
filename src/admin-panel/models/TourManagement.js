const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const easyinvoice = require('easyinvoice');

const TourManagement = sequelize.define('TourManagement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  tour_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: false
    }
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  days: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  include: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exclude: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  itinerary: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },

  locations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  pricing_slabs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  status_type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    validate: {
      isIn: [[1, 2]]
    }
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    validate: {
      isIn: [[0, 1]]
    }
  }
}, {
  tableName: 'tour_management',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = TourManagement;