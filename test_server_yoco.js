const axios = require('axios');

async function testServerEndpoint() {
    console.log('Testing Server Endpoint...');
    try {
        const response = await axios.post('http://localhost:3030/api/v1/yoco/create-checkout', {
            amount: 123456, // R 1234.56
            currency: 'ZAR',
            // successUrl and cancelUrl are optional, letting server default them
        });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.log('FAILED:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testServerEndpoint();
