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
    validate: [validator.isEmail, "Please provide a valid email"],
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
    // sets default select() behavior for this path, set to true if this path should always be selected
    // set to false if it should be excluded by default
    // can be overridden at the query level
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required a an input but not required to be persisted in the database
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  // isModified methods is available on mongoose documents
  // only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordCOnfirm field
  this.passwordConfirm = undefined;
  next();
});

// instance method is available on all documents of a certain collection
// this points to the current document; need to pass in the hashedPassword too bcos password is not available on the document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  hashedUserPassword
) {
  // candidatePassword = password that the user passes to req.body
  // userPassword = Data to be compared to
  // returns promise if callback is not specified
  // return true if password is the same and false if not
  return await bcrypt.compare(candidatePassword, hashedUserPassword);
};

// JWTTimeStamp is the timestamp that the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp)
    // WE DO NOT WANT TO GIVE ACCESS TO THE PROTECTED ROUTE WHEN THE TOKEN IS ISSUED BEFORE THE PASSWORD IS CHANGED
    // PASSWORD CHANGED TIMESTAMP SHOULD ALWAYS BE LESSER THAN TOKEN ISSUED TIMESTAMP
    // We WANT TO RETURN FALSE HERE
    console.log(JWTTimestamp < changedTimeStamp)
    return JWTTimestamp < changedTimeStamp;
  }
  // false means password not changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
