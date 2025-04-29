const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const db = req.db;
    const rows = db.prepare('SELECT * FROM transactions').all();
    res.json(rows);
});

router.post('/', (req, res) => {
    const db = req.db;
    const { id, date, amount, currency, category, description } = req.body;

    const finalId = id || `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const stmt = db.prepare(`
    INSERT INTO transactions (id, date, amount, currency, category, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    stmt.run(finalId, date, amount, currency, category, description);

    res.status(201).json({ message: 'Tranzakció mentve', id: finalId });
});

router.get('/all', (req, res) => {
    const db = req.db;
    const rows = db.prepare('SELECT * FROM transactions').all();
    res.json(rows);
});

module.exports = router;