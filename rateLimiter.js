const nonceRequests = new Map();

const rateLimit = (options = {}) => {
  const limit = options.limit || 30;
  const resetInterval = options.resetInterval || 60 * 1000; // 1 minute
  const blockDuration = options.blockDuration || 2 * 60 * 1000; // 2 minutes
  const nonceLimit = options.nonceLimit || 10;
  const nonceWindow = options.nonceWindow || 5 * 1000; // 5 seconds
  const ipRequests = new Map();

  function checkNonceFlood(ip) {
    const now = Date.now();
    const requests = nonceRequests.get(ip) || [];
    const validRequests = requests.filter((timestamp) => now - timestamp <= nonceWindow);

    if (!nonceRequests.has(ip)) {
      nonceRequests.set(ip, []);
    }
    

    return validRequests.length >= nonceLimit;
  }

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip;

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, { count: 1, lastRequest: now, blockedUntil: 0 });
    } else {
      const ipData = ipRequests.get(ip);

      if (ipData.blockedUntil > now) {
        res.status(429).send('Too many requests. Please wait and try again later.');
        return;
      }

      if (now - ipData.lastRequest > resetInterval) {
        ipData.count = 1;
        ipData.lastRequest = now;
      } else {
        ipData.count++;

        if (ipData.count > limit) {
          ipData.blockedUntil = now + blockDuration;
          res.status(429).send('Too many requests. Please wait and try again later.');
          return;
        }
      }
    }

    if (checkNonceFlood(ip)) {
      res.status(429).send('Too many nonce requests. Please wait and try again later.');
      return;
    }

    next();
  };
};

const trackNonceRequests = (req, res, next) => {
  if (!nonceRequests.has(req.ip)) {
    nonceRequests.set(req.ip, []);
  }

  nonceRequests.get(req.ip).push(Date.now());
  next();
};

module.exports = {
  rateLimit,
  trackNonceRequests,
};