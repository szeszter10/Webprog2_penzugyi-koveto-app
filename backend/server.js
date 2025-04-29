require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs/promises');

const transactionsRoutes = require('./routes/transactions');
const exchangeRoutes = require('./routes/exchange');
const nordigenRoutes = require('./routes/nordigen');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend API működik! Elérhető: /api/transactions, /api/exchange, /api/nordigen');
});

const db = new Database('./db/database.db');

const initDb = async () => {
    try {
        const initScript = await fs.readFile('./db/init.sql', 'utf-8');
        db.exec(initScript);
        console.log('✅ Adatbázis inicializálva');
    } catch (err) {
        console.error('❌ Adatbázis inicializálási hiba:', err);
    }
};

initDb();

app.use('/api/transactions', (req, res, next) => {
    req.db = db;
    next();
}, transactionsRoutes);

app.use('/api/nordigen', (req, res, next) => {
    req.db = db;
    next();
}, nordigenRoutes);

app.use('/api/exchange', exchangeRoutes);

app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});

