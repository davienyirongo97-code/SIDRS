/**
 * src/data/mockData.js
 * ─────────────────────────────────────────────
 * All mock / seed data for the SDIRS frontend demo.
 *
 * In production, this data will come from your backend REST API.
 * Each section mirrors what the API endpoints will return.
 *
 * Sections:
 *   USERS        — system users (citizens, police, MACRA admin)
 *   DEVICES      — registered mobile phones (Phase 1: phones only)
 *   REPORTS      — theft reports filed by citizens
 *   EVENTS       — network detection events from Airtel & TNM
 *   TRANSFERS    — device ownership transfers
 *   CHART_DATA   — monthly activity stats for the admin bar chart
 */

// ─── USERS ────────────────────────────────────────────────────
// role: 'citizen' | 'police' | 'macra'
export const INITIAL_USERS = [
  {
    id: 'U001',
    name: 'Chisomo Banda',
    phone: '+265 991 234 567',
    email: 'chisomo.banda@gmail.com',
    location: 'Area 13, Lilongwe',
    role: 'citizen',
    avatarText: 'CB',
    avatarColor: '#1A5CDB',
  },
  {
    id: 'U002',
    name: 'Mtisunge Phiri',
    phone: '+265 881 234 567',
    email: 'mtisunge@unima.ac.mw',
    location: 'Zomba',
    role: 'citizen',
    avatarText: 'MP',
    avatarColor: '#1B7A3E',
  },
  {
    id: 'U003',
    name: 'Kondwani Mwale',
    phone: '+265 991 876 543',
    email: 'kondwani@mwale.mw',
    location: 'Blantyre',
    role: 'citizen',
    avatarText: 'KM',
    avatarColor: '#5B2DA8',
  },
  {
    id: 'POLICE',
    name: 'Insp. Tembo',
    phone: '+265 991 000 001',
    email: 'tembo@mps.mw',
    location: 'Kawale Police Station',
    role: 'police',
    avatarText: 'PT',
    avatarColor: '#C0252C',
  },
  {
    id: 'MACRA',
    name: 'Admin',
    phone: '+265 1 784 000',
    email: 'admin@sdirs.mw',
    location: 'Lilongwe HQ',
    role: 'macra',
    avatarText: 'AD',
    avatarColor: '#0A1628',
  },
];

// ─── DEVICES ─────────────────────────────────────────────────
// Phase 1: Mobile phones only — tracked via IMEI on Airtel & TNM.
// status: 'registered' | 'stolen' | 'recovered'
export const INITIAL_DEVICES = [
  {
    id: 'D001',
    type: 'mobile',
    make: 'Samsung',
    model: 'Galaxy A54',
    color: 'Phantom Black',
    imei: '356789012345678', // Primary identifier for phones
    serial: 'SNX-2024-00891',
    mac: null,
    ownerId: 'U001',
    registeredDate: '2025-11-14',
    status: 'registered',
  },
  {
    id: 'D002',
    type: 'mobile',
    make: 'Tecno',
    model: 'Spark 20',
    color: 'Starry Blue',
    imei: '490123456789012',
    serial: 'SNX-2024-00432',
    mac: null,
    ownerId: 'U001',
    registeredDate: '2025-12-01',
    status: 'stolen', // Active theft alert on this device
  },
  {
    id: 'D006',
    type: 'mobile',
    make: 'Huawei',
    model: 'P30 Lite',
    color: 'Pearl White',
    imei: '862345678901234',
    serial: 'HW-P30-2025-1120',
    mac: null,
    ownerId: 'U002',
    registeredDate: '2026-01-25',
    status: 'stolen',
  },
];

// ─── REPORTS ─────────────────────────────────────────────────
// status: 'pending' | 'active' | 'resolved'
// pending  → awaiting police verification
// active   → verified; network alert live on Airtel & TNM
// resolved → device recovered or case closed
export const INITIAL_REPORTS = [
  {
    id: 'RPT-2026-00012',
    deviceId: 'D002',
    reportedBy: 'U001',
    date: '2026-02-14',
    location: 'Kawale Market, Lilongwe',
    description:
      'Phone snatched from hand while walking near the market entrance in the afternoon. The thief ran towards the bus depot.',
    policeStation: 'Kawale Police Station, Lilongwe',
    status: 'active',
    verifiedAt: '2026-02-15',
    dispatched: true,
    caseNumber: 'MPS-LLW-2026-00231',
  },
  {
    id: 'RPT-2026-00031',
    deviceId: 'D006',
    reportedBy: 'U002',
    date: '2026-02-28',
    location: 'Chancellor College Library, Zomba',
    description:
      'Phone stolen from a study table while I briefly stepped away. My bag and books were left on the table.',
    policeStation: 'Zomba Central Police Station',
    status: 'active',
    verifiedAt: '2026-03-01',
    dispatched: true,
    caseNumber: 'MPS-ZBA-2026-00087',
  },
];

// ─── NETWORK DETECTION EVENTS ────────────────────────────────
// These are the intelligence events generated when a stolen device
// connects to the Airtel or TNM mobile network.
// Each event gives police: operator, active SIM, tower, coordinates.
export const INITIAL_EVENTS = [
  {
    id: 'EVT-001',
    reportId: 'RPT-2026-00012',
    imei: '490123456789012',
    detectedAt: '2026-03-08 09:14',
    operator: 'Airtel',
    activeSim: '+265 991 887 766', // New SIM inserted by thief
    tower: 'Kawale Tower B',
    latitude: -13.9226,
    longitude: 33.7641,
    radiusMeters: 500,
  },
  {
    id: 'EVT-002',
    reportId: 'RPT-2026-00012',
    imei: '490123456789012',
    detectedAt: '2026-03-08 14:22',
    operator: 'Airtel',
    activeSim: '+265 991 887 766',
    tower: 'Area 1 Tower',
    latitude: -13.9626,
    longitude: 33.7741,
    radiusMeters: 400,
  },
  {
    id: 'EVT-003',
    reportId: 'RPT-2026-00012',
    imei: '490123456789012',
    detectedAt: '2026-03-09 07:55',
    operator: 'TNM',
    activeSim: '+265 881 223 344', // Thief swapped SIM again
    tower: 'Old Town Tower',
    latitude: -13.9726,
    longitude: 33.7841,
    radiusMeters: 600,
  },
  {
    id: 'EVT-004',
    reportId: 'RPT-2026-00012',
    imei: '490123456789012',
    detectedAt: '2026-03-10 11:03',
    operator: 'Airtel',
    activeSim: '+265 881 223 344',
    tower: 'City Centre Tower',
    latitude: -13.9826,
    longitude: 33.7741,
    radiusMeters: 350,
  },
  {
    id: 'EVT-005',
    reportId: 'RPT-2026-00031',
    imei: '357893109876543',
    detectedAt: '2026-03-07 16:44',
    operator: 'TNM',
    activeSim: '+265 881 556 677',
    tower: 'Zomba Town Tower',
    latitude: -15.3869,
    longitude: 35.3183,
    radiusMeters: 700,
  },
  {
    id: 'EVT-006',
    reportId: 'RPT-2026-00031',
    imei: '357893109876543',
    detectedAt: '2026-03-10 08:12',
    operator: 'TNM',
    activeSim: '+265 881 556 677',
    tower: 'Chancellor College Area',
    latitude: -15.3769,
    longitude: 35.3283,
    radiusMeters: 500,
  },
];

// ─── TRANSFERS ───────────────────────────────────────────────
// status: 'pending' | 'completed' | 'expired'
export const INITIAL_TRANSFERS = [];

// ─── CITIZEN POLICE REMINDERS ─────────────────────────────────
// Pre-loaded demo reminders so the police dashboard shows the
// feature immediately without needing to manually send one first.
export const INITIAL_REMINDERS = [
  {
    id: 'RMD-001',
    reportId: 'RPT-2026-00012',
    caseNumber: 'MPS-LLW-2026-00231',
    fromUserId: 'U001',
    message:
      'SDIRS Device Tracking Alert\n' +
      '────────────────────────────\n' +
      'Case Number: MPS-LLW-2026-00231\n' +
      'Report ID: RPT-2026-00012\n' +
      'Device: Samsung Galaxy A54\n' +
      'Last Network Detection: 2026-03-10 11:03\n' +
      'General Area: City Centre, Lilongwe\n' +
      'Total Detections: 4\n' +
      'Network: Airtel\n' +
      '────────────────────────────\n' +
      'This device is actively connecting to the Airtel network.\n' +
      'Please escalate recovery efforts using the SDIRS intelligence data.\n' +
      'Contact MACRA SDIRS helpline: 1234 for full intelligence report.',
    detectionCount: 4,
    area: 'City Centre, Lilongwe',
    operator: 'Airtel',
    sentAt: '2026-03-10 13:45',
    read: false,
    acknowledged: false,
  },
  {
    id: 'RMD-002',
    reportId: 'RPT-2026-00031',
    caseNumber: 'MPS-ZBA-2026-00087',
    fromUserId: 'U002',
    message:
      'SDIRS Device Tracking Alert\n' +
      '────────────────────────────\n' +
      'Case Number: MPS-ZBA-2026-00087\n' +
      'Report ID: RPT-2026-00031\n' +
      'Device: Tecno Spark 10\n' +
      'Last Network Detection: 2026-03-10 08:12\n' +
      'General Area: Chancellor College Area, Zomba\n' +
      'Total Detections: 2\n' +
      'Network: TNM\n' +
      '────────────────────────────\n' +
      'It has been 10 days since I reported this theft and I have not received any update.\n' +
      'My device is still being detected on TNM in the Zomba area.\n' +
      'Please act on this urgently.\n' +
      'Contact MACRA SDIRS helpline: 1234 for full intelligence report.',
    detectionCount: 2,
    area: 'Chancellor College Area, Zomba',
    operator: 'TNM',
    sentAt: '2026-03-10 09:30',
    read: false,
    acknowledged: false,
  },
];

// ─── CHART DATA ───────────────────────────────────────────────
// Monthly activity for MACRA admin bar chart
// r = registrations, s = stolen reports, rc = recovered
export const CHART_DATA = [
  { month: 'Sep', registrations: 1, stolen: 0, recovered: 0 },
  { month: 'Oct', registrations: 1, stolen: 0, recovered: 0 },
  { month: 'Nov', registrations: 2, stolen: 0, recovered: 0 },
  { month: 'Dec', registrations: 1, stolen: 1, recovered: 1 },
  { month: 'Jan', registrations: 2, stolen: 1, recovered: 0 },
  { month: 'Feb', registrations: 1, stolen: 2, recovered: 0 },
  { month: 'Mar', registrations: 1, stolen: 1, recovered: 0 },
];

// ─── POLICE STATIONS ─────────────────────────────────────────
// Used in report and registration forms
export const POLICE_STATIONS = [
  'Kawale Police Station, Lilongwe',
  'Area 3 Police Station, Lilongwe',
  'Lilongwe Central Police Station',
  'Zomba Central Police Station',
  'Limbe Police Station, Blantyre',
  'Blantyre Central Police Station',
  'Mzuzu Police Station',
  'Kasungu Police Station',
  'Mchinji Police Station',
  'Karonga Police Station',
];
