const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
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

const createSendToken = (user, statusCode, res) => {
  // only want to store the new user's id in the payload
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // remove password from output
  user.password = undefined;

  // send the token back to the client with the user data
  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // create user in the database
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    // role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    photo: req.body?.photo,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  let { email, password, photo, googleAuthUser } = req.body;
  // check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

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
  if (!user || !(await user.correctPassword(password, user.password))) {
    // 401 means unauthorized
    return next(new AppError("Incorrect email or password", 401));
  }

  // update photo if photo is different for google auth users
  if (googleAuthUser && photo !== user.photo) {
    console.log("Photo is different");
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { photo: photo },
      {
        new: true,
        runValidators: true,
      }
    );

    return createSendToken(updatedUser, 200, res);
  }
  // if all good, send token to client
  createSendToken(user, 200, res);
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

  console.log("TOKEN", token);

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
  let isChanged = currentUser.changedPasswordAfter(decodedTokenPayload.iat);
  if (isChanged) {
    console.log(isChanged);
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  // grant access to protected route
  // req obj is available from middleware to middleware
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email,
  });
  console.log(user);
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  // generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // turn off validation checks for confirm password field
  await user.save({ validateBeforeSave: false });
  // send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;
  console.log(resetURL);
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\n
  If you didn't forget your password, please ignore this email!`;

  // DO NOT SEND THE RESET TOKEN IN THE JSON RESPONSE
  // RESET TOKEN SHOULD ONLY BE SENT TO THE USER'S EMAIL
  // use try catch block because we want to do more than send error response to the client
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    // reset the reset password token and reset password expired
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    return next(
      new AppError("There was an error sending the email. Try again later!")
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from the collection
  const user = await User.findById(req.user.id).select("+password");
  // check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError("Your provided current password is not correct", 403)
    );
  }
  // if so, update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log user in, send JWT
  createSendToken(user, 201, res);
});
