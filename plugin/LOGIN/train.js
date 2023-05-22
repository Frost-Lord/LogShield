const tf = require('@tensorflow/tfjs-node');
const fs = require("fs");

function tokenizeText(text) {
  return text.split(" ");
}

function preprocessText(text) {
  const lowercasedText = text.toLowerCase();

  return lowercasedText;
}

function createModel(vocabSize, inputDim) {
  const model = tf.sequential();
  model.add(
    tf.layers.embedding({
      inputDim: vocabSize,
      outputDim: inputDim,
      inputLength: null,
    })
  );
  model.add(
    tf.layers.bidirectional({
      layer: tf.layers.simpleRNN({ units: 16, returnSequences: true }),
      mergeMode: 'concat',
    }),
  );
  model.add(
    tf.layers.bidirectional({
      layer: tf.layers.simpleRNN({ units: 16 }),
      mergeMode: 'concat',
    }),
  );
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}


async function trainModel(model, xs, ys) {
  const numEpochs = 565;
  const batchSize = 32;

  await model.fit(xs, ys, {
    batchSize,
    epochs: numEpochs,
    shuffle: true,
    validationSplit: 0.2,
    callbacks:{
      onEpochEnd: async(epoch, logs) =>{
          console.log("Epoch:" + epoch + " Loss:" + logs.loss * 100);
      }
    }
  });
  await model.save('file://./model');
  console.log("Training and model save complete!");
  return true;
}

function processSequences(sequences, tokenizer, maxTimeSteps) {
  const processedSequences = sequences.map((seq) => {
    const wordIndices = seq.map((token) => tokenizer.wordIndex[token] || 0);

    let processedSeq = wordIndices;
    if (processedSeq.length > maxTimeSteps) {
      processedSeq = processedSeq.slice(0, maxTimeSteps);
    } else {
      while (processedSeq.length < maxTimeSteps) {
        processedSeq.push(0);
      }
    }

    return processedSeq;
  });
  return tf.tensor2d(processedSequences);
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

async function main() {
  const data = fs.readFileSync("./plugin/LOGIN/train/auth.log", "utf-8");
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
  
  const processedSequences = processSequences(xs, tokenizer, maxTimeSteps);
  const inputDim = 50;
  const model = createModel(uniqueWords.size + 1, inputDim);

  const ysTensor = tf.tensor2d(ys, [ys.length, 1]);
  await trainModel(model, processedSequences, ysTensor);
  return true;
}

module.exports = main;