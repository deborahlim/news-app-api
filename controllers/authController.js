const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
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

  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
});

exports.login = catchAsync(async () => {
  // check if email and password exists
  // check if user exists && password is correct
  // if all good, send token to client
  res.status(404).json({
    status: "fail",
    message: "This route is not yet defined",
  });
});
