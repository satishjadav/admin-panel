const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tour Management Model
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
    allowNull: false,
    validate: {
      notEmpty: true
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

// Tour Order Management Model
const TourOrderManagement = sequelize.define('TourOrderManagement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tour_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pickup_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pickup_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  pickup_long: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  drop_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  drop_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  drop_long: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  travel_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  travel_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  min_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pay_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  gst: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  gst_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.ENUM('upi', 'card', 'netbanking', 'wallet', 'cash', 'cheque', 'bank_transfer'),
    allowNull: true,
  },
  payment_type: {
    type: DataTypes.ENUM('full', 'partial'),
    allowNull: false,
    defaultValue: 'full',
  },
  order_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  }
}, {
  tableName: 'tour_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// Define Associations
TourOrderManagement.belongsTo(TourManagement, {
  foreignKey: 'tour_id',
  as: 'tour'
});

TourManagement.hasMany(TourOrderManagement, {
  foreignKey: 'tour_id',
  as: 'orders'
});

module.exports = {
  sequelize,
  TourManagement,
  TourOrderManagement
};
