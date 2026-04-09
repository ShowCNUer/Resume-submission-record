import fs from 'fs';
import path from 'path';

function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\\`/g, '`');
}

const filesToFix = [
  'src/types.ts',
  'src/store.ts',
  'src/components/Navbar.tsx',
  'src/components/FilterBar.tsx',
  'src/components/ApplicationCard.tsx',
  'src/pages/Home.tsx',
  'src/pages/ApplicationForm.tsx',
  'src/pages/StatusManagement.tsx',
  'src/App.tsx',
];

filesToFix.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = decodeHtmlEntities(content);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
});

console.log('All files fixed successfully!');
