const tf = require('@tensorflow/tfjs-node');
const fs = require("fs");

function tokenizeText(text) {
  return text.split(" ");
}

function preprocessText(text) {
  const lowercasedText = text.toLowerCase();

  return lowercasedText;
}

function groupLogLinesByIP(lines) {
  const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
  const logGroups = new Map();

  for (const line of lines) {
    const match = line.match(ipPattern);
    if (match) {
      const ip = match[0];

      if (logGroups.has(ip)) {
        logGroups.get(ip).push(line);
      } else {
        logGroups.set(ip, [line]);
      }
    }
  }

  return Array.from(logGroups.values());
}

function evaluateSuspiciousness(model, lines, tokenizer, timeSteps) {
  const suspiciousIPs = [];
  const seeds = [];

  for (const text of lines) {
    const preprocessedText = preprocessText(text);
    const tokens = tokenizeText(preprocessedText);
    let sequence = tokens.map((token) => tokenizer.wordIndex[token] || 0);

    if (sequence.length > timeSteps) {
      sequence = sequence.slice(0, timeSteps);
    } else {
      while (sequence.length < timeSteps) {
        sequence.push(0);
      }
    }

    const input = tf.tensor2d([sequence], [1, timeSteps]);
    const prediction = model.predict(input);
    const isSuspicious = prediction.dataSync()[0] >= 0.90;

    if (isSuspicious) {
      const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
      const match = text.match(ipPattern);
      if (match) {
        const ip = match[0];
        suspiciousIPs.push(ip);
      }

      seeds.push({
        prediction: (prediction.dataSync()[0] * 100).toFixed(2) + "%",
        seed: sequence,
        seedLength: sequence.length,
        modelLayers: model.layers.map(layer => ({
          name: layer.name,
          type: layer.getClassName(),
          config: layer.getConfig()
        })),
      });
    }
  }
  return { suspiciousIPs, seeds };
}

async function main(req) {
  const model = await tf.loadLayersModel("file://./plugin/LOGIN/model/model.json");
    const data = req.body.data?.live === true ? fs.readFileSync(path.join('/', 'var', 'log', 'auth', 'auth.log'), "utf-8") : fs.readFileSync("./plugin/LOGIN/train/auth.log", "utf-8");
    const lines = data.split("\n");
  
    const sequences = groupLogLinesByIP(lines);
  
    const xs = [];
    const ys = [];
  
    const failedPasswordPattern = /Failed password for (\w+) from ([\d.]+) port (\d+)/;
  
    function countFailedPasswordAttempts(sequence, user, ip, port) {
      let count = 0;
      for (const line of sequence) {
        const match = line.match(failedPasswordPattern);
        if (match && match[1] === user && match[2] === ip && match[3] === port) {
          count++;
        }
      }
      return count;
    }
  
    const logEntryPattern = /:\s([^:]+)$/;
  
    for (const sequence of sequences) {
      const sequenceTokens = [];
      let isSuspiciousSequence = 0;
  
      for (const line of sequence) {
        const match = line.match(logEntryPattern);
        if (match) {
          const action = match[1];
          let isSuspicious = action.includes("authentication failure") ? 1 : 0;
          const failedPasswordMatch = line.match(failedPasswordPattern);
          if (failedPasswordMatch) {
            const user = failedPasswordMatch[1];
            const ip = failedPasswordMatch[2];
            const port = failedPasswordMatch[3];
            const failedPasswordAttempts = countFailedPasswordAttempts(sequence, user, ip, port);
            if (failedPasswordAttempts > 3) {
              isSuspicious = 1;
            }
          }
          const preprocessedText = preprocessText(action);
          const tokens = tokenizeText(preprocessedText);
          sequenceTokens.push(...tokens);
          isSuspiciousSequence = Math.max(isSuspiciousSequence, isSuspicious);
        }
      }
  
      xs.push(sequenceTokens);
      ys.push(isSuspiciousSequence);
    }
  
    const allTexts = [];
    for (const seq of xs) {
      for (const text of seq) {
        allTexts.push(text);
      }
    }
    
    const tokenizer = { wordIndex: {} };
    const uniqueWords = new Set();
    
    for (const text of allTexts) {
      const tokens = tokenizeText(text);
      for (const token of tokens) {
        uniqueWords.add(token);
      }
    }
    
    tokenizer.wordIndex = Array.from(uniqueWords).reduce((acc, word, index) => {
      acc[word] = index + 1;
      return acc;
    }, {});
  
    const maxTimeSteps = xs.reduce(
      (max, seq) => Math.max(max, seq.reduce(
        (maxInner, subSeq) => Math.max(maxInner, subSeq.length), 0
      )), 0
    );
    
    const evaluation = await evaluateSuspiciousness(model, lines, tokenizer, maxTimeSteps);

    return {
      suspiciousIPs: evaluation.suspiciousIPs,
      Seed: evaluation.seeds
    };
}

module.exports = main;
