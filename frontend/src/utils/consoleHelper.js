// Console Helper for Commission Dashboard Testing
// Run this in browser console to set up authentication

window.setupCommissionAuth = function() {
  const testToken = '33|53e0FXEFKvOeEC3hL8GHnNXrc37q4UvXa7NUS0TV0422e1ec';
  localStorage.setItem('token', testToken);
  console.log('🔑 Authentication token set successfully!');
  console.log('🎯 You can now access the commission dashboard');
  console.log('📍 Navigate to: /admin/commission-dashboard');
  return true;
};

window.testCommissionAPI = async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No token found. Run setupCommissionAuth() first.');
    return false;
  }

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-2.onrender.com/api';
    const response = await fetch(`${backendUrl}/admin/reports/system-commission?from_date=2025-09-01&to_date=2025-10-06`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ API test successful!');
      console.log('💰 Total Revenue:', '₱' + data.data.summary.total_gross_revenue?.toLocaleString());
      console.log('💵 Total Commission:', '₱' + data.data.summary.total_admin_fees?.toLocaleString());
      console.log('📈 Transactions:', data.data.summary.transaction_count);
      return true;
    } else {
      console.error('❌ API test failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API test error:', error);
    return false;
  }
};

window.clearCommissionAuth = function() {
  localStorage.removeItem('token');
  console.log('🗑️ Authentication token cleared');
  return true;
};

// Auto-run setup if no token exists
if (!localStorage.getItem('token')) {
  console.log('🚀 Commission Dashboard Helper loaded!');
  console.log('📝 Available commands:');
  console.log('  - setupCommissionAuth() - Set up test authentication');
  console.log('  - testCommissionAPI() - Test API connection');
  console.log('  - clearCommissionAuth() - Clear authentication');
  console.log('');
  console.log('💡 Run setupCommissionAuth() to get started!');
} else {
  console.log('✅ Authentication token already exists');
  console.log('🎯 Commission dashboard should work!');
}

export default {
  setupCommissionAuth: window.setupCommissionAuth,
  testCommissionAPI: window.testCommissionAPI,
  clearCommissionAuth: window.clearCommissionAuth
};
