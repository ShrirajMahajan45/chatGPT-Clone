const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {

  const {
    fullName: { firstName, lastName },
    email,
    password,
  } = req.body;


  // check user is already present or not
  const isUserAlreadyExists = await userModel.findOne({
    email: email,
  });

  // If user is already present
  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User is Already Exists",
    });
  }

  // if user is not present
  // craete the hashPassword
  const hashPassword = await bcrypt.hash(password, 10);

  // create user in DB
  const user = await userModel.create({
    fullName: {
      firstName,
      lastName,
    },
    email,
    password: hashPassword,
  });

  // create token for user
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  // store the token in user cookie
  res.cookie("token", token);

  // send res to user
  res.status(201).json({
    message: "User is Registered Successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
}

async function loginController(req, res) {
  const { email, password } = req.body;

  // check user is present or not in DB
  const user = await userModel.findOne({ email });

  // if user is not present
  if (!user) {
    return res.status(400).json({
      message: "Invalid email and password",
    });
  }

  // If User is Present in DB,check whether the password is correct or not

  const isPasswordValid = await bcrypt.compare(password, user.password);

  // if password is incorrect
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email and Password",
    });
  }

  // if pass is correct create the token for user and add it in cookie
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token);

  // send res to user
  res.status(200).json({
    message: "User LoggedIn Successfully",
    user: {
      id: user._id,
      email,
      fullName: user.fullName,
    },
  });
}

module.exports = { registerController, loginController };
