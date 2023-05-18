const fs = require('fs');
const path = require('path');

function checkAuth(req, res, next) {
    const authCode = req.body.auth;

    if (authCode === 'aielgv8sgeasgryleairgearihu') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

module.exports = function (app) {
    // dynamically load plugins
    fs.readdirSync(path.join(__dirname, './plugin')).forEach((file) => {
        const pluginName = path.basename(file, '.js'); // get file name without extension

        // dynamically require the plugin
        const plugin = require(path.join(__dirname, './plugin', file));

        // map the plugin to an endpoint
        app.use(`/api/${pluginName}`, plugin);
    });

    app.get('/evaluate', checkAuth, async (req, res, next) => {
        try {
            const evaluateAccessLog = require(path.join(__dirname, `./plugin/${req.params.pluginName}/evaluate.js`));
            await evaluateAccessLog()
                .then(maliciousUsers => {
                    if (maliciousUsers.length === 0) {
                        res.send('No malicious users detected.');
                    } else {
                        let mal = [];
                        maliciousUsers.forEach(user => {
                            if (mal.includes(user.ip) === false) {
                                mal.push(user.ip);
                            }
                        });
                        res.send(`Malicious users detected: ${mal}`);
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

    app.get('/train', checkAuth, async (req, res) => {
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