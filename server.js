// loads environment variables from a .env file into process.env
const dotenv = require("dotenv");
const mongoose = require("mongoose");
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
