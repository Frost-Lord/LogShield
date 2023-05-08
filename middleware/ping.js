const axios = require('axios');

async function AVGServerPing() {
  try {
    const pingResults = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await axios.get("http://localhost:" + process.env.PORT);
      const end = Date.now();
      const ping = end - start;
      pingResults.push(ping);
    }

    const avgPing = pingResults.reduce((total, ping) => total + ping, 0) / pingResults.length;
    return avgPing;
  } catch (error) {
    return error;
  }
}

module.exports = {AVGServerPing};