const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notification.Controller.js");
const  protect =require("../middlewares/auth.middleware.js");

router.get("/", protect, getNotifications);

// STATIC ROUTES FIRST
router.patch("/read-all", protect, markAllAsRead);

// DYNAMIC ROUTES AFTER
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
