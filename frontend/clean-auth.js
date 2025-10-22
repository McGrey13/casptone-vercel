// Authentication Cleanup Script
// Run this in browser console to clean up dual authentication systems

console.log('🧹 Cleaning up authentication system...');

// Clear all localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear all sessionStorage  
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear any cookies (optional - only if you want to force re-login)
// Note: This will log you out
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

console.log('🎉 Authentication cleanup complete!');
console.log('📝 Next steps:');
console.log('1. Refresh the page');
console.log('2. Login again using the regular login form');
console.log('3. Check Dev Tools → Application → Storage');
console.log('   - Local Storage: Should be empty');
console.log('   - Cookies: Should have access_token and refresh_token only');
console.log('4. No more infinite refresh loops! 🎉');
