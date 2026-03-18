const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    // Test 1: Get Tours
    console.log('\n=== Test 1: Get Tours ===');
    const tours = await axios.get(`${BASE_URL}/v1/api/tour/tours`);
    console.log('Tours:', tours.data.success ? 'Success' : 'Failed');

    // Test 2: Create Booking
    console.log('\n=== Test 2: Create Booking ===');
    const bookingData = {
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
    };
    
    try {
      const booking = await axios.post(`${BASE_URL}/v1/api/tour/booking`, bookingData);
      console.log('Booking:', booking.data.success ? 'Success' : 'Failed');
      console.log('Booking ID:', booking.data.data?.id);
      
      // Test 3: Get Order Details
      if (booking.data.data?.id) {
        console.log('\n=== Test 3: Get Order Details ===');
        const order = await axios.get(`${BASE_URL}/v1/api/orders/get/${booking.data.data.id}`);
        console.log('Order:', order.data.success ? 'Success' : 'Failed');
      }
    } catch (err) {
      console.log('Booking Error:', err.response?.data || err.message);
    }

    // Test 4: Get Order Stats (needs auth)
    console.log('\n=== Test 4: Get Order Stats ===');
    try {
      const stats = await axios.get(`${BASE_URL}/api/orders/stats`);
      console.log('Stats:', stats.data.success ? 'Success' : 'Failed');
      console.log('Stats Data:', stats.data.data);
    } catch (err) {
      console.log('Stats Error (Expected - needs auth):', err.response?.status);
    }

    console.log('\n=== All Tests Completed ===');
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testAPI();
