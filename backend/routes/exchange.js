const express = require('express');
const axios = require('axios');

const router = express.Router();

const rateCache = new Map();

router.get('/', async (req, res) => {
    const { base = 'EUR', target = 'HUF' } = req.query;
    const cacheKey = `${base}->${target}`;

    console.log('➡️ Árfolyam lekérés:', base, '→', target);

    // ellenőrzés
    if (rateCache.has(cacheKey)) {
        console.log('⚡ Cache találat');
        return res.json({ base, target, rate: rateCache.get(cacheKey), cached: true });
    }

    try {
        const url = 'https://api.frankfurter.app/latest';

        const response = await axios.get(url, {
            params: {
                amount: 1,
                from: base.trim(),
                to: target.trim()
            }
        });

        const rate = response.data?.rates?.[target];

        if (!rate || typeof rate !== 'number') {
            console.error('❗ Nincs érvényes árfolyam a válaszban!');
            return res.status(500).json({ error: 'Nem jött vissza árfolyam az API-tól.' });
        }

        console.log(`✅ Árfolyam ${base} → ${target}:`, rate);
        rateCache.set(cacheKey, rate); // cach-be mentés

        res.json({ base, target, rate });
    } catch (error) {
        console.error('❌ Árfolyam hiba:', error.message);
        res.status(500).json({ error: 'Nem sikerült lekérni az árfolyamot.' });
    }
});

module.exports = router;
