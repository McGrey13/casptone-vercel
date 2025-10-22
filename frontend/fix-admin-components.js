// Script to fix all Admin components to use secure API
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/Components/Admin');
const filesToFix = [
  'CustomerDetail.jsx',
  'CustomerEdit.jsx', 
  'ProductEdit.jsx',
  'SellerDetail.jsx',
  'SellerEdit.jsx'
];

filesToFix.forEach(filename => {
  const filePath = path.join(adminDir, filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add api import if not present
    if (!content.includes("import api from")) {
      const importMatch = content.match(/import.*from.*["'].*["'];\s*\n/);
      if (importMatch) {
        const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, lastImportIndex) + "import api from \"../../api\";\n" + content.slice(lastImportIndex);
      }
    }
    
    // Replace localStorage.getItem("token") with api usage
    content = content.replace(
      /const token = localStorage\.getItem\(["']token["']\);\s*\n/g,
      ''
    );
    
    content = content.replace(
      /const token = localStorage\.getItem\(["']auth_token["']\);\s*\n/g,
      ''
    );
    
    // Replace fetch calls with api calls
    content = content.replace(
      /fetch\(["']http:\/\/localhost:8000\/api\/([^"']+)["'],\s*\{[^}]*headers:\s*\{[^}]*Authorization:\s*`Bearer \$\{token\}`[^}]*\}[^}]*\}\)/g,
      'api.get("/$1")'
    );
    
    content = content.replace(
      /\.then\(\(res\) => \{[^}]*if \(!res\.ok\)[^}]*return res\.json\(\);[^}]*\}\)/g,
      ''
    );
    
    content = content.replace(
      /\.then\(\(data\) => \{[^}]*\}/g,
      '.then(response => response.data)'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filename}`);
  } else {
    console.log(`File not found: ${filename}`);
  }
});

console.log('Admin components fixed!');
