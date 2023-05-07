const cluster = require('node:cluster');
const os = require('node:os');
const logger = require('./utils/logger');

const numCPUs = os.availableParallelism();
global.disableLogs = true;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  if (cluster.isPrimary) {
    global.disableLogs = false;
  } else {
    global.disableLogs = true;
  }
  createServer();
  setTimeout(() => {
    global.disableLogs = false;
    logger.worker("Event", `Worker ${process.pid} started`);
  }, 5000);
}

async function createServer() {
const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const evaluateAccessLog = require('./NGINX/evaluate');
const train = require('./NGINX/train'); 
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const app = express();
const axios = require('axios');
require("dotenv").config();
const redis = require('redis');
const client = global.client = redis.createClient({
  username: 'default',
  password: 'qVFxATVuYmGMwJRengkJYm1Z0cz9V8bi',
  socket: {
      host: 'redis-15979.c11.us-east-1-3.ec2.cloud.redislabs.com',
      port: 15979
  }
});
client.on('error', err => console.log('Redis Client Error', err));
client.on("ready", () => { logger.success("Event", "Redis client ready"); });
client.on("reconnecting", () => { logger.warn("Event", "Redis client reconnecting"); });
client.on("end", () => { logger.warn("Event", "Redis client connection ended"); });
client.connect();

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
    key: 'logshield',
    secret: 'sg809psargae9pr8gaertgheho9ar8g',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutes
  })
);

const verifyRoutes = require('./routes/verify');
const wafMiddleware = require('./middleware/wafRules');
const rateLimit = require('./middleware/rateLimiter');

const { router: verifyRouter, generateRayId } = verifyRoutes;

fs.readdirSync("./api").forEach((file) => {
  app.use("/logshield/api", router);
  require(`./api/${file}`)(router, client, checkAuth);
});

app.use(rateLimit({ limit: 1, resetInterval: 60 * 1000, blockDuration: 2 * 60 * 1000 }));

app.use(runcheck);
app.use(wafMiddleware);
app.use(verifyRouter);

// Proxy configuration
const Difficulty = process.env.DIFFICULTY || 4;

function checkAuth(req, res, next) {
  const authCode = req.query.auth;

  if (authCode === 'aielgv8sgeasgryleairgearihu') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}


app.get('/evaluate', checkAuth, async (req, res, next) => {
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

  try {
    await axios.get(process.env.TARGETURL);
    next();
  } catch (error) {
    res.render('badGateway', { userIp });
    return;
  }
}

app.use(async (req, res, next) => {
  const userIp = req.ip || req.headers['x-forwarded-for'];

  if (req.session.whitelisted) {
    next();
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
    ws: true,
  })
);

app.listen(process.env.PORT, () => {
  logger.success("Event", `Proxy server listening at http://localhost:${process.env.PORT}`)
});
}