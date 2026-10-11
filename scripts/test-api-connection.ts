/**
 * Simple script to test API connection
 * Run with: npx tsx scripts/test-api-connection.ts
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pulse-socials.onrender.com/api';

async function testConnection() {
  console.log('🔍 Testing API Connection...');
  console.log('API URL:', API_URL);
  console.log('================================\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Detailed Health Check
    console.log('2️⃣ Testing Detailed Health Endpoint...');
    const detailedResponse = await fetch(`${API_URL}/health/detailed`);
    const detailedData = await detailedResponse.json();
    console.log('✅ Detailed Health:', JSON.stringify(detailedData, null, 2));
    console.log('');

    console.log('✅ All tests passed! API is accessible.');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
