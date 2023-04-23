const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

async function loadModel() {
    const model = await tf.loadLayersModel('file://./ddos_model.json/model.json');
    return model;
}

const accessLogData = fs.readFileSync('accessmal.log', 'utf8');


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
    const threshold = 0.5;
    const maliciousUsers = [];

    predictions.dataSync().forEach((prediction, index) => {
        if (prediction >= threshold) {
            maliciousUsers.push(parsedLogs[index]);
        }
    });

    return maliciousUsers;
}

evaluateAccessLog()
.then(maliciousUsers => {
    if (maliciousUsers.length === 0) {
        console.log('No malicious users detected.');
    } else {
        console.log('Malicious users detected:');
        let mal = [];
        maliciousUsers.forEach(user => {
            if (mal.includes(user.ip) === false) {
                mal.push(user.ip);
            }
        });
        console.log(mal);
    }
})
.catch(err => console.error(err));
