const axios = require('axios');

async function testAddTour() {
  const formData = new FormData();
  formData.append('tour_name', 'Test Tour');
  formData.append('days', '3');
  formData.append('price', '100');
  
  // Get token from localStorage first (you need to be logged in)
  // For testing without auth, let's check if the endpoint works
  
  try {
    const response = await axios.post(
      'http://localhost:3001/api/tour/add',
      { tour_name: 'Test Tour', days: '3', price: '100' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAddTour();
