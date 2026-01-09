const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
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

router.post('/assets', (req, res) => {
  const { creatorId, divisionId, contentMetadata, financialTag, ipStatus } = req.body;
  
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
    financialTag
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
