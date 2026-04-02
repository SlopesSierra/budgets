const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all debts
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM debts ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a debt
router.post('/', async (req, res) => {
  const { name, debt_type, current_balance, credit_limit, interest_rate, minimum_payment, due_date } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO debts (name, debt_type, current_balance, credit_limit, interest_rate, minimum_payment, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, debt_type || 'credit_card', current_balance || 0, credit_limit || 0, interest_rate || 0, minimum_payment || 0, due_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a debt
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, debt_type, current_balance, credit_limit, interest_rate, minimum_payment, due_date } = req.body;

  try {
    const result = await db.query(
      `UPDATE debts SET name=$1, debt_type=$2, current_balance=$3, credit_limit=$4,
       interest_rate=$5, minimum_payment=$6, due_date=$7 WHERE id=$8 RETURNING *`,
      [name, debt_type || 'credit_card', current_balance, credit_limit, interest_rate, minimum_payment, due_date, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a debt
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM debts WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
