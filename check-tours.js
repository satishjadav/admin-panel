const { pool } = require('./src/config/database');

async function checkTours() {
  try {
    const [rows] = await pool.execute('SELECT id, tour_name, status, price, days FROM tour_management');
    console.log('All Tours in Database:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
}

checkTours();
