const express = require("express");
const { UserController } = require("../../controller");
const { AuthMiddleware, ValidationMiddleware } = require("../../middlewares");
const router = express.Router();

router.post("/", AuthMiddleware.authenticateToken, ValidationMiddleware.validateCreateProject, UserController.createProject);
router.get("/", AuthMiddleware.authenticateToken,  UserController.getProjects);
router.get("/:id", AuthMiddleware.authenticateToken,  UserController.getProject);
router.post("/:id/env", AuthMiddleware.authenticateToken, ValidationMiddleware.validateEnvVar, UserController.addEnvVar);
router.get("/deployment/:id/logs", AuthMiddleware.authenticateToken, UserController.getDeploymentLogs);

module.exports = router; 