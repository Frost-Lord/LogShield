const { CurrentlyBlockedUsers, Totalblocked, Totalrpm } = require('../middleware/rateLimiter').rateLimitData;
const { totalwafblocked } = require('../middleware/wafRules').wafData;
const os = require('node:os');
const pidusage = require('pidusage');


module.exports = (router, client, checkAuth) => {
    router.post("/admin", checkAuth, async (req, res) => {
        const processStats = await pidusage(process.pid);

        console.log(Totalrpm);

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
            },
            "process": {
                "memoryUsage": processStats.memory, // Memory usage in bytes
                "cpuUsage": processStats.cpu, // CPU usage in percentage
                "networkStats": {
                    "downSpeed": processStats.rx, // Network download speed in bytes/sec
                    "upSpeed": processStats.tx, // Network upload speed in bytes/sec
                },
            },
            "metrics": {
                "requestsPerMinute": Totalrpm(),
            }
        }

        res.send(data);
    });
};