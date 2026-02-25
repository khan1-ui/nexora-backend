/**
 * Expense Controller (Enterprise SaaS Clean Version)
 */

const mongoose = require("mongoose");
const Expense = require("../models/expense.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

/* ======================================================
   CREATE
====================================================== */
exports.createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, expenseDate } = req.body;

  const expense = await Expense.create({
    title,
    amount,
    category,
    expenseDate,
    company: req.user.company._id,
  });

  res.status(201).json({
    success: true,
    data: expense,
  });
});

/* ======================================================
   GET ACTIVE
====================================================== */
exports.getExpenses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 5,
    search = "",
    sort = "expenseDate",
    order = "desc",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const query = {
    company: new mongoose.Types.ObjectId(req.user.company._id),
    isDeleted: false,
  };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;

  const expenses = await Expense.find(query)
    .sort({ [sort]: order === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limitNumber);

  const total = await Expense.countDocuments(query);

  res.status(200).json({
    success: true,
    data: expenses,
    meta: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/* ======================================================
   UPDATE
====================================================== */
exports.updateExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOneAndUpdate(
    {
      _id: req.params.id,
      company: req.user.company._id,
      isDeleted: false,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!expense) {
    return next(new AppError("Expense not found", 404));
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

/* ======================================================
   SOFT DELETE (TRASH)
====================================================== */
exports.trashExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    company: req.user.company._id,
    isDeleted: false,
  });

  if (!expense) {
    return next(new AppError("Expense not found", 404));
  }

  expense.isDeleted = true;
  expense.deletedAt = new Date();

  await expense.save();

  res.status(200).json({
    success: true,
    message: "Expense moved to trash",
  });
});

/* ======================================================
   GET TRASH
====================================================== */
exports.getTrashedExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({
    company: req.user.company._id,
    isDeleted: true,
  }).sort({ deletedAt: -1 });

  res.status(200).json({
    success: true,
    data: expenses,
  });
});

/* ======================================================
   RESTORE
====================================================== */
exports.restoreExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    company: req.user.company._id,
    isDeleted: true,
  });

  if (!expense) {
    return next(new AppError("Expense not found in trash", 404));
  }

  expense.isDeleted = false;
  expense.deletedAt = null;

  await expense.save();

  res.status(200).json({
    success: true,
    message: "Expense restored successfully",
  });
});

/* ======================================================
   PERMANENT DELETE
====================================================== */
exports.permanentDeleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company._id,
    isDeleted: true,
  });

  if (!expense) {
    return next(new AppError("Expense not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Expense permanently deleted",
  });
});