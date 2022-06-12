const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const formidableMiddleware = require('express-formidable');

const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const adminBroConfig = require("./routes/adminBroConfig");
const AppError = require("./utils/appError");

// start express app
const app = express();

// middlewares
app.use(formidableMiddleware());

// admin bro
app.use(adminBroConfig.adminBro.options.rootPath, adminBroConfig.adminBroRouter);

app.use(cors());

// set security HTTP headers add unsafe directives so admin bro can run inline script
// https://github.com/SoftwareBrothers/adminjs/issues/607
app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"]
      }
  }
}));

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 6 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// routes
app.use("/api/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware must be the last
app.use(globalErrorHandler);

module.exports = app;
