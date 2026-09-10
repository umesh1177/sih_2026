import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = path.resolve('..');
const zipName = 'CapacityConnect_MoES_IMD_SIH26075.zip';
const zipPath = path.join(rootDir, zipName);

const tempDir = path.join(rootDir, '_temp_package');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

function copyRecursive(src, dest, ignores = []) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    const base = path.basename(src);
    if (ignores.includes(base)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file), ignores);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log("Staging clean project files...");
copyRecursive(path.join(rootDir, 'backend'), path.join(tempDir, 'backend'), ['node_modules', '.git']);
copyRecursive(path.join(rootDir, 'frontend'), path.join(tempDir, 'frontend'), ['node_modules', '.git', 'dist']);
fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(tempDir, 'README.md'));
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(tempDir, 'package.json'));

console.log("Compressing staged files into ZIP...");
execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`);

fs.rmSync(tempDir, { recursive: true, force: true });
console.log(`✅ Success! Created: ${zipPath}`);
