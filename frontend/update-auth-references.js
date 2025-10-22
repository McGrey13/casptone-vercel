// Comprehensive script to update all authentication references
const fs = require('fs');
const path = require('path');

// Files that need specific updates
const filesToUpdate = [
  'src/Components/Admin/AdminNavbar.jsx',
  'src/Components/Admin/AdminSettings.jsx',
  'src/Components/Admin/ArtisanTable.jsx',
  'src/Components/Admin/SellersTable.jsx',
  'src/Components/Admin/CustomerTable.jsx',
  'src/Components/Admin/ProductsTable.jsx',
  'src/Components/Admin/ProductEdit.jsx',
  'src/Components/Admin/AcceptPendingProduct.jsx',
  'src/Components/Admin/SellerEdit.jsx',
  'src/Components/Admin/CustomerEdit.jsx',
  'src/Components/Admin/CustomerDetail.jsx',
  'src/Components/Admin/SellerDetail.jsx',
  'src/Components/Seller/ProfilePage.jsx',
  'src/Components/Seller/SellerLayout.jsx',
  'src/Components/Seller/SellerSettings.jsx',
  'src/Components/Seller/AddProductModal.jsx',
  'src/Components/Seller/OrderInventoryManager.jsx',
  'src/Components/Seller/FeaturedProducts.jsx',
  'src/Components/Seller/MarketingTools.jsx',
  'src/Components/Seller/StorefrontCustomizer.jsx',
  'src/Components/Cart/CartContext.jsx',
  'src/Components/Cart/Checkout.jsx',
  'src/Components/Chat/ChatBox.jsx',
  'src/Components/Chat/ConversationList.jsx',
  'src/Components/Messenger/MessengerPopup.jsx',
  'src/Components/Profile/Profile.jsx',
  'src/Components/product/ProductsPage.jsx',
  'src/Components/product/ProductDetails.jsx',
  'src/Components/Order/OrderHistory.jsx',
  'src/Components/Orders/Orders.jsx',
  'src/Components/Artisans/Artisan.jsx',
  'src/Components/Artisans/ArtisanDetail.jsx',
  'src/Components/Store/VerificationPending.jsx'
];

// Update a single file
function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Add useUser import if not present
  if (content.includes('localStorage.getItem') && !content.includes('useUser')) {
    const importMatch = content.match(/import\s+.*?from\s+['"][^'"]+['"];?\s*\n/);
    if (importMatch) {
      const importStatement = "import { useUser } from '../Context/UserContext';\n";
      content = content.replace(importMatch[0], importMatch[0] + importStatement);
      updated = true;
    }
  }

  // Replace localStorage.getItem('auth_token') with user context
  if (content.includes("localStorage.getItem('auth_token')")) {
    content = content.replace(/localStorage\.getItem\(['"`]auth_token['"`]\)/g, 'user');
    updated = true;
  }

  // Replace localStorage.getItem('token') with user context
  if (content.includes("localStorage.getItem('token')")) {
    content = content.replace(/localStorage\.getItem\(['"`]token['"`]\)/g, 'user');
    updated = true;
  }

  // Remove localStorage.setItem for auth_token
  content = content.replace(/localStorage\.setItem\(['"`]auth_token['"`],\s*[^)]+\);?\s*/g, '// Token handled by httpOnly cookies\n');
  updated = true;

  // Remove localStorage.removeItem for auth_token
  content = content.replace(/localStorage\.removeItem\(['"`]auth_token['"`]\);?\s*/g, '// Token cleared via logout\n');
  updated = true;

  // Update Authorization headers in fetch requests
  content = content.replace(
    /'Authorization':\s*`Bearer\s+\$\{localStorage\.getItem\(['"`]auth_token['"`]\)\}`/g,
    '// Authorization handled by httpOnly cookies'
  );
  updated = true;

  content = content.replace(
    /'Authorization':\s*`Bearer\s+\$\{localStorage\.getItem\(['"`]token['"`]\)\}`/g,
    '// Authorization handled by httpOnly cookies'
  );
  updated = true;

  // Add useUser hook at the beginning of component functions
  if (content.includes('const { user } = useUser()') || content.includes('const { logout } = useUser()')) {
    // Already has useUser, skip
  } else if (content.includes('localStorage') && content.includes('function ') || content.includes('const ') && content.includes('= ()')) {
    // Find component function and add useUser hook
    const functionMatch = content.match(/(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|function\s+\w+\s*\([^)]*\)\s*{)/);
    if (functionMatch) {
      const hookStatement = "  const { user, logout } = useUser();\n";
      content = content.replace(functionMatch[0], functionMatch[0] + hookStatement);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`- No changes needed: ${filePath}`);
    return false;
  }
}

// Main execution
console.log('Updating authentication references...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ Updated ${updatedCount} files.`);
console.log('\n⚠️  Note: Some files may need manual review for complete functionality.');
