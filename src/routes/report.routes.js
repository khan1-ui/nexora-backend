const express = require("express");
const { getFinancialReport } = require("../controllers/report.controller.js");
const protect =require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/role.middleware.js");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("owner", "manager"),
  getFinancialReport
);

module.exports = router;
