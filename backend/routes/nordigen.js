const express = require('express');
const axios = require('axios');
const router = express.Router();

//Tokenhez cache
let cachedToken = null;
let tokenExpire = 0;

//Token lekérése
const getAccessToken = async () => {
    const now = Date.now();
    if (cachedToken && tokenExpire > now) return cachedToken;

    const response = await axios.post('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
        secret_id: process.env.NORDIGEN_SECRET_ID,
        secret_key: process.env.NORDIGEN_SECRET_KEY,
    });

    cachedToken = response.data.access;
    tokenExpire = now + 9 * 60 * 1000; // 9 perc
    return cachedToken;
};

//Banklista
router.get('/institutions', async (req, res) => {
    try {
        const access = await getAccessToken();

        const response = await axios.get(
            'https://bankaccountdata.gocardless.com/api/v2/institutions/?country=hu',
            { headers: { Authorization: `Bearer ${access}` } }
        );

        const sandbox = {
            id: 'SANDBOXFINANCE_SFIN0000',
            name: 'Sandbox Finance',
            bic: 'SANDBOX000',
            countries: ['HU'],
            logo: 'https://cdn-logos.gocardless.com/ais/SANDBOXFINANCE_SFIN0000.png',
            transaction_total_days: '90',
            max_access_valid_for_days: '180',
        };

        res.json([sandbox, ...response.data]);
    } catch (err) {
        console.error('❌ Banklista hiba:', err.response?.data || err.message);
        res.status(500).json({ error: 'Nem sikerült lekérni az intézményeket' });
    }
});

//Kapcsolat létrehozása
router.post('/link', async (req, res) => {
    try {
        const { institutionId } = req.body;
        const access = await getAccessToken();

        // Agreement
        const agreementRes = await axios.post(
            'https://bankaccountdata.gocardless.com/api/v2/agreements/enduser/',
            {
                institution_id: institutionId,
                max_historical_days: 90,
                access_scope: ['balances', 'transactions'],
            },
            { headers: { Authorization: `Bearer ${access}` } }
        );

        const agreementId = agreementRes.data.id;

        // Requisition
        const requisitionRes = await axios.post(
            'https://bankaccountdata.gocardless.com/api/v2/requisitions/',
            {
                redirect: 'http://localhost:5173/callback',
                institution_id: institutionId,
                agreement: agreementId,
                reference: `ref-${Date.now()}`,
            },
            { headers: { Authorization: `Bearer ${access}` } }
        );

        res.json({
            requisition_id: requisitionRes.data.id,
            link: requisitionRes.data.link,
        });
    } catch (err) {
        console.error('❌ Link létrehozási hiba:', err.response?.data || err.message);
        res.status(500).json({ error: 'Kapcsolat létrehozása sikertelen' });
    }
});

router.get('/accounts/:requisitionId', async (req, res) => {
    try {
        const access = await getAccessToken();
        const { requisitionId } = req.params;

        console.log('😊 Érkezett requisitionId:', requisitionId);
        console.log('🔐 Access token megszerezve:', access.slice(0, 10) + '...');

        const requisition = await axios.get(
            `https://bankaccountdata.gocardless.com/api/v2/requisitions/${requisitionId}/`,
            { headers: { Authorization: `Bearer ${access}` } }
        );

        const accountIds = requisition.data.accounts;

        if (!accountIds || accountIds.length === 0) {
            return res.status(404).json({ error: 'Nincsenek csatolt számlák' });
        }

        res.json({ accountId: accountIds[0] });
    } catch (err) {
        console.error('❌ Account lekérési hiba:', err.response?.data || err.message);
        res.status(500).json({ error: 'Account lekérése sikertelen' });
    }
});

// Tranzakciók
router.get('/transactions/:accountId', async (req, res) => {
    try {
        const access = await getAccessToken();
        const { accountId } = req.params;

        const response = await axios.get(
            `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions/`,
            { headers: { Authorization: `Bearer ${access}` } }
        );

        res.json(response.data);
    } catch (err) {
        console.error('❌ Tranzakció lekérési hiba:', err.response?.data || err.message);
        res.status(500).json({ error: 'Tranzakciók lekérése sikertelen' });
    }
});

//Egyenleg
router.get('/balances/:accountId', async (req, res) => {
    try {
        const access = await getAccessToken();
        const { accountId } = req.params;

        const response = await axios.get(
            `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/balances/`,
            { headers: { Authorization: `Bearer ${access}` } }
        );

        res.json(response.data);
    } catch (err) {
        console.error('❌ Egyenleg lekérési hiba:', err.response?.data || err.message);
        res.status(500).json({ error: 'Egyenleg lekérése sikertelen' });
    }
});

module.exports = router;
