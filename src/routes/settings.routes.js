const express = require("express");
const protect = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");

const {
  getSettings,
  updateProfile,
  updateCompany,
} = require("../controllers/settings.controller.js");

const router = express.Router();

/* GET ALL SETTINGS */
router.get("/", protect, getSettings);

/* PROFILE UPDATE */
router.put("/profile", protect, updateProfile);

/* COMPANY UPDATE (Owner Only) */
router.put(
  "/company",
  protect,
  authorize("owner"),
  updateCompany
);

module.exports = router;