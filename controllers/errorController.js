const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid User ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = () => {
  const message = `This email already exists`;
  return new AppError(message, 400);
};

const handleMongooseValidationErrors = (err) => {
  const validationErrors = Object.values(err.errors).map(el => {
    return el.message;
  }).join(". ")
const message =  `Invalid Input Entered. ${validationErrors}`;
return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // or use a logging library
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // send meaningful error message to clients for operational errors
    // handle invalid ids
    // not good practice to overwite the arguments of a function
    let error = Object.create(err);
    if (error.kind === "ObjectId") {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFields();
    }
    else if (error.name === "ValidationError") {
      error = handleMongooseValidationErrors(err);
    }
    sendErrorProd(error, res);
  }
};
