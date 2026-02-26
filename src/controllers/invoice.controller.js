/**
 * Invoice Controller (Upgraded)
 * CodeCanyon Production Standard
 */
const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");
const Client = require("../models/client.model");
const Notification = require("../models/notification.model");
const ActivityLog = require("../models/activitylog.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

/* =======================================================
   CREATE INVOICE
======================================================= */
exports.createInvoice = asyncHandler(async (req, res, next) => {
  const { client, items, dueDate, status } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("Invoice items are required", 400));
  }

  const existingClient = await Client.findOne({
    _id: client,
    company: req.user.company._id,
  });

  if (!existingClient) {
    return next(new AppError("Client not found", 404));
  }

  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const invoice = await Invoice.create({
    client,
    items,
    totalAmount,
    dueDate,
    status: status || "unpaid",
    company: req.user.company._id,
  });

  await ActivityLog.create({
    company: req.user.company._id,
    user: req.user._id,
    action: "Created Invoice",
    entity: invoice._id,
  });

  // 🔔 Notification
  const notification = await Notification.create({
    company: req.user.company._id,
    title: "New Invoice Created",
    message: `Invoice for ${existingClient.name} - $${totalAmount}`,
    type: "invoice",
  });

  // Optional socket emit
  const io = req.app.get("socketio");
  if (io) {
    io.to(req.user.company._id.toString())
      .emit("newNotification", notification);
  }

  res.status(201).json({
    success: true,
    data: invoice,
  });
});

/* =======================================================
   GET ALL INVOICES
======================================================= */
exports.getInvoices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, search = "" } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

 const query = {
  company: new mongoose.Types.ObjectId(req.user.company._id),
  isDeleted: false,
};
  if (search) {
    query.status = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;

  const invoices = await Invoice.find(query)
    .populate("client", "name")
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limitNumber);

  const total = await Invoice.countDocuments(query);

  res.status(200).json({
    success: true,
    data: invoices,
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/* =======================================================
   UPDATE FULL INVOICE (EDIT)
   PATCH /api/invoices/:id
======================================================= */
exports.updateInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { client, items, dueDate, status } = req.body;

  const invoice = await Invoice.findOne({
    _id: id,
    company: req.user.company._id,
  });

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  // Optional field update pattern (Safe Update)
  if (client) invoice.client = client;
  if (dueDate) invoice.dueDate = dueDate;
  if (status) invoice.status = status;

  if (items && items.length > 0) {
    const totalAmount = items.reduce(
      (acc, item) =>
        acc + Number(item.quantity) * Number(item.price),
      0
    );

    invoice.items = items;
    invoice.totalAmount = totalAmount;
  }

  await invoice.save();

  res.status(200).json({
    success: true,
    message: "Invoice updated successfully",
    data: invoice,
  });
});

/* =======================================================
   QUICK STATUS UPDATE
   PATCH /api/invoices/:id/status
======================================================= */
exports.updateInvoiceStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["unpaid", "paid", "overdue"];

  if (!allowedStatus.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const invoice = await Invoice.findOne({
    _id: id,
    company: req.user.company._id,
  }).populate("client", "name");

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  invoice.status = status;
  await invoice.save();

  await Notification.create({
    company: req.user.company._id,
    title: "Invoice Status Updated",
    message: `${invoice.client.name} invoice marked as ${status}`,
    type: "invoice",
  });

  res.status(200).json({
    success: true,
    message: "Status updated successfully",
    data: invoice,
  });
});
/* =======================================================
   DELETE INVOICE
   DELETE /api/invoices/:id
======================================================= */
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findOne({
    _id: id,
    company: req.user.company._id,
  }).populate("client", "name");

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  invoice.isDeleted = true;
  invoice.deletedAt = new Date();
  await invoice.save();

  await Notification.create({
    company: req.user.company._id,
    title: "Invoice Moved to Trash",
    message: `${invoice.client.name} invoice moved to trash`,
    type: "invoice",
  });

  res.status(200).json({
    success: true,
    message: "Invoice moved to trash",
  });
});
exports.getTrashedInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({
    company: req.user.company._id,
    isDeleted: true,
  }).populate("client", "name")
    .sort({ deletedAt: -1 });

  res.status(200).json({
    success: true,
    data: invoices,
  });
});
exports.restoreInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findOne({
    _id: id,
    company: req.user.company._id,
    isDeleted: true,
  }).populate("client", "name");

  if (!invoice) {
    return next(new AppError("Invoice not found in trash", 404));
  }

  invoice.isDeleted = false;
  invoice.deletedAt = null;
  await invoice.save();

  await Notification.create({
    company: req.user.company._id,
    title: "Invoice Restored",
    message: `${invoice.client.name} invoice restored`,
    type: "invoice",
  });

  res.status(200).json({
    success: true,
    message: "Invoice restored successfully",
  });
});
exports.permanentDeleteInvoice = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const invoice = await Invoice.findOneAndDelete({
    _id: id,
    company: req.user.company._id,
    isDeleted: true,
  });

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Invoice permanently deleted",
  });
});