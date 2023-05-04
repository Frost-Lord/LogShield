function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calculateNonce(rayId, userIp) {
  let hashInput = userIp + rayId;
  let hashOutput;

  for (let i = 0; i < Difficulty; i++) {
    const hash = new TextEncoder().encode(hashInput);
    const digest = await crypto.subtle.digest('SHA-256', hash);
    const digestArray = new Uint8Array(digest);
    hashOutput = Array.from(digestArray).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
    hashInput = hashOutput;
  }

  console.log('Calculated Nonce:', hashOutput.slice(0, 16));
  return hashOutput.slice(0, 16);
}

async function submitResult(nonce) {
  const targetUrl = `${window.location.origin}/verify-ray?ray=${nonce}`;
  const response = await fetch(targetUrl);

  return response.ok ? true : false;
}

(async () => {
  document.addEventListener('DOMContentLoaded', async () => {
    const calculatingNonceElement = document.getElementById('calculatingNonce');
    const submittingResultElement = document.getElementById('submittingResult');
    const redirectingElement = document.getElementById('redirecting');

    const nonce = await calculateNonce(secret, userIp);
    calculatingNonceElement.textContent = 'Calculating Nonce: ✓';

    const isResultAccepted = await submitResult(nonce);
    if (isResultAccepted) {
      redirectingElement.textContent = 'Redirecting: ✓';
      await sleep(3000);
      window.location.reload();
    } else {
      submittingResultElement.textContent = 'Submitting Result: ✗';
    }
  });
})();
