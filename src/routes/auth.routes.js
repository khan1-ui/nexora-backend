/**
 * Authentication Routes
 */

const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../validators/auth.validator");

const {
  registerOwner,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/register", registerValidation, validate, registerOwner);
router.post("/login", loginValidation, validate, loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
