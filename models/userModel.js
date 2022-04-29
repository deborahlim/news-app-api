// const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
  passwordConfirm: {
    type: String,
    // required a an input but not required to be persisted in the database
    required: [true, "Please confirm your password"],
    validate: {
      validator: function(el) {
        return el === this.password
      }
    }
  }
});

userSchema.pre("save", async function(next) {
  // isModified methods is available on mongoose documents
  // only run this function if password was actually modified
  if(!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordCOnfirm field
  this.passwordConfirm = undefined;
  next();
})





const User = mongoose.model("User", userSchema);

module.exports = User;
