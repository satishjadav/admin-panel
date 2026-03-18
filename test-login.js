const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/admin/login', {
      email: 'raja@gmail.com',
      password: '12345678'
    });
    console.log('Login Success:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Login Error:', error.response?.data || error.message);
  }
}

testLogin();
