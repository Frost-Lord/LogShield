function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calculateNonce(rayId, userIp) {
  let secret = '';

  for (let i = 0; i < rayId.length; i++) {
    const encryptedChar = rayId.charCodeAt(i);
    const ipChar = userIp.charCodeAt(i % userIp.length);
    const decryptedChar = encryptedChar ^ ipChar;
    secret += String.fromCharCode(decryptedChar);
  }

  return secret;
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
