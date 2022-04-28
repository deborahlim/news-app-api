const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
// start express app
const app = express();

// middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRouter);
app.use(globalErrorHandler);
// to deal with unhandled routes, should be the last middleware
app.all("*", (req, res, next) => {  
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
