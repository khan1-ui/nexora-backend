const Notification = require("../models/Notification.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

/* ==============================
   GET NOTIFICATIONS
================================ */
exports.getNotifications = asyncHandler(async (req, res) => {
  const companyId = req.user.company?._id || req.user.company;
  const notifications = await Notification.find({
    company: companyId,
  })
    .sort({ createdAt: -1 })
    .limit(20); // prevent overload

  const unreadCount = await Notification.countDocuments({
    company: companyId,
    isRead: false,
  });

  res.json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

/* ==============================
   MARK SINGLE AS READ
================================ */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      company: req.user.company._id, // 🔐 company isolation
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.json({ success: true });
});

/* ==============================
   MARK ALL AS READ
================================ */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { company: req.user.company._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true });
});
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company._id,
  });

  res.json({ success: true });
});