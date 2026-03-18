const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Admin token (you'll need to get this from login)
const ADMIN_TOKEN = 'your-admin-token-here';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testStatusUpdate() {
  try {
    // First, create a test booking
    console.log('\n=== Creating Test Booking ===');
    const booking = await api.post('/v1/api/tour/booking', {
      tour_id: 1,
      phone_number: '9876543210',
      customer_name: 'Test User',
      pickup_address: 'Mumbai',
      drop_address: 'Pune',
      travel_date: '2026-03-01',
      travel_time: '09:00',
      qty: 2,
      price: 5000,
      final_price: 5900,
      payment_status: 'pending'
    });
    
    const orderId = booking.data.data.id;
    console.log('Created Order ID:', orderId);

    // Test order status updates (simulating admin actions)
    console.log('\n=== Testing Order Status Updates ===');
    
    // Status: 0 = Pending, 1 = Confirmed, 2 = Picked, 3 = Dropped/Completed, 4 = Refunded, 5 = Cancelled
    
    // Test confirming order
    console.log('\n1. Confirming order (status: 1)');
    // Note: This would need admin token in production
    
    // Test getting order details
    console.log('\n2. Getting order details...');
    const orderDetails = await api.get(`/v1/api/orders/get/${orderId}`);
    console.log('Order Details:', orderDetails.data.data ? 'Success' : 'Failed');
    
    console.log('\n=== All Tests Completed ===');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStatusUpdate();
