// Simple test script to check API endpoints
const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${path}`);
    const data = await response.json();
    
    console.log(`✅ ${description}: ${response.status}`);
    if (response.status >= 400) {
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing OpulFlow API endpoints...\n');
  
  await testEndpoint('/api/health', 'Health Check');
  await testEndpoint('/api/dashboard/stats?period=30d', 'Dashboard Stats');
  await testEndpoint('/api/contacts', 'Contacts List');
  await testEndpoint('/api/keys/list', 'API Keys List');
  await testEndpoint('/api/credits/history', 'Credits History');
  await testEndpoint('/api/n8n/workflows', 'N8N Workflows');
  
  console.log('\n✨ Test completed!');
}

runTests();