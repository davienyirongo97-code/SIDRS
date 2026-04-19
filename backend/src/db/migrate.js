/**
 * Run this once to create all tables:
 * node src/db/migrate.js
 */

require('dotenv').config();
const pool = require('./pool');

const SQL = `
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(20) NOT NULL UNIQUE,
  email         VARCHAR(100),
  role          VARCHAR(10) NOT NULL CHECK (role IN ('citizen', 'police', 'macra')),
  district      VARCHAR(50),
  location      VARCHAR(100),
  password_hash VARCHAR(100),
  avatar_text   VARCHAR(5),
  avatar_color  VARCHAR(10),
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- DEVICES
CREATE TABLE IF NOT EXISTS devices (
  id                  VARCHAR(30) PRIMARY KEY,
  type                VARCHAR(10) NOT NULL CHECK (type IN ('mobile','laptop','tablet','desktop')),
  make                VARCHAR(50) NOT NULL,
  model               VARCHAR(50) NOT NULL,
  color               VARCHAR(30),
  imei                VARCHAR(20) UNIQUE,
  imei2               VARCHAR(20) UNIQUE,
  serial              VARCHAR(50) UNIQUE,
  mac                 VARCHAR(20) UNIQUE,
  tac                 VARCHAR(8),
  owner_id            VARCHAR(20) REFERENCES users(id),
  status              VARCHAR(25) DEFAULT 'registered' CHECK (status IN ('registered','pending_verification','stolen','recovered')),
  registered_date     DATE DEFAULT CURRENT_DATE,
  purchase_date       DATE,
  purchase_place      VARCHAR(100),
  estimated_value_mwk INTEGER,
  ceir_status         VARCHAR(20) DEFAULT 'unchecked',
  owner_full_name     VARCHAR(100),
  owner_phone         VARCHAR(20),
  owner_email         VARCHAR(100),
  owner_id_type       VARCHAR(20),
  owner_id_number     VARCHAR(50),
  owner_district      VARCHAR(50),
  owner_village       VARCHAR(100),
  owner_residence     TEXT,
  ref_name            VARCHAR(100),
  ref_relationship    VARCHAR(50),
  ref_phone           VARCHAR(20),
  ref_email           VARCHAR(100)
);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id                  VARCHAR(30) PRIMARY KEY,
  device_id           VARCHAR(30) REFERENCES devices(id),
  reported_by         VARCHAR(20) REFERENCES users(id),
  date                DATE NOT NULL,
  police_station      VARCHAR(100),
  location            VARCHAR(150),
  description         TEXT,
  status              VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','active','resolved')),
  case_number         VARCHAR(30),
  reporting_district  VARCHAR(50),
  active_district     VARCHAR(50),
  verified_at         DATE,
  dispatched          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- DETECTIONS (telco events + Pi node events)
CREATE TABLE IF NOT EXISTS detections (
  id              VARCHAR(30) PRIMARY KEY,
  report_id       VARCHAR(30) REFERENCES reports(id),
  source          VARCHAR(20) CHECK (source IN ('telco','pi_node')),
  operator        VARCHAR(20),
  detected_at     TIMESTAMP DEFAULT NOW(),
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  tower           VARCHAR(100),
  active_sim      VARCHAR(20),
  radius_meters   INTEGER,
  node_id         VARCHAR(30),
  mac_detected    VARCHAR(20)
);

-- TRANSFERS
CREATE TABLE IF NOT EXISTS transfers (
  id            VARCHAR(30) PRIMARY KEY,
  device_id     VARCHAR(30) REFERENCES devices(id),
  seller_id     VARCHAR(20) REFERENCES users(id),
  buyer_id      VARCHAR(20) REFERENCES users(id),
  pin           VARCHAR(20) NOT NULL,
  status        VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  price_mwk     INTEGER,
  created_at    TIMESTAMP DEFAULT NOW(),
  completed_at  TIMESTAMP
);

-- REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
  id               VARCHAR(30) PRIMARY KEY,
  report_id        VARCHAR(30) REFERENCES reports(id),
  case_number      VARCHAR(30),
  from_user_id     VARCHAR(20) REFERENCES users(id),
  message          TEXT,
  detection_count  INTEGER DEFAULT 0,
  area             VARCHAR(100),
  operator         VARCHAR(20),
  sent_at          TIMESTAMP DEFAULT NOW(),
  acknowledged     BOOLEAN DEFAULT FALSE,
  acknowledged_at  TIMESTAMP
);

-- PI NODES
CREATE TABLE IF NOT EXISTS pi_nodes (
  id            VARCHAR(30) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  district      VARCHAR(50) NOT NULL,
  location      VARCHAR(150),
  latitude      DECIMAL(10,7),
  longitude     DECIMAL(10,7),
  status        VARCHAR(15) DEFAULT 'active' CHECK (status IN ('active','offline','maintenance')),
  api_key       VARCHAR(64) UNIQUE,
  last_ping     TIMESTAMP,
  installed_at  DATE DEFAULT CURRENT_DATE
);

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  user_id     VARCHAR(20),
  action      VARCHAR(50),
  target_id   VARCHAR(30),
  target_type VARCHAR(20),
  ip_address  VARCHAR(45),
  details     JSONB,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- API KEYS (machine-to-machine auth for MACRA, telcos, Pi nodes)
CREATE TABLE IF NOT EXISTS api_keys (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  key         VARCHAR(100) NOT NULL UNIQUE,
  scope       VARCHAR(20) NOT NULL CHECK (scope IN ('macra','telco','pi_node','admin')),
  active      BOOLEAN DEFAULT TRUE,
  use_count   INTEGER DEFAULT 0,
  last_used   TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);
`;

async function migrate() {
  try {
    await pool.query(SQL);
    console.log('✅ All tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
