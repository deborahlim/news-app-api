const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// catch async errors with try catch blocks is not ideal
// alternatively, can wrap async function inside of a wrapper function
// catchAsync will return an anonymous function which will be assigned to get all users
// when a request is made to the get all users handler, the anonymous functon will run
// which returns the inner function which is the async function which returns a promise. If the promise gets rejected, we can catch the error
// with the catch method available on all promises
// the catch method will pass the error into the next function, and the error will end up in the global handling middleware

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // send response
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword"
      )
    );
  }
  // Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(re.body, "name", "email");

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.findUserById = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    // need to put return keyword here so that we do not move on to the next line and send two responses
    // go straight to global error handling middleware
    const noUserFoundError = new AppError("No user found with that ID", 404);
    return next(noUserFoundError);
  }
  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  let updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // true to return the modified document rather than the original. defaults to false
    runValidators: true, // if true runs update validators which validate the update operation against the model's schema
  });

  if (!updatedUser) {
    return next(new AppError("No user found by that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: deletedUser,
  });
});

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  const deletedUsers = await User.deleteMany({
    role: "user",
  });
  // returns an object with the property deletedCount containing the number of documents deleted
  if (!deletedUsers.deletedCount === 0) {
    return next(new AppError("Unable to delete all users", 400));
  }
  res.status(204).json({
    status: "success",
    data: deletedUsers,
  });
});

// Model.prototype = methods available on all the instances created through a model not the model itself
