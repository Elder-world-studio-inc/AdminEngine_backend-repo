const express = require('express');
const router = express.Router();

const { OMNIVAEL_LIBRARY } = require('../data');

// Placeholder for Omnivael Production App
router.get('/', (req, res) => {
  res.json({ message: 'Omnivael API - Slot 3 Production' });
});

router.get('/library', (req, res) => {
  const { type } = req.query;
  let results = OMNIVAEL_LIBRARY;

  if (type) {
    results = results.filter(item => item.type.toLowerCase() === type.toLowerCase());
  }

  res.json({ 
    message: 'Omnivael Library Content', 
    count: results.length,
    items: results 
  });
});

module.exports = router;
