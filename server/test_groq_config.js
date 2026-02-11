// Test script to verify Groq configuration
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'Test User'
};

console.log('=== GROQ Configuration Test ===\n');

(async () => {
  try {
    // Step 1: Register
    console.log('Step 1: Registering test user...');
    let registerRes;
    try {
      registerRes = await axios.post(`${BASE_URL}/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      });
      console.log('✅ Registration successful');
    } catch (error) {
      // User might already exist, try logging in
      if (error.response?.status === 400) {
        console.log('⚠️  User already exists or registration failed, attempting login...');
      }
    }

    // Step 2: Login
    console.log('\nStep 2: Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    const token = loginRes.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 20)}...`);

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 3: Test /api/ai/ask (without valid PDF, should fail at PDF check, not config)
    console.log('\nStep 3: Testing /api/ai/ask endpoint...');
    try {
      const askRes = await axios.post(`${BASE_URL}/ai/ask`, {
        pdfId: '507f1f77bcf86cd799439011', // non-existent PDF ID
        question: 'What is this about?'
      }, { headers });
      
      console.log('✅ API call succeeded (unexpected)');
      console.log('Response:', askRes.data);
    } catch (error) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message;
      const errorMsg = error.response?.data?.error;

      console.log(`API Response Status: ${statusCode}`);
      console.log(`Message: ${message}`);
      console.log(`Error: ${errorMsg}`);

      if (statusCode === 500 && (message?.includes('configuration') || errorMsg?.includes('GROQ_API_KEY'))) {
        console.log('\n❌ GROQ Configuration Error - API key missing or invalid');
        console.log('   Expected: Set GROQ_API_KEY in server/.env');
      } else if (statusCode === 404) {
        console.log('\n✅ Configuration check PASSED - PDF not found (correct error)');
        console.log('   This means Groq is configured and endpoint is accessible');
      } else if (statusCode === 500 && message?.includes('AI service configuration')) {
        console.log('\n❌ GROQ Configuration Error');
      } else {
        console.log('\n⚠️  Unexpected response');
      }
    }

    // Step 4: Test /api/ai/generate-mcqs
    console.log('\nStep 4: Testing /api/ai/generate-mcqs endpoint...');
    try {
      const mcqRes = await axios.post(`${BASE_URL}/ai/generate-mcqs`, {
        pdfId: '507f1f77bcf86cd799439011',
        difficulty: 'medium',
        count: 5
      }, { headers });
      
      console.log('✅ API call succeeded (unexpected)');
      console.log('Response:', mcqRes.data);
    } catch (error) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message;

      console.log(`API Response Status: ${statusCode}`);
      console.log(`Message: ${message}`);

      if (statusCode === 404) {
        console.log('✅ Configuration check PASSED - PDF not found (correct error)');
      } else if (statusCode === 500 && message?.includes('configuration')) {
        console.log('❌ GROQ Configuration Error');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }

  process.exit(0);
})();
