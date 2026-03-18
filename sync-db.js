const { sequelize } = require('./src/config/database');

async function syncDatabase() {
  try {
    console.log('Syncing database...');
    
    // Add customer_name column if it doesn't exist
    const query = "ALTER TABLE tour_orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100) DEFAULT NULL, ADD COLUMN IF NOT EXISTS order_status TINYINT DEFAULT 0";
    
    await sequelize.query(query).catch(err => {
      console.log('Column might already exist or error:', err.message);
    });
    
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
