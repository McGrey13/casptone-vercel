// Utility script to manually clear authentication tokens
// Run this in browser console if needed

// Clear all auth-related data
localStorage.removeItem('auth_token');
sessionStorage.removeItem('auth_token');

// Clear any other potential auth data
localStorage.removeItem('user');
localStorage.removeItem('userData');
localStorage.removeItem('token');

console.log('All authentication tokens cleared from localStorage and sessionStorage');

// Verify clearing
console.log('Remaining localStorage keys:', Object.keys(localStorage));
console.log('Remaining sessionStorage keys:', Object.keys(sessionStorage));
