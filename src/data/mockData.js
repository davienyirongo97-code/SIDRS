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
 *   DEVICES      — registered devices (phones, laptops, tablets)
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
    avatarText: '🚔',
    avatarColor: '#C0252C',
  },
  {
    id: 'MACRA',
    name: 'MACRA Admin',
    phone: '+265 1 784 000',
    email: 'admin@macra.mw',
    location: 'Lilongwe HQ',
    role: 'macra',
    avatarText: '🏛',
    avatarColor: '#0A1628',
  },
];

// ─── DEVICES ─────────────────────────────────────────────────
// status: 'registered' | 'stolen' | 'recovered'
// type:   'mobile' | 'laptop' | 'tablet' | 'desktop'
export const INITIAL_DEVICES = [
  {
    id: 'D001',
    type: 'mobile',
    make: 'Samsung',
    model: 'Galaxy A54',
    color: 'Phantom Black',
    imei: '356789012345678',   // Primary identifier for phones
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
    status: 'stolen',         // Active theft alert on this device
  },
  {
    id: 'D003',
    type: 'laptop',
    make: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    color: 'Black',
    imei: null,               // Laptops use serial + MAC
    serial: 'LNV-X1C-2024-7721',
    mac: 'A4:C3:F0:85:AC:12',
    ownerId: 'U002',
    registeredDate: '2025-10-05',
    status: 'registered',
  },
  {
    id: 'D004',
    type: 'mobile',
    make: 'Apple',
    model: 'iPhone 13',
    color: 'Midnight',
    imei: '357893109876543',
    serial: 'APL-IPH-2024-9901',
    mac: null,
    ownerId: 'U002',
    registeredDate: '2026-01-10',
    status: 'stolen',
  },
  {
    id: 'D005',
    type: 'laptop',
    make: 'Dell',
    model: 'Inspiron 15',
    color: 'Silver',
    imei: null,
    serial: 'DEL-INS-2024-5541',
    mac: 'B8:27:EB:F1:3A:44',
    ownerId: 'U003',
    registeredDate: '2025-09-20',
    status: 'recovered',      // Successfully recovered via SDIRS
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
    ownerId: 'U003',
    registeredDate: '2026-01-25',
    status: 'registered',
  },
  {
    id: 'D007',
    type: 'laptop',
    make: 'HP',
    model: 'Envy 14',
    color: 'Natural Silver',
    imei: null,
    serial: 'HP-ENY-2025-7723',
    mac: 'DC:A6:32:45:BC:78',
    ownerId: 'U001',
    registeredDate: '2026-02-03',
    status: 'stolen',
  },
  {
    id: 'D008',
    type: 'tablet',
    make: 'Samsung',
    model: 'Galaxy Tab A8',
    color: 'Gray',
    imei: '358765432198765',
    serial: 'SAM-TAB-2025-4421',
    mac: 'F0:9F:C2:11:22:33',
    ownerId: 'U002',
    registeredDate: '2026-02-18',
    status: 'registered',
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
    deviceId: 'D004',
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
  {
    id: 'RPT-2026-00045',
    deviceId: 'D007',
    reportedBy: 'U001',
    date: '2026-03-05',
    location: 'Shoprite, City Mall Lilongwe',
    description:
      'Laptop bag taken from shopping trolley while I was distracted choosing items from a shelf.',
    policeStation: 'Area 3 Police Station, Lilongwe',
    status: 'pending',         // Not yet police-verified
    verifiedAt: null,
    dispatched: false,
    caseNumber: null,
  },
  {
    id: 'RPT-2025-00198',
    deviceId: 'D005',
    reportedBy: 'U003',
    date: '2025-12-10',
    location: 'Chichiri Mall, Blantyre',
    description: 'Laptop taken from parked car. Window was smashed.',
    policeStation: 'Limbe Police Station, Blantyre',
    status: 'resolved',
    verifiedAt: '2025-12-11',
    dispatched: true,
    caseNumber: 'MPS-BLT-2025-00441',
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
    activeSim: '+265 991 887 766',  // New SIM inserted by thief
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
    activeSim: '+265 881 223 344',  // Thief swapped SIM again
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
export const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2026-0301-00021',
    deviceId: 'D005',
    sellerId: 'U003',
    buyerId: 'U001',
    pin: 'TRF-9KX2-M4PW',
    status: 'completed',
    createdAt: '2026-03-01 10:18',
    priceMWK: 180000,
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
