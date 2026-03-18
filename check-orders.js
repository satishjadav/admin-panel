const { pool } = require('./src/config/database');

async function checkData() {
  try {
    const [tours] = await pool.execute('SELECT COUNT(*) as count FROM tour_management');
    console.log('Tour Count:', tours[0].count);
    
    const [orders] = await pool.execute('SELECT COUNT(*) as count FROM tour_orders');
    console.log('Order Count:', orders[0].count);
    
    if (orders[0].count > 0) {
      const [orderRows] = await pool.execute('SELECT id, tour_id, phone_number, payment_status, order_status FROM tour_orders LIMIT 5');
      console.log('Sample Orders:', JSON.stringify(orderRows, null, 2));
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

checkData();
