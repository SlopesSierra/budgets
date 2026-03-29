const express = require('express');
const router = express.Router();
const db = require('../db');

// GET a setting by key
router.get('/:key', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT value FROM settings WHERE key=$1',
      [req.params.key]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT upsert a setting
router.put('/:key', async (req, res) => {
  const { value } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=now()
       RETURNING *`,
      [req.params.key, value]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;