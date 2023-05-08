function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function createWorker(prefix, difficulty, startNonce, numWorkers, onMessage) {
  const worker = new Worker('worker.js');
  worker.postMessage({ prefix, difficulty, startNonce, numWorkers });
  worker.addEventListener('message', onMessage);
  return worker;
}

document.addEventListener('DOMContentLoaded', async () => {
  const calculatingNonceElement = document.getElementById('calculatingNonce');
  const submittingResultElement = document.getElementById('submittingResult');
  const redirectingElement = document.getElementById('redirecting');

  const numWorkers = navigator.hardwareConcurrency || 4;
  const workers = [];
  let nonceFound = false;

  for (let i = 0; i < numWorkers; i++) {
    const worker = createWorker(secret, Difficulty, i, numWorkers, async (event) => {
      if (!nonceFound) {
        nonceFound = true;
        const { nonce } = event.data;

        workers.forEach((worker) => worker.terminate());

        await sleep(3000);
        calculatingNonceElement.textContent = 'Calculating Ray: ✓';
        await sleep(2000);
        submittingResultElement.textContent = 'Submitting Result: ✓';

        const isResultAccepted = await submitResult(secret, nonce, Difficulty);
        if (isResultAccepted) {
          redirectingElement.textContent = 'Redirecting: ✓';
          await sleep(5000);
          window.location.reload();
        } else {
          redirectingElement.textContent = 'Redirecting: ✗';
          submittingResultElement.textContent = 'Submitting Result: ✗';
        }
      }
    });
    workers.push(worker);
  }
});