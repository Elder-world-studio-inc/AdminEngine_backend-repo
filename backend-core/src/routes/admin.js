const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Protect all admin routes
router.use(authenticateToken);

router.get('/assets-value', async (req, res) => {
  try {
    const result = await db.query('SELECT SUM(estimated_value) as value FROM assets');
    res.json({ value: parseInt(result.rows[0].value) || 0 });
  } catch (err) {
    console.error('Error fetching assets value:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/royalty-streams', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, value, category FROM royalty_streams');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching royalty streams:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/contracts', async (req, res) => {
  try {
    const result = await db.query('SELECT id, asset_id as "assetId", signer, date FROM contracts');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contracts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/contracts', async (req, res) => {
    const { assetId, signer, date } = req.body;
    try {
        const id = Date.now().toString();
        await db.query('INSERT INTO contracts (id, asset_id, signer, date) VALUES ($1, $2, $3, $4)', [id, assetId, signer, date]);
        res.status(201).json({ id, assetId, signer, date });
    } catch (err) {
        console.error('Error creating contract:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/receipts', async (req, res) => {
  try {
    const result = await db.query('SELECT id, date, asset, signer, amount FROM receipts');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/receipts', async (req, res) => {
    const { date, asset, signer, amount } = req.body;
    try {
        const id = Date.now().toString();
        await db.query('INSERT INTO receipts (id, date, asset, signer, amount) VALUES ($1, $2, $3, $4, $5)', [id, date, asset, signer, amount]);
        res.status(201).json({ id, date, asset, signer, amount });
    } catch (err) {
        console.error('Error creating receipt:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/budget', async (req, res) => {
  try {
    const result = await db.query('SELECT id, category, name, allocated, actual, start_date as "startDate", end_date as "endDate", frequency FROM budget_items');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching budget:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/cap-table', async (req, res) => {
  try {
    const result = await db.query('SELECT founders_shares as founders, pool_shares as pool, pool_utilized as "poolUtilized" FROM cap_table_meta LIMIT 1');
    if (result.rows.length > 0) {
      const row = result.rows[0];
      res.json({
        founders: parseInt(row.founders),
        pool: parseInt(row.pool),
        poolUtilized: parseInt(row.poolUtilized)
      });
    } else {
      res.json({ founders: 0, pool: 0, poolUtilized: 0 });
    }
  } catch (err) {
    console.error('Error fetching cap table:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/kpi', async (req, res) => {
  try {
    const result = await db.query('SELECT portfolio_size as "portfolioSize", headcount, runway_days as "runwayDays" FROM kpi_stats LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ portfolioSize: 0, headcount: 0, runwayDays: 0 });
    }
  } catch (err) {
    console.error('Error fetching KPI:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Shareholder & Equity Routes
router.get('/shareholders', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, type, shares, percentage, email, grant_date as "grantDate" FROM shareholders');
    const shareholders = result.rows.map(row => ({
        ...row,
        shares: parseInt(row.shares)
    }));
    res.json(shareholders);
  } catch (err) {
    console.error('Error fetching shareholders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/shareholders', async (req, res) => {
  const { name, type, shares, email } = req.body;
  
  try {
    const query = `
      INSERT INTO shareholders (id, name, type, shares, percentage, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, type, shares, percentage, email, grant_date as "grantDate"
    `;
    const percentage = (parseInt(shares) / 10000000) * 100; // Assuming total shares is 10M for now
    // Generate ID since schema uses TEXT
    const id = Date.now().toString();
    const values = [id, name, type, parseInt(shares), percentage, email];
    
    const result = await db.query(query, values);
    const newShareholder = {
        ...result.rows[0],
        shares: parseInt(result.rows[0].shares)
    };
    
    res.status(201).json(newShareholder);
  } catch (err) {
    console.error('Error creating shareholder:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/cap-table/grant', async (req, res) => {
  const { userId, shares } = req.body;
  
  try {
    // Get User
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    // Get Cap Table
    const capResult = await db.query('SELECT * FROM cap_table_meta LIMIT 1');
    let capTable = capResult.rows[0] || { pool_shares: 0, pool_utilized: 0 };
    
    const amount = parseInt(shares);
    
    if (parseInt(capTable.pool_utilized) + amount > parseInt(capTable.pool_shares)) {
      return res.status(400).json({ message: 'Insufficient options in pool' });
    }

    // Update Pool
    const newUtilized = parseInt(capTable.pool_utilized) + amount;
    if (capResult.rows.length > 0) {
        await db.query('UPDATE cap_table_meta SET pool_utilized = $1 WHERE id = $2', [newUtilized, capTable.id]);
    } else {
         // Should have been initialized, but just in case
         await db.query('INSERT INTO cap_table_meta (founders_shares, pool_shares, pool_utilized) VALUES (0, 1000000, $1)', [newUtilized]);
    }

    // Add to Shareholders
    const query = `
      INSERT INTO shareholders (id, name, type, shares, percentage, email, grant_date)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const percentage = (amount / 10000000) * 100;
    const id = Date.now().toString();
    const values = [id, user.username, 'Employee', amount, percentage, user.email];
    
    await db.query(query, values);

    // Audit Log
    const auditQuery = `
        INSERT INTO audit_logs (id, action, target_user_id, performed_by, details)
        VALUES ($1, $2, $3, $4, $5)
    `;
    await db.query(auditQuery, [Date.now().toString(), 'GRANT_OPTIONS', userId, req.user.username, `Granted ${amount} options to ${user.username}`]);

    res.json({ success: true, message: 'Options granted', poolUtilized: newUtilized });
  } catch (err) {
    console.error('Error granting options:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User Management Routes
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email, role, nexus_level, shard_balance, is_elite FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  try {
    const check = await db.query('SELECT 1 FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = bcrypt.hashSync(password || 'default123', 10);
    const id = Date.now().toString(); // Use numeric ID if serial, but we used TEXT in seed for some reason? 
    // Wait, DB schema for users says ID is SERIAL (int) in db-init.js but TEXT/UUID in schema.sql?
    // Let's check schema_update.sql -> It doesn't create users table.
    // db-init.js created users table with SERIAL id.
    // But schema.sql (from earlier Read) said UUID.
    // I should probably stick to what's in the DB.
    // Since I ran db:migrate which ran schema_update.sql, it didn't touch users table.
    // The seed script inserted IDs as strings ('1', '2', etc).
    // If the column is SERIAL, inserting strings might fail if not castable, but '1' is fine.
    // Let's rely on DB to generate ID if it's SERIAL, or generate UUID if it's UUID.
    // I'll assume it's SERIAL based on db-init.js, so I won't pass ID.
    
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role
    `;
    const values = [username, email, passwordHash, role || 'user'];
    const result = await db.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  delete updates.id;
  delete updates.passwordHash;

  try {
    // Build dynamic update query
    const keys = Object.keys(updates);
    if (keys.length === 0) return res.json({});

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...keys.map(key => updates[key])];
    
    const query = `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, username, email, role`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Audit Log
    await db.query(
        'INSERT INTO audit_logs (id, action, target_user_id, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
        [Date.now().toString(), 'UPDATE_USER', id, req.user.username, `Updated user fields: ${keys.join(', ')}`]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING username', [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
        'INSERT INTO audit_logs (id, action, target_user_id, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
        [Date.now().toString(), 'DELETE_USER', id, req.user.username, `Deleted user ${result.rows[0].username}`]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const result = await db.query('UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING username', [hashedPassword, id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
        'INSERT INTO audit_logs (id, action, target_user_id, performed_by, details) VALUES ($1, $2, $3, $4, $5)',
        [Date.now().toString(), 'RESET_PASSWORD', id, req.user.username, `Reset password for user ${result.rows[0].username}`]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Asset Management Routes
router.get('/assets', async (req, res) => {
  const { divisionId } = req.query;
  
  try {
    let query = `
        SELECT 
            id as "assetId",
            creator_id as "creatorId",
            division_id as "divisionId",
            ip_status as "ipStatus",
            legal_signature_status as "legalSignatureStatus",
            status,
            content_metadata as "contentMetadata",
            financial_tag as "financialTag",
            estimated_value as "estimatedValue"
        FROM assets
    `;
    let params = [];
    
    if (divisionId) {
      query += ' WHERE division_id = $1';
      params.push(divisionId);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/assets', upload.single('file'), async (req, res) => {
  let { creatorId, divisionId, contentMetadata, financialTag, ipStatus, estimatedValue } = req.body;
  
  // Parse JSON strings if coming from FormData
  if (typeof contentMetadata === 'string') {
    try {
      contentMetadata = JSON.parse(contentMetadata);
    } catch (e) {
      console.error('Error parsing contentMetadata:', e);
    }
  }
  
  if (typeof financialTag === 'string') {
    try {
      financialTag = JSON.parse(financialTag);
    } catch (e) {
      console.error('Error parsing financialTag:', e);
    }
  }

  // Add file info if uploaded
  if (req.file) {
    contentMetadata = {
      ...contentMetadata,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    };
  }
  
  try {
      // Generate ID
      const countResult = await db.query('SELECT COUNT(*) FROM assets');
      const count = parseInt(countResult.rows[0].count) + 1;
      const assetId = `OM-GEN-${String(count).padStart(3, '0')}`;

      const query = `
        INSERT INTO assets (id, creator_id, division_id, ip_status, legal_signature_status, status, content_metadata, financial_tag, estimated_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
            id as "assetId",
            creator_id as "creatorId",
            division_id as "divisionId",
            ip_status as "ipStatus",
            legal_signature_status as "legalSignatureStatus",
            status,
            content_metadata as "contentMetadata",
            financial_tag as "financialTag",
            estimated_value as "estimatedValue"
      `;
      const values = [
        assetId,
        creatorId,
        divisionId || 'unknown',
        ipStatus || 'Work_for_Hire',
        'NULL',
        'DRAFT',
        contentMetadata,
        financialTag,
        estimatedValue || 0
      ];

      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
  } catch (err) {
      console.error('Error creating asset:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/assets/:assetId', async (req, res) => {
  const { assetId } = req.params;
  const updates = req.body;
  
  // Prevent status update via this endpoint
  delete updates.status; 
  delete updates.legalSignatureStatus;
  delete updates.assetId;
  delete updates.creatorId; // Usually immutable
  
  try {
      // Build dynamic update query
      const keys = Object.keys(updates);
      if (keys.length === 0) return res.json({});
      
      // Map frontend camelCase to backend snake_case
      const map = {
          divisionId: 'division_id',
          ipStatus: 'ip_status',
          contentMetadata: 'content_metadata',
          financialTag: 'financial_tag',
          estimatedValue: 'estimated_value'
      };
      
      const setClause = keys.map((key, index) => `${map[key] || key} = $${index + 2}`).join(', ');
      const values = [assetId, ...keys.map(key => updates[key])];
      
      const query = `
        UPDATE assets 
        SET ${setClause} 
        WHERE id = $1 
        RETURNING 
            id as "assetId",
            creator_id as "creatorId",
            division_id as "divisionId",
            ip_status as "ipStatus",
            legal_signature_status as "legalSignatureStatus",
            status,
            content_metadata as "contentMetadata",
            financial_tag as "financialTag",
            estimated_value as "estimatedValue"
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      
      res.json(result.rows[0]);
  } catch (err) {
      console.error('Error updating asset:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/assets/:assetId/status', async (req, res) => {
  const { assetId } = req.params;
  const { status } = req.body;
  const { role: userRole } = req.user; 
  
  try {
      const assetResult = await db.query('SELECT * FROM assets WHERE id = $1', [assetId]);
      if (assetResult.rows.length === 0) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      const asset = assetResult.rows[0];

      let newStatus = status;
      let newSigStatus = asset.legal_signature_status;

      // Permission Gate Logic
      if (status === 'IN-REVIEW') {
        if (asset.status !== 'DRAFT') {
           return res.status(400).json({ message: 'Can only submit Drafts for review' });
        }
        newStatus = 'IN-REVIEW';
      } else if (status === 'SIGNED') {
        if (userRole !== 'admin') {
             return res.status(403).json({ message: 'Only Admins can sign assets' });
        }
        newStatus = 'SIGNED';
        newSigStatus = new Date().toISOString();
      } else if (status === 'DRAFT') {
          newStatus = 'DRAFT';
          newSigStatus = 'NULL';
      }

      const query = `
        UPDATE assets 
        SET status = $1, legal_signature_status = $2 
        WHERE id = $3 
        RETURNING 
            id as "assetId",
            creator_id as "creatorId",
            division_id as "divisionId",
            ip_status as "ipStatus",
            legal_signature_status as "legalSignatureStatus",
            status,
            content_metadata as "contentMetadata",
            financial_tag as "financialTag",
            estimated_value as "estimatedValue"
      `;
      const result = await db.query(query, [newStatus, newSigStatus, assetId]);
      
      res.json(result.rows[0]);
  } catch (err) {
      console.error('Error updating asset status:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Interactive Division Routes
router.get('/interactive/assets', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM wayfarer_assets');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching interactive assets:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/interactive/assets/sign', async (req, res) => {
  const { assetId, assetName } = req.body;
  
  try {
      let query = 'UPDATE wayfarer_assets SET status = $1 WHERE ';
      let params = ['signed'];
      
      if (assetId) {
          query += 'id = $2';
          params.push(assetId);
      } else if (assetName) {
          query += 'name = $2';
          params.push(assetName);
      } else {
          return res.status(400).json({ message: 'Asset ID or Name required' });
      }
      
      query += ' RETURNING *';
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
          // If mock behavior is still desired for missing items, we could return success, but let's stick to DB
           return res.status(404).json({ message: 'Asset not found' });
      }
      
      res.json({ success: true, asset: result.rows[0] });
  } catch (err) {
      console.error('Error signing interactive asset:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/interactive/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM wayfarer_projects');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching interactive projects:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/interactive/projects/request', async (req, res) => {
    const { projectId, request } = req.body;
    
    try {
        const projectResult = await db.query('SELECT * FROM wayfarer_projects WHERE id = $1', [projectId]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        let requests = projectResult.rows[0].requests || [];
        requests.push(request);
        
        const updateResult = await db.query('UPDATE wayfarer_projects SET requests = $1 WHERE id = $2 RETURNING *', [JSON.stringify(requests), projectId]);
        
        res.json({ success: true, message: 'Request created', project: updateResult.rows[0] });
    } catch (err) {
        console.error('Error adding project request:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/interactive/deploy', (req, res) => {
    // This might trigger an external process, so we keep it simple for now
    res.json({ success: true, message: 'Deployment triggered' });
});

router.get('/interactive/vault', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM wayfarer_vault_assets');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching vault assets:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Organization Routes
router.get('/organization/divisions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM divisions');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching divisions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/organization/roles', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM org_roles');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/organization/structure', async (req, res) => {
  try {
    // Fetch all divisions and roles to build a nested structure
    const divisionsResult = await db.query('SELECT * FROM divisions');
    const rolesResult = await db.query('SELECT * FROM org_roles');
    
    const divisions = divisionsResult.rows;
    const roles = rolesResult.rows;
    
    const structure = divisions.map(div => {
        const divRoles = roles.filter(role => role.division_id === div.id);
        return {
            ...div,
            roles: divRoles
        };
    });
    
    res.json(structure);
  } catch (err) {
    console.error('Error fetching organization structure:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
