const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.protect, authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword)

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteAllUsers
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.findUserById
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    userController.updateUserById
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUserById
  );

module.exports = router;
