const express = require("express");
const authControllers = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authControllers.registerController);

router.post("/login", authControllers.loginController);

router.post("/logout", authControllers.logoutController);

// Check whether the current user is logged in
router.get("/me", authUser, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      email: req.user.email,
      fullName: req.user.fullName,
    },
  });
});

module.exports = router;
