const express = require('express');
const router = express.Router();

const bannedIPs = [];

function isBanned(ip) {
  return bannedIPs.includes(ip);
}

router.use((req, res, next) => {
  const userIp = req.ip || req.headers['x-forwarded-for'];

  if (isBanned(userIp)) {
    res.render('banned', { userIp });
  } else {
    next();
  }
});

module.exports = { router, isBanned };
