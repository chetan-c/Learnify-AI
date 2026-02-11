import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api/pdf/upload';

// Create a simple test PDF for testing
async function testPDFUpload() {
  try {
    console.log('🧪 Testing PDF Upload Endpoint...\n');

    // First, let's just check if the server is responding
    const healthCheck = await axios.get('http://localhost:5000/api/health', { timeout: 5000 }).catch(() => ({ status: 'no-server' }));
    console.log('Server health:', healthCheck.status === 'no-server' ? '❌ Server not responding' : '✅ Server responding');

    if (healthCheck.status === 'no-server') {
      console.log('⚠️  Backend server is not responding on port 5000');
      console.log('Make sure to run: cd server && node server.js');
      return;
    }

    // Try to upload a simple text file as test (since we don't have a real PDF here)
    const form = new FormData();
    const testFile = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Hello World - This is test PDF content) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000214 00000 n\n0000000301 00000 n\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n391\n%%EOF');
    
    form.append('file', testFile, 'test.pdf');

    console.log('📤 Uploading test PDF...');
    
    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer invalid_token' // We'll get 401, but that's okay - we're testing the endpoint exists
      },
      timeout: 10000
    });

    console.log('✅ PDF Upload endpoint responded!');
    console.log('Response:', response.data);

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ PDF Upload endpoint exists! (Got 401 - expected due to missing auth)');
      return;
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to backend server on port 5000');
      console.log('Make sure to run: cd server && node server.js');
      return;
    }

    console.log('Error:', error.message);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
  }
}

testPDFUpload();
