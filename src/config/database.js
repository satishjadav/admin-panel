const { Sequelize } = require('sequelize');
const mysql = require('mysql2');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecomm',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    },
    // Sync settings
    sync: {
      force: false,
      alter: false
    }
  }
);

// Create a raw MySQL pool for raw queries (backward compatibility)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecomm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
    return false;
  }
};

// Sync models (use with caution in production)
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ All models synchronized successfully.');
  } catch (err) {
    console.error('❌ Error synchronizing models:', err.message);
  }
};

module.exports = {
  sequelize,
  pool,
  testConnection,
  syncModels
};
