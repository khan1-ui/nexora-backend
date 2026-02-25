const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const { getDashboardStats } = require("../controllers/dashboard.controller");

/**
 * Dashboard Route
 */ 
router.get("/", protect, getDashboardStats );

module.exports = router;
