const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log("ALL USERS", users);
    // send response
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users: users,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e,
    });
  }
};

exports.findUserById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e,
    });
  }
};

exports.updateUserById = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(400).json({
      status: "fail",
      message: e,
    });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: deletedUser,
    });
  } catch (e) {
    res.status(404).json({
      status: "fail",
      message: e,
    });
  }
};

// Model.prototype = methods available on all the instances created through a model not the model itself
