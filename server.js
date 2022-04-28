// loads environment variables from a .env file into process.env
const dotenv = require("dotenv");
const { download } = require("express/lib/response");
const mongoose = require("mongoose");

process.on("uncaughtException", () => {
  console.log("UNCAUGHT EXCEPTION SHUTTING DOWN...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();
const app = require("./app");

const DB = process.env.MONGO_URI.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);


mongoose.connect(DB).then((con) => {
//   console.log(con.connections);
  console.log("DB Connected");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

process.on("unhandledRejection", () => {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  })
});


