// loads environment variables from a .env file into process.env
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// handle synchronous code; uncaught exceptions
// should be at the top before any code executes
// uncaught exceptions will have nothing to do with the server,
// so dont need to wait for server to close before shutting down application

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION SHUTTING DOWN...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config();
const app = require("./app");

const DB = process.env.MONGO_URI.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, { useNewUrlParser: true }).then((con) => {
  //   console.log(con.connections);
  console.log("DB Connected");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
// handle asynchronous code
// unhandled promise rejection; somewhere there was a promise that was rejected but was not handled
// subscribe to the unhandledRejection event that will be emitted by the process object when there is a unhandled promise rejection
// central place to handle all unhandled promised rejection as a last safety net
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  console.log(err.name, err.message, err.stack);
  // shut down gracefully by closing the server first before shutting down app
  // process.exit() will immediately abort all the requests that are currently still running or pending
  // gives the server time to finish all the requests that are pending or being handled
  server.close(() => {
    // to shut down application
    // 0 stands for success
    // 1 stands for uncaught exception
    process.exit(1);
    // will also restart application in real world
  });
});
