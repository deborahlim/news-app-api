const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  // create user in the database
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // so that password field is not sent back in the response
  const user = await User.findById(newUser._id);

  // only want to store the new user's id in the payload
  const token = signToken(newUser._id);

  // send the token back to the client with the user data
  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log("LOGINNNNN")
  let { email, password } = req.body;
  // check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  console.log(email, password)
  // check if user exists && password is correct
  // use +password to explicitly select password field which was set by default as false
  let user = await User.findOne({ email }).select("+password");

  // correctPassword is an instance method
  // compare the hashed password in the database with the password which was posted to the server
  // use bcrypt package
  // need await as correctPassword is an async function

  // if there is no user, do not check for correct password
  // only if there is a user, check for correct password

  // if correct password do not execute the error middleware
  // only if wrong password execute the error middleware
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 means unauthorized
    return next(new AppError("Incorrect email or password", 401));
  }

  // if all good, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
