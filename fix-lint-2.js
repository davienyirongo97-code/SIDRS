const fs = require('fs');
const path = require('path');

function processFile(filePath, replacer) {
  const p = path.join(__dirname, filePath);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  const changed = replacer(content);
  if (changed !== content) {
    fs.writeFileSync(p, changed, 'utf8');
  }
}

processFile('src/components/pages/IntelligenceFeedPage.js', c => c
  .replace(/FiMapPin,?\s*/, '')
  .replace(/FiClock,?\s*/, '')
  .replace(/const airtel = events\.filter.*?;\n/, '')
  .replace(/const tnm\s*= events\.filter.*?;\n/, '')
  .replace(/const device = devices\.find.*?;\n/g, '')
);

processFile('src/components/pages/MyDevicesPage.js', c => c
  .replace(/const allReports = useAppState\(\)\.reports;\n/, '')
);

processFile('src/components/ui/DeviceLookup.js', c => c
  .replace(/const deviceIcon = [^\n]*;\n/, '')
);
