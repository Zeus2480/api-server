const express = require("express");
const userRoutes = require("./user-routes");
const projectRoutes = require("./project-routes")
const router = express.Router();

router.use("/user", userRoutes);
router.use("/project", projectRoutes);

module.exports = router;
