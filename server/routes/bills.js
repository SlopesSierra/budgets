const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all bills
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills ORDER BY due_date ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a bill
router.post('/', async (req, res) => {
  const { name, amount, due_date, frequency, category, status, notes } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO bills (name, amount, due_date, frequency, category, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, amount, due_date, frequency || 'monthly', category, status || 'Pending', notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a bill
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, amount, due_date, frequency, category, status, notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE bills SET name=$1, amount=$2, due_date=$3, frequency=$4,
       category=$5, status=$6, notes=$7 WHERE id=$8 RETURNING *`,
      [name, amount, due_date, frequency, category, status, notes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a bill
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM bills WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;