const { data } = require('@tensorflow/tfjs-node');
const logger = require('../utils/logger');
const client = global.client;
const ipRequests = new Map();
const totalBlocked = new Map();
const rpmData = {
  allowed: [],
  blocked: [],
  total: []
};


const whitelisted = (process.env.WHITELISTED || '').split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);

const rateLimit = (options = {}) => {
  const limit = options.limit || 30;
  const resetInterval = options.resetInterval || 60 * 1000; // 1 minute
  const blockDuration = options.blockDuration || 2 * 60 * 1000; // 2 minutes
  const nonceLimit = options.nonceLimit || 10;
  const nonceWindow = options.nonceWindow || 5 * 1000; // 5 seconds

  function checkNonceFlood(ip) {
    const now = Date.now();
    const key = `nonceRequests:${ip}`;

    client.get(key).then((requests) => {
      const validRequests = requests
        ? JSON.parse(requests).filter(
          (timestamp) => now - timestamp <= nonceWindow
        )
        : [];
      const isFlood = validRequests.length >= nonceLimit;
      return isFlood;
    }).catch((err) => {
      console.log(err);
      return null
    });
  }


  return async (req, res, next) => {
    const now = Date.now();
    const ip = req.ip;

    if (whitelisted.includes(ip)) {
      return next();
    }
    if (req.session && req.session.whitelisted) {
      return next();
    }

    async function redirect(req, res, userIp) {
      rpmData.blocked.push({ timestamp: now, count: 1 });
      rpmData.total.push({ timestamp: now, count: 1 });

      const today = new Date().toISOString().split('T')[0];
      totalBlocked.set(today, (totalBlocked.get(today) || 0) + 1);
      const ipData = ipRequests.get(userIp);
      ipData.totalBlockedRequests++;
      logger.user("EVENT", `IP address ${userIp} has been banned for too many requests`);
      if (req.headers?.accept && req.headers.accept.includes('application/json')) {
        res.status(429).json({ error: 'Too many requests. Please wait and try again later.' });
      } else {
        res.render('banned', { userIp });
      }
    }

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, { count: 1, timestamps: [now], lastRequest: now, blockedUntil: 0, totalBlockedRequests: 0 });
    } else {
      const ipData = ipRequests.get(ip);

      ipData.timestamps = ipData.timestamps.filter(timestamp => now - timestamp <= resetInterval);

      if (ipData.blockedUntil > now) {
        redirect(req, res, ip);
        return;
      }

      ipData.timestamps.push(now);

      if (ipData.timestamps.length > limit) {
        ipData.blockedUntil = now + blockDuration;
        redirect(req, res, ip);
        return;
      }

      if (now - ipData.lastRequest > resetInterval) {
        ipData.count = 1;
        ipData.lastRequest = now;
      } else {
        ipData.count++;

        if (ipData.count > limit) {
          ipData.blockedUntil = now + blockDuration;
          redirect(req, res, ip);
          return;
        }
      }
    }

    const isFlood = checkNonceFlood(ip);
    if (isFlood) {
      redirect(req, res, ip);
      return;
    }
    trackNonceRequests(req, res, next, nonceLimit, nonceWindow);
  };
};

const trackNonceRequests = async (req, res, next, nonceLimit, nonceWindow) => {
  const ip = req.ip;
  const now = Date.now();
  const key = `nonceRequests:${ip}`;

  await client.get(key).then(async (requests) => {
    const timestamps = requests ? JSON.parse(requests) : [];
    timestamps.push(now);

    await client.set(key, JSON.stringify(timestamps.slice(-nonceLimit)), 'EX', Math.ceil(nonceWindow / 1000)).catch((err) => {
      console.error(err);
      return next(err);
    });
    rpmData.allowed.push({ timestamp: now, count: 1 });
    rpmData.total.push({ timestamp: now, count: 1 });
    next();
  }).catch((err) => {
    console.error(err);
    return next(err);
  });
};

function CurrentlyBlockedUsers() {
  const now = Date.now();
  let blockedUsers = 0;
  let totalRequests = 0;

  for (const ipData of ipRequests.values()) {
    if (ipData.blockedUntil > now) {
      blockedUsers++;
    }
    totalRequests += ipData.totalBlockedRequests;
  }

  return { "current": blockedUsers, "reqests": totalRequests };
}

function Totalblocked() {
  return totalBlocked;
}

function Totalrpm() {
  const now = Date.now();
  const start = now - 60000;
  let allowedrpm = 0;
  let blockedrpm = 0;
  let totalrpm = 0;

  rpmData.allowed = rpmData.allowed.filter(entry => {
    if (entry.timestamp >= start && entry.timestamp <= now) {
      allowedrpm += entry.count;
      return true;
    }
    return false;
  });

  rpmData.blocked = rpmData.blocked.filter(entry => {
    if (entry.timestamp >= start && entry.timestamp <= now) {
      blockedrpm += entry.count;
      return true;
    }
    return false;
  });

  rpmData.total = rpmData.total.filter(entry => {
    if (entry.timestamp >= start && entry.timestamp <= now) {
      totalrpm += entry.count;
      return true;
    }
    return false;
  });

  return { allowedrpm, blockedrpm, totalrpm };
}


module.exports = rateLimit;
module.exports.rateLimitData = { CurrentlyBlockedUsers, Totalblocked, Totalrpm };