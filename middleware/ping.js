const axios = require('axios');

async function AVGServerPing() {
  try {
    const pingResults = await Promise.all(
      Array.from({ length: 5 }, async () => {
        const start = Date.now();
        await axios.get(`http://localhost:${process.env.PORT}`);
        const end = Date.now();
        return end - start;
      })
    );

    const avgPing = pingResults.reduce((total, ping) => total + ping, 0) / pingResults.length;
    return avgPing;
  } catch (error) {
    return error;
  }
}

module.exports = { AVGServerPing };