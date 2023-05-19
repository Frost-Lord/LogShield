const fs = require('fs');
const path = require('path');

module.exports = (router, client, checkAuth) => {
    fs.readdirSync(path.join(__dirname, '../plugin')).forEach((dir) => {
        const pluginPath = path.join(__dirname, '../plugin', dir);
        if(fs.lstatSync(pluginPath).isDirectory()) {
            
            router.post(`/${dir}/evaluate`, checkAuth, async (req, res, next) => {
                try {
                    const evaluateAccessLog = require(path.join(pluginPath, 'evaluate.js'));
                    await evaluateAccessLog()
                        .then(data => {
                            if (data.length === 0) {
                                res.send('No malicious activities detected.');
                            } else {
                                res.send(`Malicious activities detected: ${data}`);
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

            router.post(`/${dir}/train`, checkAuth, async (req, res) => {
                try {
                    const train = require(path.join(pluginPath, 'train.js'));
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
        }
    });
};