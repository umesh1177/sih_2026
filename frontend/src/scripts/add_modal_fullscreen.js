// add_modal_fullscreen.js
// This script scans the frontend/src/components directory for JSX files containing a modal outer container
// with className="fixed inset-0 ..." and injects the `modal-fullscreen` utility class.
// It is safe to run repeatedly; it will only add the class if not already present.

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../../frontend/src/components');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, filelist);
    } else if (fullPath.endsWith('.jsx')) {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

function addModalFullscreen(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /className="([^\"]*fixed inset-0[^\"]*)"/g;
  let updated = false;
  const newContent = content.replace(regex, (match, cls) => {
    if (cls.includes('modal-fullscreen')) return match; // already present
    updated = true;
    // Insert modal-fullscreen before the closing quote
    const newCls = cls.replace('fixed inset-0', 'fixed inset-0 modal-fullscreen');
    return `className="${newCls}"`;
  });
  if (updated) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function main() {
  const files = walk(COMPONENTS_DIR);
  files.forEach(addModalFullscreen);
}

main();
