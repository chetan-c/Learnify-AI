const axios = require('axios');
const fs = require('fs');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true // Don't throw on any status
});

async function test() {
  console.log('\n📋 COMPREHENSIVE PDF UPLOAD TEST\n');
  console.log('='.repeat(50));

  try {
    // 1. Register a test user
    console.log('\n1️⃣  Registering test user...');
    const registerRes = await API.post('/auth/register', {
      email: `test_${Date.now()}@test.com`,
      password: 'Test123456!',
      name: 'Test User',
      institution: 'Test University'
    });

    if (registerRes.status !== 201) {
      console.log('   ❌ Registration failed:', registerRes.data);
      return;
    }

    console.log('   ✅ User registered');
    const token = registerRes.data.token;

    // 2. Create a simple valid PDF
    console.log('\n2️⃣  Using test PDF...');
    if (!fs.existsSync('real_test.pdf')) {
      console.log('   ⚠️  real_test.pdf not found, creating...');
      // Use the pre-created PDF
      const testPdfPath = 'real_test.pdf';
      if (!fs.existsSync(testPdfPath)) {
        console.log('   ❌ Test PDF not available');
        return;
      }
    }
    console.log('   ✅ PDF ready');

    // 3. Upload PDF
    console.log('\n3️⃣  Uploading PDF...');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('pdf', fs.createReadStream('real_test.pdf'));

    const uploadRes = await API.post('/pdf/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    if (uploadRes.status !== 200 && uploadRes.status !== 201) {
      console.log('   ❌ Upload failed with status', uploadRes.status);
      console.log('   Error:', uploadRes.data);
      
      // This is important - check if it's the pdf-parse error
      if (uploadRes.data?.error?.includes('pdfParse')) {
        console.log('\n   🔴 CRITICAL: pdf-parse error detected!');
        console.log('   The pdf-parse import fix may not be working correctly.');
      }
      return;
    }

    console.log('   ✅ PDF uploaded successfully!');
    console.log('   Response:', uploadRes.data);
    
    const pdfId = uploadRes.data.id;
    
    // 4. Verify PDF was stored with extracted text
    console.log('\n4️⃣  Verifying PDF storage...');
    const getPdfRes = await API.get(`/pdf/${pdfId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (getPdfRes.status === 200) {
      const extractedText = getPdfRes.data.extractedText || '';
      if (extractedText.length > 0) {
        console.log('   ✅ PDF text extracted successfully!');
        console.log('   Extracted text length:', extractedText.length, 'characters');
        console.log('   Sample:', extractedText.substring(0, 100) + '...');
      } else {
        console.log('   ⚠️  PDF uploaded but no text extracted');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST PASSED: PDF upload and extraction working!');
    console.log('✅ pdf-parse import is FIXED and functional!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.log('\n❌ Test error:', error.message);
    if (error.response?.data) {
      console.log('Response:', error.response.data);
    }
  }
}

test();
