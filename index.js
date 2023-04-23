const express = require('express');
const app = express();
const evaluateAccessLog = require('./evaluate');
const train = require('./train'); 

function checkAuth(req, res, next) {
  const authCode = req.query.auth;

  if (authCode === '12345') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

app.get('/evaluate', checkAuth, async (req, res) => {
  try {
    await evaluateAccessLog()
    .then(maliciousUsers => {
      if (maliciousUsers.length === 0) {
        res.send('No malicious users detected.');
      } else {
        let mal = [];
        maliciousUsers.forEach(user => {
          if (mal.includes(user.ip) === false) {
            mal.push(user.ip);
          }
        });
        res.send(`Malicious users detected: ${mal}`);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('An error occurred while evaluating the access log.');
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/train', checkAuth, async (req, res) => {
    try {
        await train()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('An error occurred while training the model.');
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
