const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.route("/signup").post(authController.signup);

router.route("/login").post(authController.login);

router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.findUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
