// loads environment variables from a .env file into process.env
require("dotenv").config();
console.log(process.env)
const express = require("express");
let app = express();
const port = 3000;

const cors = require("cors");

const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoUri = process.env.MONGO_URI

async function main() {
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  client.connect((err) => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    console.log("Database connected");
    client.close();
  });

  app.use(express.json());
  app.use(cors);
  // app responds/ callback function will get called when there are requests to the root URL / route
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

// app starts a server and listens on port 3000 for connections
// to run the app use node index.js

main();
