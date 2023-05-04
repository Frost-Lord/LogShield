const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimiter, trackNonceRequests } = require('./rateLimiter');
const crypto = require('crypto');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine(".ejs", require("ejs").__express);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("trust proxy", true);

const port = 7000;
const targetPort = 7248;
const targetUrl = `http://localhost:${targetPort}`;
const Difficulty = 4;

const ipStore = new Map();

function generateRayId(ip, difficulty) {
  let hashInput = ip + "3il54hbi323wptu89awe9gyse8ogr4e";
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

app.post('/', async (req, res) => {
  const userIp = req.ip;
  const rayId = req.body.ray;
  const { nonce } = req.body;

  if (nonce && checkRayId(rayId, userIp, Difficulty)) {
    ipStore.set(userIp, true);
    console.log('Whitelisted IP:', userIp);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.use(async (req, res, next) => {
  const userIp = req.ip;
  const rayId = req.query.ray || (req.body && req.body.ray);
  const isWhitelisted = ipStore.has(userIp);

  if (rayId && checkRayId(rayId, req.ip, Difficulty)) {
    ipStore.set(userIp, true);
    console.log('Whitelisted IP:', userIp);
  }

  if (isWhitelisted || checkRayId(rayId, req.ip, Difficulty)) {
    next();
    console.log('Whitelisted IP:', userIp);
  } else {
    const newRayId = generateRayId(req.ip, Difficulty);
    res.render('ddosProtection', { req, newRayId, Difficulty });
    trackNonceRequests(req, res, next);
    console.log('Non-whitelisted IP:', userIp);
  }
});

app.use(
  '/',
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = path.replace(/(\?|&)ray=([^&]+)/, '');
      return newPath;
    },
    onProxyReq: (proxyReq, req) => {
      const rayId = req.query.ray;
      if (rayId) {
        proxyReq.setHeader('rayId', rayId);
      }
    },
  })
);

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});