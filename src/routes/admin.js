const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const { 
  USERS,
  AUDIT_LOGS,
  INITIAL_ASSETS_VALUE, 
  INITIAL_ROYALTY_STREAMS, 
  INITIAL_RECEIPTS,
  INITIAL_CONTRACTS,
  CAP_TABLE,
  KPI_DATA,
  OMNIVAEL_ASSETS,
  WAYFARER_ASSETS,
  WAYFARER_PROJECTS,
  WAYFARER_VAULT_ASSETS
} = require('../data');

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

router.get('/assets-value', (req, res) => {
  res.json({ value: INITIAL_ASSETS_VALUE });
});

router.get('/royalty-streams', (req, res) => {
  res.json(INITIAL_ROYALTY_STREAMS);
});

router.get('/receipts', (req, res) => {
  res.json(INITIAL_RECEIPTS);
});

router.get('/contracts', (req, res) => {
  res.json(INITIAL_CONTRACTS);
});

router.get('/cap-table', (req, res) => {
  res.json(CAP_TABLE);
});

router.get('/kpi', (req, res) => {
  res.json(KPI_DATA);
});

// User Management Routes
router.get('/users', (req, res) => {
  const safeUsers = USERS.map(u => {
    const { passwordHash, ...user } = u;
    return user;
  });
  res.json(safeUsers);
});

router.post('/users', (req, res) => {
  const { username, email, password, role, fullName, position, department, contactDetails, divisionId } = req.body;
  
  if (USERS.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    fullName,
    position,
    department,
    contactDetails: contactDetails || {},
    status: 'active',
    role: role || 'user',
    divisionId: divisionId || null,
    passwordHash: bcrypt.hashSync(password || 'default123', 10),
    mfaEnabled: false,
    nexus_level: 1,
    nexus_xp: 0,
    shard_balance: 0,
    is_elite: false
  };

  USERS.push(newUser);

  AUDIT_LOGS.push({
    id: Date.now().toString(),
    action: 'CREATE_USER',
    targetUserId: newUser.id,
    performedBy: req.user.username,
    timestamp: new Date().toISOString(),
    details: `Created user ${username} (${role})`
  });

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userIndex = USERS.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const oldUser = { ...USERS[userIndex] };
  
  // Prevent updating immutable fields directly here if needed, but for admin allow most
  delete updates.id;
  delete updates.passwordHash; // use reset-password for this

  USERS[userIndex] = { ...USERS[userIndex], ...updates };

  AUDIT_LOGS.push({
    id: Date.now().toString(),
    action: 'UPDATE_USER',
    targetUserId: id,
    performedBy: req.user.username,
    timestamp: new Date().toISOString(),
    details: `Updated user ${oldUser.username}. Fields: ${Object.keys(updates).join(', ')}`
  });

  const { passwordHash, ...safeUser } = USERS[userIndex];
  res.json(safeUser);
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = USERS.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const deletedUser = USERS[userIndex];
  USERS.splice(userIndex, 1);

  AUDIT_LOGS.push({
    id: Date.now().toString(),
    action: 'DELETE_USER',
    targetUserId: id,
    performedBy: req.user.username,
    timestamp: new Date().toISOString(),
    details: `Deleted user ${deletedUser.username}`
  });

  res.json({ message: 'User deleted successfully' });
});

router.post('/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const userIndex = USERS.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  USERS[userIndex].passwordHash = hashedPassword;

  AUDIT_LOGS.push({
    id: Date.now().toString(),
    action: 'RESET_PASSWORD',
    targetUserId: id,
    performedBy: req.user.username,
    timestamp: new Date().toISOString(),
    details: `Reset password for user ${USERS[userIndex].username}`
  });

  res.json({ message: 'Password reset successfully' });
});

router.get('/audit-logs', (req, res) => {
  res.json(AUDIT_LOGS.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Asset Management Routes (Omnivael Asset Packet)
router.get('/assets', (req, res) => {
  const { divisionId } = req.query;

  // Filter by division if provided
  let assets = OMNIVAEL_ASSETS;
  if (divisionId) {
    assets = assets.filter(a => a.divisionId === divisionId);
  }
  
  res.json(assets);
});

router.post('/assets', upload.single('file'), (req, res) => {
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
  
  // Generate ID (Mock)
  const count = OMNIVAEL_ASSETS.length + 1;
  const assetId = `OM-GEN-${String(count).padStart(3, '0')}`;

  const newAsset = {
    assetId,
    creatorId,
    divisionId: divisionId || 'unknown',
    ipStatus: ipStatus || 'Work_for_Hire',
    legalSignatureStatus: 'NULL',
    status: 'DRAFT',
    contentMetadata,
    financialTag,
    estimatedValue: estimatedValue || 0
  };

  OMNIVAEL_ASSETS.push(newAsset);
  res.status(201).json(newAsset);
});

router.put('/assets/:assetId', (req, res) => {
  const { assetId } = req.params;
  const updates = req.body;
  
  const index = OMNIVAEL_ASSETS.findIndex(a => a.assetId === assetId);
  if (index === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  // Prevent status update via this endpoint
  delete updates.status; 
  delete updates.legalSignatureStatus;
  delete updates.assetId;

  OMNIVAEL_ASSETS[index] = { ...OMNIVAEL_ASSETS[index], ...updates };
  res.json(OMNIVAEL_ASSETS[index]);
});

router.put('/assets/:assetId/status', (req, res) => {
  const { assetId } = req.params;
  const { status } = req.body;
  const { role: userRole } = req.user; // From Auth Middleware
  
  const asset = OMNIVAEL_ASSETS.find(a => a.assetId === assetId);
  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  // Permission Gate Logic
  if (status === 'IN-REVIEW') {
    if (asset.status !== 'DRAFT') {
       return res.status(400).json({ message: 'Can only submit Drafts for review' });
    }
    asset.status = 'IN-REVIEW';
  } else if (status === 'SIGNED') {
    if (userRole !== 'admin') {
         return res.status(403).json({ message: 'Only Admins can sign assets' });
    }
    asset.status = 'SIGNED';
    asset.legalSignatureStatus = new Date().toISOString();
  } else if (status === 'DRAFT') {
      asset.status = 'DRAFT';
      asset.legalSignatureStatus = 'NULL';
  }

  res.json(asset);
});

// Wayfarer / Interactive Division Routes
router.get('/wayfarer/assets', (req, res) => {
  res.json(WAYFARER_ASSETS);
});

router.post('/wayfarer/assets/sign', (req, res) => {
  const { assetId, assetName } = req.body;
  const asset = WAYFARER_ASSETS.find(a => a.id === assetId || a.name === assetName);
  if (asset) {
    asset.status = 'signed';
    res.json({ success: true, asset });
  } else {
    res.json({ success: true, message: 'Asset signed (mock)' });
  }
});

router.get('/wayfarer/projects', (req, res) => {
  res.json(WAYFARER_PROJECTS);
});

router.post('/wayfarer/projects/request', (req, res) => {
    const { projectId, request } = req.body;
    const project = WAYFARER_PROJECTS.find(p => p.id === projectId);
    if (project) {
        project.requests.push(request);
        res.json({ success: true, message: 'Request created', project });
    } else {
        res.status(404).json({ success: false, message: 'Project not found' });
    }
});

router.post('/wayfarer/deploy', (req, res) => {
    res.json({ success: true, message: 'Deployment triggered' });
});

router.get('/wayfarer/vault', (req, res) => {
  res.json(WAYFARER_VAULT_ASSETS);
});

module.exports = router;
