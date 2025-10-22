// Test script to check if admin can fetch all customer and artisan data
// Run this in browser console when logged in as admin

console.log('Testing Admin Data Fetching...');

async function testEndpoints() {
  const endpoints = [
    { name: 'Customers', url: '/customers' },
    { name: 'Sellers/Artisans', url: '/sellers' },
    { name: 'Admin Products', url: '/admin/products' },
    { name: 'Analytics', url: '/analytics/admin' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint.name}...`);
      
      const response = await fetch(`http://localhost:8000/api${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} Success:`, data);
        console.log(`📊 Count: ${Array.isArray(data) ? data.length : 'Object'}`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`📋 Sample item:`, data[0]);
        }
      } else {
        const error = await response.text();
        console.log(`❌ ${endpoint.name} Error:`, error);
      }
    } catch (error) {
      console.log(`💥 ${endpoint.name} Exception:`, error);
    }
  }
}

// Run the test
testEndpoints();
