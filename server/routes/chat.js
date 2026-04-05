const express = require('express');
const router = express.Router();
const db = require('../db');

// Node v18+ provides global fetch. Fallback to node-fetch if needed.
const fetchFn = (typeof fetch !== 'undefined') ? fetch : require('node-fetch');

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const [bills, debts, settings, history] = await Promise.all([
      db.query('SELECT * FROM bills ORDER BY due_date ASC'),
      db.query('SELECT * FROM debts ORDER BY due_date ASC'),
      db.query('SELECT * FROM settings'),
      db.query('SELECT role, content FROM conversations ORDER BY created_at DESC LIMIT 20')
    ]);

    const getSetting = (key) => settings.rows.find(s => s.key === key)?.value;

    const balance = getSetting('available_balance') || '0';
    const payDate = getSetting('next_pay_date') || 'unknown';
    const ollamaUrl = getSetting('ollama_url') || 'http://localhost:11435';
    const ollamaModel = getSetting('ollama_model') || 'llama3.1';

    const pendingBills = bills.rows.filter(b => b.status === 'Pending');
    const totalBills = pendingBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalDebt = debts.rows.reduce((sum, d) => sum + parseFloat(d.current_balance), 0);
    const minPayments = debts.rows.reduce((sum, d) => sum + parseFloat(d.minimum_payment), 0);

    const context = `
Use markdown formatting in your responses — bullet points, bold for numbers, and clear sections. Keep responses concise.    
You are a personal financial assistant. You have access to the user's real financial data shown below.
Be helpful, specific, and use actual numbers from their data. Keep responses concise and practical.

=== FINANCIAL SNAPSHOT ===
Available Balance: $${parseFloat(balance).toFixed(2)}
Next Pay Date: ${payDate}
Total Pending Bills: $${totalBills.toFixed(2)}
Total Credit Card Debt: $${totalDebt.toFixed(2)}
Total Minimum Payments: $${minPayments.toFixed(2)}/month

=== PENDING BILLS ===
${pendingBills.map(b =>
  `- ${b.name}: $${parseFloat(b.amount).toFixed(2)} due ${b.due_date} (${b.category})`
).join('\n')}

=== CREDIT CARDS & DEBTS ===
${debts.rows.map(d =>
  `- ${d.name}: Balance $${parseFloat(d.current_balance).toFixed(2)}, Limit $${parseFloat(d.credit_limit).toFixed(2)}, APR ${d.interest_rate}%, Min Payment $${parseFloat(d.minimum_payment).toFixed(2)}`
).join('\n')}
`.trim();

    const conversationHistory = history.rows.reverse().map(row => ({
      role: row.role,
      content: row.content
    }));

    await db.query(
      'INSERT INTO conversations (role, content) VALUES ($1, $2)',
      ['user', message]
    );

    const ollamaResponse = await fetchFn(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          { role: 'system', content: context },
          ...conversationHistory,
          { role: 'user', content: message }
        ]
      })
    });

    if (!ollamaResponse.ok) throw new Error(`Ollama error: ${ollamaResponse.statusText}`);

    const ollamaData = await ollamaResponse.json();
    const assistantMessage = ollamaData.message?.content || 'Sorry, I could not generate a response.';

    await db.query(
      'INSERT INTO conversations (role, content) VALUES ($1, $2)',
      ['assistant', assistantMessage]
    );

    res.json({ 
      message: assistantMessage,
      model: ollamaModel
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET available models from Ollama
router.get('/models', async (req, res) => {
  try {
    const settings = await db.query('SELECT value FROM settings WHERE key=$1', ['ollama_url']);
    const ollamaUrl = settings.rows[0]?.value || 'http://localhost:11434';

    const response = await fetchFn(`${ollamaUrl}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models');

    const data = await response.json();
    const models = data.models.map(m => m.name);

    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT switch active model
router.put('/model', async (req, res) => {
  const { model } = req.body;
  try {
    await db.query(
      `UPDATE settings SET value=$1, updated_at=now() WHERE key='ollama_model'`,
      [model]
    );
    res.json({ success: true, model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;