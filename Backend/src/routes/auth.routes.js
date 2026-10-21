const express = require("express");
const authControllers = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", authControllers.registerController);

router.post("/login", authControllers.loginController);

module.exports = router;
