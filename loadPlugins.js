const fs = require('fs');
const path = require('path');

module.exports = (router, client, checkAuth) => {
    fs.readdirSync(path.join(__dirname, './plugin')).forEach((file) => {
        const pluginName = path.basename(file);
        if(pluginName !== "index.js") return; // ignore non-index.js files
        const plugin = require(path.join(__dirname, './plugin', file, 'index.js')); // specify index.js
        router.use(`/api/${pluginName}`, plugin);
    });

    router.get('/evaluate', checkAuth, async (req, res, next) => {
        try {
            const evaluateAccessLog = require(path.join(__dirname, `./plugin/${req.params.pluginName}/evaluate.js`));
            await evaluateAccessLog()
                .then(maliciousUsers => {
                    if (maliciousUsers.length === 0) {
                        res.send('No malicious users detected.');
                    } else {
                        res.send(`Malicious users detected: ${maliciousUsers}`);
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('An error occurred while evaluating the access log.');
                });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    router.get('/train', checkAuth, async (req, res) => {
        try {
            const train = require(path.join(__dirname, `./plugin/${req.params.pluginName}/train.js`));
            await train()
                .then(data => {
                    res.json(data);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('An error occurred while training the model.');
                });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
};