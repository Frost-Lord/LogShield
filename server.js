const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const evaluateAccessLog = require('./NGINX/evaluate');
const train = require('./NGINX/train');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const axios = require('axios');
require("dotenv").config();
const redis = require('redis');
const client = global.client = redis.createClient({
  username: process.env.Redis_Username,
  password: process.env.Redis_Password,
  socket: {
    host: process.env.Redis_Host,
    port: process.env.Redis_Port
}
});
client.on('error', err => console.log('Redis Client Error', err));
client.on("ready", () => { logger.success("Event", "Redis client ready"); });
client.on("reconnecting", () => { logger.warn("Event", "Redis client reconnecting"); });
client.on("end", () => { logger.warn("Event", "Redis client connection ended"); });
client.connect();

const cluster = require('node:cluster');
const os = require('node:os');
const logger = require('./utils/logger');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
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
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(cors());
  app.engine(".ejs", require("ejs").__express);
  app.set("view engine", "ejs");
  app.use(express.static(path.join(__dirname, "/public")));
  app.set("views", __dirname + "/views");
  app.set("trust proxy", true);

  app.use(
    session({
      key: 'logshield',
      secret: 'sg809psargae9pr8gaertgheho9ar8g',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: process.env.Session_Time * 60 * 1000 }, // 30 minutes
    })
  );

  const verifyRoutes = require('./routes/verify');
  const wafMiddleware = require('./middleware/wafRules');
  const rateLimit = require('./middleware/rateLimiter');
  const bandwidth = require('./middleware/bandwidth');

  const { router: verifyRouter, generateRayId } = verifyRoutes;

  fs.readdirSync("./api").forEach((file) => {
    app.use("/logshield/api", router);
    require(`./api/${file}`)(router, client, checkAuth);
  });

  app.use(rateLimit({ limit: process.env.Max_Requests, resetInterval: 60 * 1000 * process.env.Reset_Interval, blockDuration: process.env.BlockDuration * 60 * 1000 }));
  app.use(runcheck);
  app.use(wafMiddleware);
  app.use(verifyRouter);
  app.use(bandwidth);

  // Proxy configuration
  const Difficulty = process.env.DIFFICULTY || 1;

  function checkAuth(req, res, next) {
    const authCode = req.body.auth;

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
      const secret = generateRayId();
      res.render('ddosProtection', { req, secret, sub: secret.substring(0, 25), Difficulty, userIp: userIp });
    }
  });

  app.use(
    ['**', '/'],
    createProxyMiddleware({
      target: process.env.TARGETURL || 'http://localhost:3000',
      changeOrigin: true,
      ws: true,
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['x-frame-options'] = '';
      },
    })
  );

  app.listen(process.env.PORT || 7000, () => {
    logger.success("Event", `Proxy server listening at http://localhost:${process.env.PORT}`)
  });
}