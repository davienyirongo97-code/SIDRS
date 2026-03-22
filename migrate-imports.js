const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDir = path.join(__dirname, 'src');

walkDir(targetDir, (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  
  let originalSrc = fs.readFileSync(filePath, 'utf8');
  let newSrc = originalSrc.replace(/context\/AppContext/g, 'store/useAppStore');
  
  if (originalSrc !== newSrc) {
    fs.writeFileSync(filePath, newSrc, 'utf8');
    console.log('Updated:', filePath);
  }
});
