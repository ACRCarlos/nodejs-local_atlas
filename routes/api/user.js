const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const auth = require("../../middleware/auth");
const UserController = require("../../controllers/user");

router.get("/user", auth, UserController.getUser);

router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  UserController.postRegisterUser
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).exists(),
  ],
  UserController.postLoginUser
);

module.exports = router;
