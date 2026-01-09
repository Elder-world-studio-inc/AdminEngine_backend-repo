const db = require('../src/db');
const {
  USERS,
  INITIAL_ASSETS_VALUE,
  INITIAL_ROYALTY_STREAMS,
  INITIAL_RECEIPTS,
  INITIAL_CONTRACTS,
  INITIAL_BUDGET_ITEMS,
  CAP_TABLE,
  KPI_DATA,
  OMNIVAEL_ASSETS,
  WAYFARER_ASSETS,
  WAYFARER_VAULT_ASSETS,
  WAYFARER_PROJECTS,
  OMNIVAEL_LIBRARY,
  AUDIT_LOGS,
  SHAREHOLDERS
} = require('../src/data');

async function seed() {
  try {
    console.log('Seeding database...');

    // Users
    for (const user of USERS) {
        const check = await db.query('SELECT id FROM users WHERE email = $1', [user.email]);
        if (check.rows.length === 0) {
            await db.query(`
                INSERT INTO users (id, username, email, password_hash, role, nexus_level, nexus_xp, shard_balance, is_elite)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [user.id, user.username, user.email, user.passwordHash, user.role, user.nexus_level || 1, user.nexus_xp || 0, user.shard_balance || 0, user.is_elite || false]);
        }
    }
    console.log('Users seeded.');

    // KPI Stats
    await db.query('DELETE FROM kpi_stats');
    await db.query(`
        INSERT INTO kpi_stats (portfolio_size, headcount, runway_days)
        VALUES ($1, $2, $3)
    `, [KPI_DATA.portfolioSize, KPI_DATA.headcount, KPI_DATA.runwayDays]);
    console.log('KPI Stats seeded.');

    // Cap Table Meta
    await db.query('DELETE FROM cap_table_meta');
    await db.query(`
        INSERT INTO cap_table_meta (founders_shares, pool_shares, pool_utilized)
        VALUES ($1, $2, $3)
    `, [CAP_TABLE.founders, CAP_TABLE.pool, CAP_TABLE.poolUtilized]);
    console.log('Cap Table Meta seeded.');

    // Assets
    await db.query('DELETE FROM assets');
    for (const asset of OMNIVAEL_ASSETS) {
        await db.query(`
            INSERT INTO assets (id, creator_id, division_id, ip_status, legal_signature_status, status, content_metadata, financial_tag, estimated_value)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [asset.assetId, asset.creatorId, asset.divisionId, asset.ipStatus, asset.legalSignatureStatus, asset.status, asset.contentMetadata, asset.financialTag, asset.estimatedValue || 0]);
    }
    console.log('Assets seeded.');

    // Royalty Streams
    await db.query('DELETE FROM royalty_streams');
    for (const stream of INITIAL_ROYALTY_STREAMS) {
        await db.query(`
            INSERT INTO royalty_streams (id, name, value, category)
            VALUES ($1, $2, $3, $4)
        `, [stream.id, stream.name, stream.value, stream.category]);
    }
    console.log('Royalty Streams seeded.');

    // Receipts
    await db.query('DELETE FROM receipts');
    for (const receipt of INITIAL_RECEIPTS) {
        await db.query(`
            INSERT INTO receipts (id, date, asset, signer, amount)
            VALUES ($1, $2, $3, $4, $5)
        `, [receipt.id, receipt.date, receipt.asset, receipt.signer, receipt.amount]);
    }
    console.log('Receipts seeded.');

    // Contracts
    await db.query('DELETE FROM contracts');
    for (const contract of INITIAL_CONTRACTS) {
        await db.query(`
            INSERT INTO contracts (id, asset_id, signer, date)
            VALUES ($1, $2, $3, $4)
        `, [contract.id, contract.assetId, contract.signer, contract.date]);
    }
    console.log('Contracts seeded.');

    // Budget Items
    await db.query('DELETE FROM budget_items');
    for (const item of INITIAL_BUDGET_ITEMS) {
        await db.query(`
            INSERT INTO budget_items (id, category, name, allocated, actual, start_date, end_date, frequency)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [item.id, item.category, item.name, item.allocated, item.actual, item.startDate, item.endDate, item.frequency]);
    }
    console.log('Budget Items seeded.');

    // Shareholders
    await db.query('DELETE FROM shareholders');
    for (const sh of SHAREHOLDERS) {
        await db.query(`
            INSERT INTO shareholders (id, name, type, shares, percentage, email, grant_date)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [sh.id, sh.name, sh.type, sh.shares, sh.percentage, sh.email]);
    }
    console.log('Shareholders seeded.');

    // Audit Logs
    await db.query('DELETE FROM audit_logs');
    for (const log of AUDIT_LOGS) {
        await db.query(`
            INSERT INTO audit_logs (id, action, target_user_id, performed_by, timestamp, details)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [log.id, log.action, log.targetUserId, log.performedBy, log.timestamp, log.details]);
    }
    console.log('Audit Logs seeded.');

    // Wayfarer Assets
    await db.query('DELETE FROM wayfarer_assets');
    for (const wa of WAYFARER_ASSETS) {
        await db.query(`
            INSERT INTO wayfarer_assets (id, name, type, value, status)
            VALUES ($1, $2, $3, $4, $5)
        `, [wa.id, wa.name, wa.type, wa.value, wa.status]);
    }
    console.log('Interactive Assets seeded.');

    // Wayfarer Vault Assets
    await db.query('DELETE FROM wayfarer_vault_assets');
    for (const wva of WAYFARER_VAULT_ASSETS) {
        await db.query(`
            INSERT INTO wayfarer_vault_assets (id, name, type, polys, status, updated, author)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [wva.id, wva.name, wva.type, wva.polys, wva.status, wva.updated, wva.author]);
    }
    console.log('Interactive Vault Assets seeded.');

    // Wayfarer Projects
    await db.query('DELETE FROM wayfarer_projects');
    for (const wp of WAYFARER_PROJECTS) {
        await db.query(`
            INSERT INTO wayfarer_projects (id, name, description, zones, requests)
            VALUES ($1, $2, $3, $4, $5)
        `, [wp.id, wp.name, wp.description, JSON.stringify(wp.zones), JSON.stringify(wp.requests)]);
    }
    console.log('Interactive Projects seeded.');

    // Omnivael Library
    await db.query('DELETE FROM omnivael_library');
    for (const book of OMNIVAEL_LIBRARY) {
        await db.query(`
            INSERT INTO omnivael_library (id, title, author, type, cover, description, price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [book.id, book.title, book.author, book.type, book.cover, book.description, book.price]);
    }
    console.log('Omnivael Library seeded.');

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
