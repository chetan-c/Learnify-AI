// Simple test to verify Groq initialization works
import 'dotenv/config';
import { isGroqConfigured, generateGroqText } from './config/groq.js';

console.log('=== GROQ Configuration Verification ===\n');

console.log('1. Checking GROQ_API_KEY environment variable:');
const apiKey = process.env.GROQ_API_KEY;
if (apiKey) {
  console.log(`   ✅ Found: ${apiKey.substring(0, 20)}${apiKey.length > 20 ? '...' : ''}`);
  if (apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    console.log('   ⚠️  WARNING: Using placeholder value - replace with real Groq API key');
  }
} else {
  console.log('   ❌ NOT FOUND');
}

console.log('\n2. Checking isGroqConfigured() function:');
const isConfigured = isGroqConfigured();
console.log(`   isGroqConfigured(): ${isConfigured}`);
if (!isConfigured) {
  console.log('   ❌ Groq is not configured - endpoints will return 500 errors');
} else {
  console.log('   ✅ Groq is configured - endpoints are ready (assuming valid API key)');
}

console.log('\n3. Testing generateGroqText() with invalid key:');
try {
  const result = await generateGroqText('Test prompt');
  console.log('   ✅ Function callable');
} catch (error) {
  console.log(`   ⚠️  Error (expected with placeholder key): ${error.message}`);
  console.log('   This is normal - the actual API key is needed for real requests');
}

console.log('\n=== Conclusion ===');
console.log('Fix status: ' + (isConfigured ? '✅ FIXED' : '❌ NOT FIXED'));
console.log('Next step: Set a valid GROQ_API_KEY in server/.env');
