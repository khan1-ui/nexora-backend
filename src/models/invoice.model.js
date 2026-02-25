/**
 * Invoice Model
 * Represents billing document for a specific client
 * Tenant-isolated using company reference
 */

const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    items: [invoiceItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue"],
      default: "unpaid",
    },

    dueDate: {
      type: Date,
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

module.exports = mongoose.model("Invoice", invoiceSchema);
