const axios = require('axios');
const BASE_URL = 'http://localhost:3001';

async function verifyAPIs() {
  console.log('========================================');
  console.log('    API VERIFICATION TEST');
  console.log('========================================\n');
  
  try {
    // Test 1: Health Check
    console.log('1. GET /health');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   Status: ' + health.status);
    console.log('   Response:', health.data);
    console.log('   ✓ Working\n');

    // Test 2: Tours List
    console.log('2. GET /v1/api/tour/tours');
    const tours = await axios.get(`${BASE_URL}/v1/api/tour/tours`);
    console.log('   Status: ' + tours.status);
    console.log('   Tours Count: ' + (tours.data.data?.length || 0));
    if (tours.data.data?.length > 0) {
      console.log('   First Tour:', tours.data.data[0].tour_name);
    }
    console.log('   ✓ Working\n');

    // Test 3: Tour Details (using first tour slug)
    const firstTour = tours.data.data?.[0];
    if (firstTour) {
      console.log('3. GET /v1/api/tour/tour/' + firstTour.slug);
      const details = await axios.get(`${BASE_URL}/v1/api/tour/tour/${firstTour.slug}`);
      console.log('   Status: ' + details.status);
      console.log('   Tour: ' + details.data.data?.tour_name);
      console.log('   Price: ₹' + details.data.data?.price);
      console.log('   Days: ' + details.data.data?.days);
      console.log('   ✓ Working\n');

      // Test 4: Create Booking
      console.log('4. POST /v1/api/tour/booking');
      const bookingData = {
        tour_id: firstTour.id,
        customer_name: 'Test User',
        phone_number: '9876543210',
        email: 'test@example.com',
        pickup_address: 'Mumbai, Maharashtra',
        drop_address: 'Pune, Maharashtra',
        travel_date: '2026-03-15',
        travel_time: '09:00:00',
        qty: 2,
        price: details.data.data.price,
        gst: 0,
        final_price: details.data.data.price * 2,
        payment_status: 'pending',
        payment_type: 'full'
      };
      
      const booking = await axios.post(`${BASE_URL}/v1/api/tour/booking`, bookingData);
      console.log('   Status: ' + booking.status);
      console.log('   Booking ID:', booking.data.data?.id);
      console.log('   Message:', booking.data.message);
      console.log('   ✓ Working\n');

      // Test 5: Get Order Details
      if (booking.data.data?.id) {
        console.log('5. GET /v1/api/orders/get/' + booking.data.data.id);
        const order = await axios.get(`${BASE_URL}/v1/api/orders/get/${booking.data.data.id}`);
        console.log('   Status: ' + order.status);
        console.log('   Order Phone:', order.data.data?.phone_number);
        console.log('   Order Status:', order.data.data?.order_status);
        console.log('   ✓ Working\n');
      }
    } else {
      console.log('No tours found in database. Please add tours from admin panel.\n');
    }

    console.log('========================================');
    console.log('    ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyAPIs();
