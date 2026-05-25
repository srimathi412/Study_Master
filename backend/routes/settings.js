const express = require('express');
const router = express.Router();
const { Settings } = require('../db');
const auth = require('../middleware/auth');

// GET /api/settings
router.get('/', auth, (req, res) => {
  try {
    let settings = Settings.findOne(req.user.id);
    if (!settings) {
      settings = Settings.create(req.user.id);
    }
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings
router.put('/', auth, (req, res) => {
  try {
    let settings = Settings.findOne(req.user.id);
    if (!settings) {
      settings = Settings.create(req.user.id, req.body);
    } else {
      // Strip protected fields from update
      const { _id, user, createdAt, ...updates } = req.body;
      Object.assign(settings, updates);
      Settings.save(settings);
    }
    res.json(settings);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
