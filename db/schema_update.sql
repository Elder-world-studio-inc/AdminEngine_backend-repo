
-- KPI Stats
CREATE TABLE IF NOT EXISTS kpi_stats (
    id SERIAL PRIMARY KEY,
    portfolio_size INT DEFAULT 0,
    headcount INT DEFAULT 0,
    runway_days INT DEFAULT 0
);

-- Cap Table Meta
CREATE TABLE IF NOT EXISTS cap_table_meta (
    id SERIAL PRIMARY KEY,
    founders_shares BIGINT DEFAULT 0,
    pool_shares BIGINT DEFAULT 0,
    pool_utilized BIGINT DEFAULT 0
);

-- Assets (Omnivael Assets)
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    division_id TEXT,
    ip_status TEXT,
    legal_signature_status TEXT,
    status TEXT,
    content_metadata JSONB,
    financial_tag JSONB,
    estimated_value NUMERIC DEFAULT 0
);

-- Royalty Streams
CREATE TABLE IF NOT EXISTS royalty_streams (
    id TEXT PRIMARY KEY,
    name TEXT,
    value NUMERIC DEFAULT 0,
    category TEXT
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    date DATE,
    asset TEXT,
    signer TEXT,
    amount NUMERIC DEFAULT 0
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    asset_id TEXT,
    signer TEXT,
    date DATE
);

-- Budget Items
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    category TEXT,
    name TEXT,
    allocated NUMERIC DEFAULT 0,
    actual NUMERIC DEFAULT 0,
    start_date DATE,
    end_date DATE,
    frequency TEXT
);

-- Shareholders
CREATE TABLE IF NOT EXISTS shareholders (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    shares BIGINT DEFAULT 0,
    percentage NUMERIC DEFAULT 0,
    email TEXT,
    grant_date TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT,
    target_user_id TEXT,
    performed_by TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    details TEXT
);

-- Wayfarer Assets
CREATE TABLE IF NOT EXISTS wayfarer_assets (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    value NUMERIC DEFAULT 0,
    status TEXT
);

-- Wayfarer Vault Assets
CREATE TABLE IF NOT EXISTS wayfarer_vault_assets (
    id INT PRIMARY KEY,
    name TEXT,
    type TEXT,
    polys INT,
    status TEXT,
    updated TEXT,
    author TEXT
);

-- Wayfarer Projects
CREATE TABLE IF NOT EXISTS wayfarer_projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    zones JSONB,
    requests JSONB
);

-- Omnivael Library
CREATE TABLE IF NOT EXISTS omnivael_library (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    type TEXT,
    cover TEXT,
    description TEXT,
    price NUMERIC DEFAULT 0
);
