const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { USERS } = require('../data');

// Placeholder for Nexus Production App
router.get('/', (req, res) => {
  res.json({ message: 'Nexus API - Slot 1 Production' });
});

router.get('/status', (req, res) => {
  res.json({ status: 'online', version: '1.0.0' });
});

// Slot 4 Shared Auth Demo: Get Player Profile
router.get('/profile', authenticateToken, (req, res) => {
  // In a real DB, we would fetch fresh data here.
  // Since we are using in-memory mock data, we find the user again to get latest stats.
  const user = USERS.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Return specific Nexus data
  res.json({
    username: user.username,
    level: user.nexus_level || 1,
    xp: user.nexus_xp || 0,
    shards: user.shard_balance || 0,
    isElite: user.is_elite || false
  });
});

module.exports = router;
