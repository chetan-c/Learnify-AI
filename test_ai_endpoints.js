import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true // Don't throw on any status
});

async function testAllAIEndpoints() {
  console.log('\n' + '='.repeat(70));
  console.log('🔬 COMPREHENSIVE AI ENDPOINT TEST');
  console.log('='.repeat(70) + '\n');

  let token = '';
  let userId = '';
  let pdfId = '';

  try {
    // STEP 1: Register user
    console.log('📝 STEP 1: Registering user...');
    const email = `ai_test_${Date.now()}@test.com`;
    const registerRes = await API.post('/auth/register', {
      email,
      password: 'Test123456!',
      name: 'AI Tester',
      institution: 'Test Univ'
    });
    
    if (registerRes.status !== 201) {
      console.log('❌ Registration failed:', registerRes.status, registerRes.data);
      return;
    }
    
    token = registerRes.data.token;
    userId = registerRes.data.user?._id;
    console.log('✅ User registered. Token obtained.\n');
    
    // STEP 2: Upload PDF
    console.log('📦 STEP 2: Uploading PDF...');
    const form = new FormData();
    form.append('pdf', fs.createReadStream('real_test.pdf'));
    
    const uploadRes = await API.post('/pdf/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (uploadRes.status !== 201) {
      console.log('❌ PDF upload failed:', uploadRes.status, uploadRes.data);
      return;
    }
    
    pdfId = uploadRes.data._id;
    const extractedTextLength = uploadRes.data.extractedText?.length || 0;
    console.log('✅ PDF uploaded. Extracted text:', extractedTextLength, 'characters\n');
    
    // STEP 3: Test AI endpoints
    const aiEndpoints = [
      {
        name: 'Ask AI',
        path: '/ai/ask',
        payload: { pdfId, question: 'What is Physics?' }
      },
      {
        name: 'Generate MCQs',
        path: '/ai/generate-mcqs',
        payload: { pdfId, difficulty: 'medium', count: 5 }
      },
      {
        name: 'Generate Exam',
        path: '/ai/generate-exam',
        payload: { pdfId, duration: 30, count: 5, difficulty: 'medium' }
      },
      {
        name: 'Generate Notes',
        path: '/ai/generate-notes',
        payload: { pdfId, type: 'summary' }
      }
    ];
    
    console.log('🤖 STEP 3: Testing AI Endpoints...\n');
    
    for (const endpoint of aiEndpoints) {
      console.log(`\n--- Testing: ${endpoint.name} ---`);
      console.log(`Path: POST ${endpoint.path}`);
      console.log(`Payload:`, JSON.stringify(endpoint.payload, null, 2));
      
      const response = await API.post(endpoint.path, endpoint.payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status >= 400) {
        console.log('❌ ERROR Response:');
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log('✅ SUCCESS Response (first 200 chars):');
        const responseStr = JSON.stringify(response.data);
        console.log(responseStr.substring(0, 200) + (responseStr.length > 200 ? '...' : ''));
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testAllAIEndpoints();
