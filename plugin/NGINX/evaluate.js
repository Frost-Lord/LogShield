const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

async function loadModel() {
    const model = await tf.loadLayersModel('file://./plugin/NGINX/model/model.json');
    return model;
}

const accessLogData = fs.readFileSync('./plugin/NGINX/Train/test/access.log', 'utf8');

function parseNginxLogs(logData) {
    const logs = logData.split('\n');
    const logRegex = /^(\S+) - - \[(.+)\] "(\S+) (.+?) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"/;

    const parsedLogs = logs.map((log) => {
        const match = log.match(logRegex);

        if (match) {
            return {
                ip: match[1],
                timestamp: match[2],
                method: match[3],
                uri: match[4],
                protocol: match[5],
                statusCode: parseInt(match[6], 10),
                bytesSent: parseInt(match[7], 10),
                referer: match[8],
                userAgent: match[9],
                label: 0 // 0 for legitimate
            };
        }
    });

    return parsedLogs.filter((log) => log !== undefined);
}

function extractFeatures(parsedLogs) {
    return parsedLogs.map((log) => {
        const method = log.method === 'GET' ? 1 : (log.method === 'POST' ? 2 : 0);
        const statusCode = log.statusCode;
        const bytesSent = log.bytesSent;

        return [method, statusCode, bytesSent];
    });
}

async function evaluateAccessLog() {
    const model = await loadModel();
    const parsedLogs = parseNginxLogs(accessLogData);
    const features = extractFeatures(parsedLogs);
    const dataset = tf.tensor2d(features);

    // Normalize the dataset
    const { mean, variance } = tf.moments(dataset, 0);
    const normalizedDataset = dataset.sub(mean).div(variance.sqrt());

    // Predict malicious users
    const predictions = model.predict(normalizedDataset);
    const threshold = 0.8;
    const suspiciousIPs = [];

    predictions.dataSync().forEach((prediction, index) => {
        if (prediction >= threshold) {
            if (suspiciousIPs.includes(parsedLogs[index].ip)) return;
            suspiciousIPs.push(parsedLogs[index].ip);
        }
    })
        const seeds = [];
        seeds.push({
            prediction: (predictions.dataSync()[0] * 100).toFixed(2) + "%",
            seed: Math.floor(Math.random() * 1000),
            seedLength: 21,
            modelLayers: model.layers.map(layer => ({
                name: layer.name,
                type: layer.getClassName(),
                config: layer.getConfig()
            })),
        });

        return { suspiciousIPs, seeds };
}

module.exports = evaluateAccessLog;
