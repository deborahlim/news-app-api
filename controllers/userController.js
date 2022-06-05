const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const factory = require("../controllers/handlerFactory");
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

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
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
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "country",
    "language",
    "savedTopics"
  );

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = factory.getAll = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUserById = factory.updateOne(User);

exports.deleteUserById = factory.deleteOne(User);

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
