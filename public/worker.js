self.addEventListener('message', async (event) => {
    const { prefix, difficulty, startNonce, numWorkers } = event.data;
  
    const nonce = await calculateNonce(prefix, difficulty, startNonce, numWorkers);
    self.postMessage({ nonce });
  });
  
  async function calculateNonce(prefix, difficulty, startNonce, numWorkers) {
    let nonce = startNonce;
    while (true) {
      const hash = new TextEncoder()
        .encode(prefix + nonce.toString())
        .reduce((prev, curr) => prev + ('0' + curr.toString(16)).slice(-2), '');
      const binaryHash = parseInt(hash, 16).toString(2).padStart(256, '0');
  
      if (binaryHash.startsWith('0'.repeat(difficulty))) {
        return nonce;
      }
      nonce += numWorkers;
    }
  }
  