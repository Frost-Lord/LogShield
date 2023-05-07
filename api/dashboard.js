const { CurrentlyBlockedUsers, Totalblocked } = require('../middleware/rateLimiter').rateLimitData;
const { totalwafblocked } = require('../middleware/wafRules').wafData;
const os = require('node:os'); 

module.exports = (router, client, checkAuth) => {
    router.post("/admin", checkAuth, async (req, res) => {
        const data = {
            "waf": {
                "totalwafblocked": totalwafblocked()
            },
            "rateLimit": {
                "CurrentlyBlockedUsers": CurrentlyBlockedUsers(),
                "Totalblocked": Object.fromEntries(Totalblocked().entries()),
            },
            "system": {
                "uptime": os.uptime(),
                "loadavg": os.loadavg(),
                "totalmem": os.totalmem(),
                "freemem": os.freemem(),
                "cpus": os.cpus(),
                "networkInterfaces": os.networkInterfaces(),
            }
        }

        res.send(data);
    });
};