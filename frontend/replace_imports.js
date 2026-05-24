const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'app');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace relative imports of components, services, store, hooks, lib, types, contexts with path alias @/
      const regex = /(['"])(\.\.?\/)+(components|services|store|hooks|lib|types|contexts)\//g;
      if (regex.test(content)) {
        const newContent = content.replace(regex, '$1@/$3/');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  }
}

console.log(`Starting relative imports cleanup in: ${targetDir}`);
walkDir(targetDir);
console.log('Finished cleanup successfully!');
