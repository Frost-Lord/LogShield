function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calculateNonce(prefix, difficulty) {
  let nonce = 0;

  while (true) {
      const hash = new TextEncoder()
          .encode(prefix + nonce.toString())
          .reduce((prev, curr) => prev + ('0' + curr.toString(16)).slice(-2), '');
      const binaryHash = parseInt(hash, 16).toString(2).padStart(256, '0');

      if (binaryHash.startsWith('0'.repeat(difficulty))) {
          return nonce;
      }

      nonce++;
  }
}

async function submitResult(prefix, nonce, difficulty) {
  const targetUrl = `${window.location.origin}/verify-ray`;
  const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix, nonce, difficulty }),
  });

  return response.ok;
}

(async () => {
  document.addEventListener('DOMContentLoaded', async () => {
    const calculatingNonceElement = document.getElementById('calculatingNonce');
    const submittingResultElement = document.getElementById('submittingResult');
    const redirectingElement = document.getElementById('redirecting');

    const nonce = await calculateNonce(secret, Difficulty);
    await sleep(3000);
    calculatingNonceElement.textContent = 'Calculating Ray: ✓';
    await sleep(2000);
    submittingResultElement.textContent = 'Submitting Result: ✓';

    const isResultAccepted = await submitResult(nonce);
    if (isResultAccepted) {
      redirectingElement.textContent = 'Redirecting: ✓';
      await sleep(5000);
      window.location.reload();
    } else {
      redirectingElement.textContent = 'Redirecting: ✗';
      submittingResultElement.textContent = 'Submitting Result: ✗';
    }
  });
})();
