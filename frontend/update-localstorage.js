// Script to update localStorage references to use secure authentication
const fs = require('fs');
const path = require('path');

// Function to recursively find all .jsx and .js files
function findFiles(dir, extensions = ['.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to update localStorage references
function updateLocalStorageReferences(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Patterns to replace
  const replacements = [
    // Remove token from localStorage
    {
      pattern: /localStorage\.getItem\(['"`]auth_token['"`]\)/g,
      replacement: 'null // Token now handled by httpOnly cookies'
    },
    {
      pattern: /localStorage\.getItem\(['"`]token['"`]\)/g,
      replacement: 'null // Token now handled by httpOnly cookies'
    },
    {
      pattern: /localStorage\.setItem\(['"`]auth_token['"`],\s*[^)]+\)/g,
      replacement: '// Token automatically set in httpOnly cookies'
    },
    {
      pattern: /localStorage\.setItem\(['"`]token['"`],\s*[^)]+\)/g,
      replacement: '// Token automatically set in httpOnly cookies'
    },
    {
      pattern: /localStorage\.removeItem\(['"`]auth_token['"`]\)/g,
      replacement: '// Token automatically cleared via logout endpoint'
    },
    {
      pattern: /localStorage\.removeItem\(['"`]token['"`]\)/g,
      replacement: '// Token automatically cleared via logout endpoint'
    },
    {
      pattern: /localStorage\.setItem\(['"`]user['"`],\s*[^)]+\)/g,
      replacement: '// User data handled by UserContext'
    },
    {
      pattern: /localStorage\.getItem\(['"`]user['"`]\)/g,
      replacement: 'null // User data handled by UserContext'
    }
  ];
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  });
  
  // Update Authorization headers
  const authHeaderPattern = /headers:\s*\{[^}]*'Authorization':\s*`Bearer\s+\$\{localStorage\.getItem\(['"`]auth_token['"`]\)\}`[^}]*\}/g;
  if (authHeaderPattern.test(content)) {
    content = content.replace(authHeaderPattern, (match) => {
      return match.replace(/'Authorization':\s*`Bearer\s+\$\{localStorage\.getItem\(['"`]auth_token['"`]\)\}`/, '// Authorization handled by httpOnly cookies');
    });
    updated = true;
  }
  
  // Update fetch requests with Authorization headers
  const fetchAuthPattern = /'Authorization':\s*`Bearer\s+\$\{localStorage\.getItem\(['"`]auth_token['"`]\)\}`/g;
  if (fetchAuthPattern.test(content)) {
    content = content.replace(fetchAuthPattern, '// Authorization handled by httpOnly cookies');
    updated = true;
  }
  
  // Write back if updated
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

console.log(`Found ${files.length} files to process...`);

let updatedCount = 0;
files.forEach(file => {
  if (updateLocalStorageReferences(file)) {
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} files.`);
console.log('\nNote: You may need to manually update some components to use the UserContext for authentication state.');
