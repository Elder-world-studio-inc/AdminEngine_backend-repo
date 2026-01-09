const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { USERS } = require('../data');
const { SECRET_KEY } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = USERS.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      divisionId: user.divisionId,
      // Include Nexus stats in token or just rely on DB fetch? 
      // For now, keeping token light, but frontend might need these in the response.
    },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  // Return full user profile (excluding sensitive hash) so Nexus/Omnivael know the stats
  const { passwordHash, ...userProfile } = user;
  res.json({ token, user: userProfile });
});

module.exports = router;
