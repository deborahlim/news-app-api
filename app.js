
const express = require("express");
const cors = require("cors");
// const { MongoClient, ServerApiVersion } = require("mongodb");



// start express app
let app = express();

app.use(express.json());
app.use(cors);


// routes
app.get("/", (req, res, next) => {
    console.log("Hello World")
})

module.exports = app;