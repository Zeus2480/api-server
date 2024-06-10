const express = require("express");
const { UserController } = require("../../controller");
const { ValidationMiddleware, AuthMiddleware } = require("../../middlewares");
const router = express.Router();

router.post("/register", ValidationMiddleware.validateRegister, UserController.register);
router.post("/login", ValidationMiddleware.validateLogin, UserController.login);
router.get("/me", AuthMiddleware.authenticateToken, UserController.me);

module.exports = router; 