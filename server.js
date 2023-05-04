const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const app = express();
require("dotenv").config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine(".ejs", require("ejs").__express);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", __dirname + "/views");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("trust proxy", true);

app.use(
  session({
    secret: 'sg809psargae9pr8gaertgheho9ar8g',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 15 * 60 * 1000 }, // 15 minutes
  })
);

const port = 7000;
const targetPort = 7248;
const targetUrl = `http://localhost:${targetPort}`;
const Difficulty = 4;

function generateRayId(ip, difficulty) {
  let hashInput = ip + process.env.SECRET;
  let hashOutput;

  for (let i = 0; i < difficulty; i++) {
    const hash = crypto.createHash('sha256');
    hash.update(hashInput);
    hashOutput = hash.digest('hex').substr(0, 16);
    hashInput = hashOutput;
  }

  return hashOutput;
}


function checkRayId(rayId, ip, difficulty) {
  const expectedRayId = generateRayId(ip, difficulty);
  console.log('Expected Ray ID:', expectedRayId, 'Received Ray ID:', rayId);
  return rayId === expectedRayId;
}

app.get('/verify-ray', async (req, res) => {
  const userIp = req.ip;
  const rayId = req.query.ray;

  if (checkRayId(rayId, userIp, Difficulty)) {
    req.session.whitelisted = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});


app.use(async (req, res, next) => {
  const userIp = req.ip;
  const isWhitelisted = req.session.whitelisted;

  if (isWhitelisted) {
    next();
    console.log('Whitelisted IP:', userIp);
  } else {
    const secret = generateRayId(req.ip);
    res.render('ddosProtection', { req, secret, Difficulty, userIp: req.ip });
    console.log('Non-whitelisted IP:', userIp);
  }
});

app.use(
  '/',
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
  })
);

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
