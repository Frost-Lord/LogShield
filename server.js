const express = require("express");
const router = express.Router();
const app = express();
const compression = require("compression");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();
const redis = require("redis");
const client = (global.client = redis.createClient({
  username: process.env.Redis_Username,
  password: process.env.Redis_Password,
  socket: {
    host: process.env.Redis_Host,
    port: process.env.Redis_Port,
  },
}));
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("ready", () => {
  logger.success("Event", "Redis client ready");
});
client.on("reconnecting", () => {
  logger.warn("Event", "Redis client reconnecting");
});
client.on("end", () => {
  logger.warn("Event", "Redis client connection ended");
});
client.connect();

const cluster = require("node:cluster");
const os = require("node:os");
const logger = require("./utils/logger");

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
    cluster.fork();
  });
  createServer();
  global.disableLogs = false;
} else {
  global.disableLogs = true;
  setTimeout(() => {
    global.disableLogs = false;
    logger.worker("Event", `Worker ${process.pid} started`);
  }, 5000);
}

async function createServer() {
  app.use(compression());
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
      key: "logshield",
      secret: "sg809psargae9pr8gaertgheho9ar8g",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: process.env.Session_Time * 60 * 1000 }, // 30 minutes
    })
  );

  const verifyRoutes = require("./routes/verify");
  const wafMiddleware = require("./middleware/wafRules");
  const rateLimit = require("./middleware/rateLimiter");
  const bandwidth = require("./middleware/bandwidth");

  const { router: verifyRouter, generateRayId } = verifyRoutes;

  fs.readdirSync("./api").forEach((file) => {
    app.use("/logshield/api", router);
    require(`./api/${file}`)(router, client, checkAuth);
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // API
  ///////////////////////////////////////////////////////////////////////////////////////////////

  app.use(
    rateLimit({
      limit: process.env.Max_Requests,
      resetInterval: 60 * 1000 * process.env.Reset_Interval,
      blockDuration: process.env.BlockDuration * 60 * 1000,
    })
  );
  app.use(runcheck);
  app.use(wafMiddleware);
  app.use(verifyRouter);
  app.use(bandwidth);

  // Proxy configuration
  const Difficulty = process.env.DIFFICULTY || 1;

  function checkAuth(req, res, next) {
    const authCode = req.body.auth;

    if (authCode === "aielgv8sgeasgryleairgearihu") {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  }

  async function runcheck(req, res, next) {
    const userIp = req.ip || req.headers["x-forwarded-for"];

    try {
      await axios.get(process.env.TARGETURL);
      next();
    } catch (error) {
      res.render("badGateway", { userIp });
      return;
    }
  }

  app.use(async (req, res, next) => {
    const userIp = req.ip || req.headers["x-forwarded-for"];

    if (req.session.whitelisted) {
      next();
    } else {
      const secret = generateRayId();
      res.render("ddosProtection", {
        req,
        secret,
        sub: secret.substring(0, 25),
        Difficulty,
        userIp: userIp,
      });
    }
  });

  app.use(
    ["**", "/"],
    createProxyMiddleware({
      target: process.env.TARGETURL || "http://localhost:3000",
      changeOrigin: true,
      ws: true,
    })
  );

  app.listen(process.env.PORT || 7000, () => {
    logger.success(
      "Event",
      `Proxy server listening at http://localhost:${process.env.PORT}`
    );
  });
}
