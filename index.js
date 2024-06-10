const express = require("express");
const cors = require("cors");
const { ServerConfig, Logger } = require("./config");
const apiRoutes = require("./routes");
const { initRedisSubscribe } = require('./initRedisSubscribe');

const app = express();

initRedisSubscribe();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  console.log(`Listening on port ${ServerConfig.PORT}`);
  Logger.info("Successfully started the server", {});
});
