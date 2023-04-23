const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const accessLogData = fs.readFileSync('access.log', 'utf8');
const maliciousLogData = fs.readFileSync('accessmal.log', 'utf8');

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

// Parse the logs
const parsedLegitimateLogs = parseNginxLogs(accessLogData);
const parsedMaliciousLogs = parseNginxLogs(maliciousLogData).map(log => {
  log.label = 1; // Set label to 1 for malicious
  return log;
});

// Combine legitimate and malicious logs
const combinedLogs = parsedLegitimateLogs.concat(parsedMaliciousLogs);

function extractFeatures(parsedLogs) {
    return parsedLogs.map((log) => {
        const method = log.method === 'GET' ? 1 : (log.method === 'POST' ? 2 : 0);
        const statusCode = log.statusCode;
        const bytesSent = log.bytesSent;
        const label = log.label;

        return [method, statusCode, bytesSent, label];
    });
}


const features = extractFeatures(combinedLogs);
const dataset = tf.tensor2d(features.map(feature => feature.slice(0, -1)));

// Split dataset into training and testing sets
const splitRatio = 0.8;
const trainSize = Math.floor(features.length * splitRatio);
const testSize = features.length - trainSize;

const trainDataset = dataset.slice([0, 0], [trainSize, dataset.shape[1]]);
const testDataset = dataset.slice([trainSize, 0], [testSize, dataset.shape[1]]);

// Normalize the data
const { mean, variance } = tf.moments(trainDataset, 0);
const normalizedTrainDataset = trainDataset.sub(mean).div(variance.sqrt());
const normalizedTestDataset = testDataset.sub(mean).div(variance.sqrt());

// Prepare labels for the datasets
const labels = combinedLogs.map(log => log.label);
const trainLabels = tf.tensor1d(labels.slice(0, trainSize), 'int32');
const testLabels = tf.tensor1d(labels.slice(trainSize), 'int32');

const model = tf.sequential();
model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [dataset.shape[1]] }));
model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.sigmoidCrossEntropy,
    metrics: ['accuracy']
});

const batchSize = 32;
const epochs = 500;
async function train() {
    console.log('Training the model...');
    const history = await model.fit(normalizedTrainDataset, trainLabels, {
        batchSize,
        epochs,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 3 })
    });
    console.log('Training completed');
    await model.save('file://./ddos_model.json');
    return history;
}

async function evaluate() {
    console.log('Evaluating the model...');
    const evaluation = await model.evaluate(normalizedTestDataset, testLabels);
    console.log(`Test set accuracy: ${(evaluation[1].dataSync()[0] * 100).toFixed(2)}%`);
}

train()
.then(() => evaluate())
.catch(err => console.error(err));
