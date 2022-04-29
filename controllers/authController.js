const res = require("express/lib/response");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel")
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
  
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  });

  exports.login = catchAsync(async() => {
    res.status(404).json({
      status: "fail",
      message: "This route is not yet defined"
    })
  })