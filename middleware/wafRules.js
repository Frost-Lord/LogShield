const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const wafRulesPath = path.join(__dirname, '../WAF/waf-rules.json');
const wafRules = JSON.parse(fs.readFileSync(wafRulesPath, 'utf8'));

function checkAgainstWAFRules(value) {
  for (const rule of wafRules) {
    const regex = new RegExp(rule.reg, 'i');
    if (regex.test(value)) {
      logger.error('WAF', `Rule ${rule.id}: "${rule.cmt}" in category "${rule.type}" has been triggered by request at ${new Date().toISOString()}`);
      return true;
    }
  }
  return false;
}

router.use((req, res, next) => {
  const queryParams = Object.values(req.query).join(' ');
  const bodyParams = Object.values(req.body).join(' ');

  if (checkAgainstWAFRules(queryParams) || checkAgainstWAFRules(bodyParams)) {
    return res.status(403).send('Request blocked by WAF');
  }

  next();
});

module.exports = router;
