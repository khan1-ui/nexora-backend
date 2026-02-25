/**
 * Expense Model (Upgraded - SaaS Ready)
 * Supports:
 * - Soft Delete
 * - Tenant Isolation
 * - Future analytics
 */

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      default: "general",
      trim: true,
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);