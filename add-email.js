const { sequelize } = require('./src/config/database');

async function addEmailColumn() {
  try {
    await sequelize.query("ALTER TABLE tour_orders ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL");
    console.log('Email column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addEmailColumn();
