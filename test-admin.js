const { pool } = require('./src/config/database');

async function testAdmin() {
  try {
    // First check if we can query the database
    const [rows] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      ['raja@gmail.com']
    );
    
    if (rows.length > 0) {
      console.log('Admin found:', JSON.stringify(rows[0], null, 2));
      console.log('Password check:', rows[0].password === '12345678');
    } else {
      console.log('Admin not found');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAdmin();
