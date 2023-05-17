const express = require('express');
const logger = require('../utils/logger');
const crypto = require('crypto');
const router = express.Router();

function checkRayId(prefix, nonce, difficulty) {
  const hash = crypto
    .createHash('sha256')
    .update(prefix + nonce)
    .digest('hex');
  const binaryHash = BigInt('0x' + hash).toString(2).padStart(256, '0');
  return binaryHash.startsWith('0'.repeat(difficulty));
}

function generateRayId() {
  return crypto.randomBytes(16).toString('hex');
}

router.post('/verify-ray', async (req, res) => {
  const { prefix, nonce, difficulty } = req.body;

  logger.debug('RAY CHECK', `${req.ip} has requested to verify Ray ID: ${checkRayId(prefix, nonce, difficulty)}`);

  if (checkRayId(prefix, nonce, difficulty)) {
    req.session.whitelisted = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

module.exports = { router, generateRayId };
