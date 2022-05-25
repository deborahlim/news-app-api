const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.patch(
  "/updatePassword",

  authController.updatePassword
);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .delete(userController.deleteAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
