const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
// catch async errors
// to get rid of try catch blocks wrapped async function inside of catchAsync
// catchAsync will return an anonymous function which will be assigned to get all users
// when a request is made to the get all users handler, the anonymous functon will run
// which returns the inner function which is the async function which returns a promise. If the promise gets rejected, we can catch the error
// with the catch method available on all promises
// the catch method will pass the error into the next function, and the error will end up in the global handling middleware

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

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
});

exports.findUserById = catchAsync(async (req, res, next) => {
    let user = await User.findById(req.params.id);

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

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
});

exports.deleteUserById = catchAsync(async (req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: deletedUser,
    });
});

// Model.prototype = methods available on all the instances created through a model not the model itself
