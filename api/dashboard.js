const { CurrentlyBlockedUsers, Totalblocked, Totalrpm } = require('../middleware/rateLimiter').rateLimitData;
const { totalwafblocked } = require('../middleware/wafRules').wafData;
const os = require('node:os');
const pidusage = require('pidusage');


module.exports = (router, client, checkAuth) => {
    router.post("/admin", checkAuth, async (req, res) => {
        const processStats = await pidusage(process.pid);

        const data = {
            "waf": {
                "totalwafblocked": totalwafblocked()
            },
            "rateLimit": {
                "CurrentlyBlockedUsers": CurrentlyBlockedUsers(),
                "Totalblocked": Object.fromEntries(Totalblocked().entries()),
            },
            "rpm": {
                "requestsPerMinute": {
                    "total": Totalrpm().allowedrpm,
                    "allowed": Totalrpm().allowedrpm,
                    "blocked": Totalrpm().blockedrpm,
                }
            },
            "process": {
                "memoryUsage": processStats.memory,
                "cpuUsage": processStats.cpu,
            },
            "system": {
                "uptime": os.uptime(),
                "loadavg": os.loadavg(),
                "totalmem": os.totalmem(),
                "freemem": os.freemem(),
                "cpus": os.cpus(),
                "networkInterfaces": os.networkInterfaces(),
            },
        }

        res.send(data);
    });
};