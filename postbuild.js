import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const indexPath = path.join(distPath, 'index.html');
const errorPath = path.join(distPath, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, errorPath);
  console.log('Successfully created 404.html from index.html for SPA routing support.');
} else {
  console.error('index.html not found in dist folder. Build might have failed.');
}
