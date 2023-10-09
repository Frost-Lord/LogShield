const { CurrentlyBlockedUsers, TotalBlocked, TotalRpm } = require('../middleware/rateLimiter').rateLimitData;
const { totalwafblocked } = require('../middleware/wafRules').wafData;
const { AVGServerPing } = require('../middleware/ping');
const { bandwidth } = require('../middleware/bandwidth');
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
                "Totalblocked": Object.fromEntries(TotalBlocked().entries()),
            },
            "ping": {
                "AVGServerPing": `${await AVGServerPing()}ms`,
                "Upload": bandwidth.totalUpload(),
                "Download": bandwidth.totalDownload(),
                "AvgUploadSize": bandwidth.avgUploadSize(),
                "AvgDownloadSize": bandwidth.avgDownloadSize(),
            },
            "rpm": {
                "requestsPerMinute": {
                    "total": TotalRpm().allowedrpm,
                    "allowed": TotalRpm().allowedrpm,
                    "blocked": TotalRpm().blockedrpm,
                }
            },
            "process": {
                "memoryUsage": processStats.memory,
                "cpuUsage": processStats.cpu,
                "uptime": process.uptime(),
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
