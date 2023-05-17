self.addEventListener('message', async (event) => {
  const { prefix, difficulty, startNonce, numWorkers } = event.data;

  const nonce = await calculateNonce(prefix, difficulty, startNonce, numWorkers);
  self.postMessage({ nonce });
});

function calculateNonce(prefix, difficulty, startNonce, numWorkers) {
  return new Promise((resolve) => {
    let nonce = startNonce;
    const chunkSize = 1000;

    const processChunk = () => {
      for (let i = 0; i < chunkSize; i++) {
        const currentNonce = nonce + i * numWorkers;

        const hash = new TextEncoder()
          .encode(prefix + currentNonce.toString())
          .reduce((prev, curr) => prev + ('0' + curr.toString(16)).slice(-2), '');
        const binaryHash = parseInt(hash, 16).toString(2).padStart(256, '0');

        if (binaryHash.startsWith('0'.repeat(difficulty))) {
          resolve(currentNonce);
          return;
        }
      }

      nonce += chunkSize * numWorkers;
      if (nonce % 100000 === 0) {
        setTimeout(processChunk, 0);
      } else {
        processChunk();
      }
    };

    processChunk();
  });
}