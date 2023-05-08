const express = require('express');
const logger = require('../utils/logger');
const crypto = require('crypto');
const router = express.Router();

function checkRayId(prefix, nonce, difficulty) {
    const hash = crypto
        .createHash('sha256')
        .update(prefix + nonce)
        .digest('hex');
    const binaryHash = parseInt(hash, 16).toString(2).padStart(256, '0');
    return binaryHash.startsWith('0'.repeat(difficulty));
}

function generateRayId(ip) {
    return crypto.randomBytes(16).toString('hex');
}

router.get('/verify-ray', async (req, res) => {
    const { prefix, nonce, difficulty } = req.body;

    logger.debug('RAY CHECK', `${ip} has requested to verify Ray ID: ${checkRayId(prefix, nonce, difficulty)}`);

    if (checkRayId(prefix, nonce, difficulty)) {
        console.log('Proof of work is valid');
        req.session.whitelisted = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

module.exports = { router, generateRayId };