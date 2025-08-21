const express = require('express');
const router = express.Router();
const net = require('net');

// GET /api/smtp-check
router.get('/', async (req, res) => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const timeoutMs = 10000;

    if (!host) return res.status(400).json({ error: 'SMTP_HOST not configured' });

    const socket = new net.Socket();
    let called = false;

    const finish = (status, info) => {
        if (called) return;
        called = true;
        try { socket.destroy(); } catch (e) { }
        res.json({ status, info });
    };

    socket.setTimeout(timeoutMs);
    socket.once('timeout', () => finish('timeout', `No response within ${timeoutMs}ms`));
    socket.once('error', (err) => finish('error', err.message));
    socket.connect(port, host, () => {
        finish('ok', `Connected to ${host}:${port}`);
    });
});

module.exports = router;
