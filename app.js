const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const { MongoClient, ServerApiVersion } = require("mongodb");

// start express app
let app = express();

// middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(cors);

// routes
app.get("/", (req, res, next) => {
  console.log("Hello World");
});

module.exports = app;
