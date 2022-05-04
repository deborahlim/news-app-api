const { promisify } = require("util");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { is } = require("express/lib/request");

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
    passwordChangedAt: req.body.passwordChangedAt
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
  console.log("LOGINNNNN");
  let { email, password } = req.body;
  // check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  console.log(email, password);
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

// middleware to protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // get token and check if its in the request header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  console.log(token);

  // Verify Token function is an asynchronous function
  // requires a callback function which will run once the verification is complete
  // instead will make the function return a promise when it is called
  // and await the value and store it in a variable
  // the value will be the decoded data
  // need token so that algorithm can read the payload and also the secret to
  // to create the test signature
  const decodedTokenPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  console.log(decodedTokenPayload);
  // Check if user still exists in case user has been deleted but token is still valid
  const currentUser = await User.findById(decodedTokenPayload.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }
  // Check if user changed password after token was issued
  let isChanged = currentUser.changedPasswordAfter(decodedTokenPayload.iat)
  if (isChanged) {
    console.log(isChanged)
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  // grant access to protected route
  // req obj is available from middleware to middleware 
  req.user = currentUser;
  next();
});
