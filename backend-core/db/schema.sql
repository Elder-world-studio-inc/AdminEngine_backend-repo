-- Core User Identity Table
-- Supports Shared Auth across Nexus (Slot 1), Omnivael (Slot 3), and Admin Tools (Slot 5)

CREATE TABLE users ( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    username VARCHAR(50) UNIQUE NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL, 
    password_hash TEXT NOT NULL, 
    
    -- Nexus Gamification Stats
    nexus_level INT DEFAULT 1, 
    nexus_xp INT DEFAULT 0, 
    
    -- Economy
    shard_balance INT DEFAULT 0, 
    
    -- Status / Subscription
    is_elite BOOLEAN DEFAULT FALSE, 
    
    -- Metadata
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'moderator'
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Index for fast lookups by username/email during login
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
