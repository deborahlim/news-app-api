// const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
// const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please tell us your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please tell us your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
