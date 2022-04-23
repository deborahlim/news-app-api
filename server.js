// loads environment variables from a .env file into process.env
const dotenv = require("dotenv")
const mongoose = require('mongoose');
const User = require('./models/userModel')
dotenv.config();
const app = require("./app");

const DB = process.env.MONGO_URI.replace("<password>", process.env.DATABASE_PASSWORD);
console.log(DB)
// returns promise
mongoose.connect(DB).then(con => {
    console.log(con.connections)
    console.log("DB Connected")
});

const testUser = new User({
    name: "Deb",
    email: "deborahlimhy@email.com",
    photo: "",
    role: "user",
    password: "redowner111",
    passwordConfirm: "redowner111"
})

testUser.save();
const port  = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})