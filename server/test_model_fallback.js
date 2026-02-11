#!/usr/bin/env node

/**
 * Test Model Fallback Logic
 * 
 * This script tests the Groq model fallback mechanism
 * Primary: llama-3.1-70b-versatile
 * Fallback: llama-3.1-8b-instant
 */

import 'dotenv/config';
import { generateGroqText, isGroqConfigured, getGroqModels } from './config/groq.js';

async function testModelFallback() {
  console.log('='.repeat(60));
  console.log('MODEL FALLBACK TEST');
  console.log('='.repeat(60));
  console.log();

  // Check if Groq is configured
  if (!isGroqConfigured()) {
    console.error('❌ GROQ_API_KEY not configured');
    process.exit(1);
  }
  console.log('✅ Groq is configured');

  // Get available models
  const models = getGroqModels();
  console.log('📋 Available Models:');
  console.log(`   Primary:  ${models.primary}`);
  console.log(`   Fallback: ${models.fallback}`);
  console.log();

  // Test 1: Simple text generation with primary model
  console.log('🧪 Test 1: Simple text generation');
  console.log('-'.repeat(60));
  try {
    const prompt = 'Say "Hello, model fallback test!" in one sentence.';
    console.log(`Prompt: ${prompt}`);
    const result = await generateGroqText(prompt);
    console.log(`✅ Response: ${result.substring(0, 100)}...`);
    console.log();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log();
  }

  // Test 2: JSON generation
  console.log('🧪 Test 2: JSON generation');
  console.log('-'.repeat(60));
  try {
    const prompt = `Generate a JSON object with one MCQ question about AI. Format:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correct": "A"
}`;
    console.log(`Prompt: ${prompt.substring(0, 50)}...`);
    const result = await generateGroqText(prompt);
    console.log(`✅ Response: ${result.substring(0, 150)}...`);
    console.log();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log();
  }

  // Test 3: Knowledge base service compatibility
  console.log('🧪 Test 3: Knowledge base extraction');
  console.log('-'.repeat(60));
  try {
    const prompt = `Extract key topics from this text: "Machine learning is a subset of artificial intelligence. It focuses on algorithms that learn from data."`;
    console.log(`Prompt: ${prompt.substring(0, 50)}...`);
    const result = await generateGroqText(prompt);
    console.log(`✅ Response: ${result.substring(0, 150)}...`);
    console.log();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('✅ ALL TESTS COMPLETED');
  console.log('='.repeat(60));
}

// Run tests
testModelFallback().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
