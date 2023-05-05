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
    cookie: { maxAge: 15 * 60 * 1000 }, // 15 minutes
  })
);

const banningRoutes = require('./routes/banning');
const verifyRoutes = require('./routes/verify');

const { router: banningRouter, isBanned } = banningRoutes;
const { router: verifyRouter, generateRayId } = verifyRoutes;

app.use(runcheck);
app.use(banningRouter);
app.use(verifyRouter);

// Proxy configuration
const Difficulty = process.env.DIFFICULTY || 4;

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
    res.render('ddosProtection', { req, secret, Difficulty, userIp: userIp });
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