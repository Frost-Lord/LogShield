const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
let CreateLog = null;
let webhook = false;

module.exports = (router, client, checkAuth) => {
  fs.readdirSync(path.join(__dirname, "../plugin")).forEach((dir) => {
    const pluginPath = path.join(__dirname, "../plugin", dir);
    if (fs.lstatSync(pluginPath).isDirectory()) {
      logger.plugin("EVENT", `Loading plugin ${dir}`);

      if (fs.existsSync(path.join(pluginPath, "index.js"))) {
        if (pluginPath.includes("DISCORD")) {
          webhook = true;
          try {
            CreateLog = require(path.join(pluginPath, "index.js")).CreateLog;
          } catch (err) {
            logger.plugin("ERROR", `Failed to load plugin ${dir}`);
            logger.plugin("ERROR", err.message);
          }
        }
      }

      router.post(`/${dir}/evaluate`, checkAuth, async (req, res, next) => {
        try {
          const EvalRNN = require(path.join(
            pluginPath,
            "evaluate.js"
          ));
          await EvalRNN(req)
            .then(async (data) => {
              if (data.length === 0) {
                res.send("No malicious activities detected.");
              } else {
                await res.send(data);
                if (webhook && CreateLog) {
                  await CreateLog(dir, data);
                }
              }
            })
            .catch((err) => {
              console.error(err);
              res
                .status(500)
                .send("An error occurred while evaluating the access log.");
            });
        } catch (err) {
          res.status(500).send(err.message);
        }
      });

      router.post(`/${dir}/train`, checkAuth, async (req, res) => {
        try {
          const train = require(path.join(pluginPath, "train.js"));
          await train()
            .then((data) => {
              res.json(data);
            })
            .catch((err) => {
              console.error(err);
              res
                .status(500)
                .send("An error occurred while training the model.");
            });
        } catch (err) {
          res.status(500).send(err.message);
        }
      });

      setInterval(() => {
        //RunEval(pluginPath);
      }, 10 * 1000); // 10s
    }
  });

  async function RunEval(pluginPath) {
    const EvalRNN = await require(path.join(pluginPath, "evaluate.js"));
    let req = {
      body: {
        data: {
          live: true,
        },
      },
    };
    await EvalRNN(req);
  }
};
