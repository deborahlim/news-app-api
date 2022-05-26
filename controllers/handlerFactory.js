const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const collection = await Model.find();
    // send response
    res.status(200).json({
      status: "success",
      results: collection.length,
      data: {
        data: collection,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc = await Model.findById(req.params.id);
    if (!doc) {
      // need to put return keyword here so that we do not move on to the next line and send two responses
      // go straight to global error handling middleware
      const noDocFoundError = new AppError(
        "No document found with that ID",
        404
      );
      return next(noDocFoundError);
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // true to return the modified document rather than the original. defaults to false
      runValidators: true, // if true runs update validators which validate the update operation against the model's schema
    });

    if (!doc) {
      return next(new AppError("No document found by that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
