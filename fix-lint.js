const fs = require('fs');
const path = require('path');

function processFile(filePath, replacer) {
  const p = path.join(__dirname, filePath);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  const changed = replacer(content);
  if (changed !== content) {
    fs.writeFileSync(p, changed, 'utf8');
    console.log(`Replaced in ${filePath}`);
  }
}

processFile('src/App.js', c => c
  .replace('import { Routes, Route, Navigate } from \'react-router-dom\';', 'import { Routes, Route } from \'react-router-dom\';')
  .replace("import { useCurrentUser } from './store/useAppStore';\n", "")
  .replace("const { theme, currentUserId } = useAppStore();", "const { theme } = useAppStore();")
  .replace("<Toast />\n      </div>", "<Toast />\n        <RegisterDeviceModal />\n        <ReportTheftModal />\n        <VerifyReportModal />\n        <TransferInitiateModal />\n        <TransferPinModal />\n      </div>")
);

processFile('src/components/pages/DeviceRegistryPage.js', c => c.replace('FiSearch, ', '').replace('FiSearch', ''));
processFile('src/components/pages/HomePage.js', c => c.replace('import StatCard from \'../ui/StatCard\';\n', '').replace('const { devices, reports, events } = useAppState();', 'const { devices, events } = useAppState();'));
processFile('src/components/pages/IntelligenceFeedPage.js', c => c
  .replace("import { findDevice } from '../../utils/helpers';\n", "")
  .replace("FiMapPin, FiClock", "")
  .replace(/const airtel = events\.filter\(e => e\.operator === 'Airtel'\);\n/, "")
  .replace(/const tnm\s*= events\.filter\(e => e\.operator === 'TNM'\);\n/, "")
  .replace(/const device = devices\.find\(d => d\.id === ev\.deviceId\);\n\s+return \(/g, "return (")
);
processFile('src/components/pages/MyDevicesPage.js', c => c.replace(/const allReports = useAppState\(\)\.reports;\n/, ""));
processFile('src/components/pages/PoliceDashboardPage.js', c => c.replace('FiTruck, ', '').replace('FiTruck', ''));
processFile('src/components/pages/TransferPage.js', c => c.replace("import { formatNumber } from '../../utils/helpers';\n", ""));
processFile('src/components/ui/DeviceLookup.js', c => c
  .replace("checkIdentifier,", "")
  .replace("import { checkIdentifier } from '../../utils/helpers';\n", "")
  .replace(/const deviceIcon =.*?\n/g, "")
);
processFile('src/components/ui/MalawiMap.js', c => c
  .replace("const devices = appState?.devices || [];", "const devices = React.useMemo(() => appState?.devices || [], [appState?.devices]);")
  .replace("const reports = appState?.reports || [];", "const reports = React.useMemo(() => appState?.reports || [], [appState?.reports]);")
);
