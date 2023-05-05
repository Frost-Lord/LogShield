const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const path = require('path');
const app = express();
const axios = require('axios');
require("dotenv").config();

// Express configuration
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine(".ejs", require("ejs").__express);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", __dirname + "/views");
app.use(express.json());
app.set("trust proxy", true);
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Session configuration
app.use(
  session({
    secret: 'sg809psargae9pr8gaertgheho9ar8g',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutes
  })
);

const banningRoutes = require('./routes/banning');
const verifyRoutes = require('./routes/verify');
const evaluateAccessLog = require('./evaluate');
const train = require('./train'); 

const { router: banningRouter, isBanned } = banningRoutes;
const { router: verifyRouter, generateRayId } = verifyRoutes;

app.use(runcheck);
app.use(banningRouter);
app.use(verifyRouter);

// Proxy configuration
const Difficulty = process.env.DIFFICULTY || 4;

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

async function runcheck(req, res, next) {
  const userIp = req.ip || req.headers['x-forwarded-for'];

  if (isBanned(userIp)) {
    res.render('banned', { userIp });
  } else {
    try {
      await axios.get(process.env.TARGETURL);
      next();
    } catch (error) {
      res.render('badGateway', { userIp });
    }
  }
}

app.use(async (req, res, next) => {
  const userIp = req.ip || req.headers['x-forwarded-for'];
  const isWhitelisted = req.session.whitelisted;

  if (isWhitelisted) {
    //next();
  } else {
    const secret = generateRayId(req.ip);
    res.render('ddosProtection', { req, secret, sub: secret.substring(0, 25), Difficulty, userIp: userIp });
  }
});

app.use(
  '/',
  createProxyMiddleware({
    target: process.env.TARGETURL,
    changeOrigin: true,
  })
);

app.listen(process.env.PORT, () => {
  console.log(`Proxy server listening at http://localhost:${process.env.PORT}`);
});