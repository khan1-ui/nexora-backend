const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: ["invoice", "expense", "system"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  }, 
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
