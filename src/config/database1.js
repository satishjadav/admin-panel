const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, // Set to console.log for debugging
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync models (use with caution in production)
// sequelize.sync({ force: false, alter: true });

module.exports = sequelize;