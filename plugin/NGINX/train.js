const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

function readLogs(dir) {
    const files = fs.readdirSync(dir);
    let logDataArray = [];

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileData = fs.readFileSync(filePath, 'utf8');
        logDataArray.push(fileData);
    });

    return logDataArray;
}
const accessLogDataArray = readLogs('./plugin/NGINX/Train/normal');
const maliciousLogDataArray = readLogs('./plugin/NGINX/Train/malicious');

function parseNginxLogs(logData) {
    const logs = logData.split('\n');
    const logRegex = /^(\S+) - - \[(.+)\] "(\S+) (.+?) (\S+)" (\d+) ?(\d+)? "([^"]*)" "([^"]*)"/;
  
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
          bytesSent: match[7] ? parseInt(match[7], 10) : null,
          referer: match[8],
          userAgent: match[9],
          label: 0,
        };
      }
    });
    return parsedLogs.filter((log) => log !== undefined);
  }  

const parsedLegitimateLogsArray = accessLogDataArray.map(logData => parseNginxLogs(logData));
const parsedMaliciousLogsArray = maliciousLogDataArray.map(logData => {
    const logs = parseNginxLogs(logData);
    return logs.map(log => {
        log.label = 1; // Set label to 1 for malicious
        return log;
    });
});

const combinedLogsArray = parsedLegitimateLogsArray.map((legitimateLogs, index) => {
    return legitimateLogs.concat(parsedMaliciousLogsArray[index]);
});


function extractFeatures(parsedLogs) {
    return parsedLogs
        .filter(log => log !== undefined)
        .map((log) => {
            const method = log.method === 'GET' ? 1 : (log.method === 'POST' ? 2 : 0);
            const statusCode = log.statusCode;
            const bytesSent = log.bytesSent;
            const label = log.label;

            return [method, statusCode, bytesSent, label];
        });
}


const features = extractFeatures(combinedLogsArray);
const dataset = tf.tensor2d(features.map(feature => feature.slice(0, -1)));

const splitRatio = 0.8;

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

const batchSize = 64;
const epochs = 500;
async function train(trainDataset, trainLabels) {
    console.log('Training the model...');
    await model.fit(trainDataset, trainLabels, {
        batchSize,
        epochs,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 300 }),
    });
    console.log('Training completed');
    await model.save('file://./plugin/NGINX/model');
}

async function evaluate(testDataset, testLabels) {
    console.log('Evaluating the model...');
    const evaluation = await model.evaluate(testDataset, testLabels);
    const accuracy = (evaluation[1].dataSync()[0] * 100).toFixed(2);
    const loss = evaluation[0].dataSync()[0].toFixed(4);
    return { accuracy, loss };
  }
  

async function processDataset(dataset) {
    const features = extractFeatures(dataset);
    const data = tf.tensor2d(features.map((feature) => feature.slice(0, -1)));
  
    const trainSize = Math.floor(features.length * splitRatio);
    const testSize = features.length - trainSize;
  
    const trainDataset = data.slice([0, 0], [trainSize, data.shape[1]]);
    const testDataset = data.slice([trainSize, 0], [testSize, data.shape[1]]);
  
    const { mean, variance } = tf.moments(trainDataset, 0);
    const normalizedTrainDataset = trainDataset.sub(mean).div(variance.sqrt());
    const normalizedTestDataset = testDataset.sub(mean).div(variance.sqrt());
  
    const labels = dataset.map((log) => log.label);
    const trainLabels = tf.tensor1d(labels.slice(0, trainSize), 'int32');
    const testLabels = tf.tensor1d(labels.slice(trainSize), 'int32');
  
    await train(normalizedTrainDataset, trainLabels);
    const evaluationResult = await evaluate(normalizedTestDataset, testLabels)
    console.log(
      `Test set accuracy: ${evaluationResult.accuracy}% | Loss: ${evaluationResult.loss}`
    );
    return evaluationResult;
  }  

async function main() {
    for (const dataset of combinedLogsArray) {
        await processDataset(dataset).then((data) => {
            return data;
        });
    }
}

module.exports = main;
