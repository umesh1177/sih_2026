// add_modal_fullscreen.cjs
// Scans all JSX files under frontend/src/components and adds the
// `modal-fullscreen` class to any outer modal container with
// className="fixed inset-0 ...". Safe to run multiple times.

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../../frontend/src/components');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function addClass(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /className="([^\"]*fixed inset-0[^\"]*)"/g;
  let changed = false;
  const newContent = content.replace(regex, (match, cls) => {
    if (cls.includes('modal-fullscreen')) return match;
    changed = true;
    const newCls = cls.replace('fixed inset-0', 'fixed inset-0 modal-fullscreen');
    return `className="${newCls}"`;
  });
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function main() {
  const files = walk(COMPONENTS_DIR);
  files.forEach(addClass);
}

main();
