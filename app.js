const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const userRouter = require("./routes/userRoutes");
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

app.get("/", (req, res) => {
  res.send("Welcome to the News App API")
})

module.exports = app;
