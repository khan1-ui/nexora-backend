import mongoose from "mongoose";
import Invoice from "../models/invoice.model.js";
import Expense from "../models/expense.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getFinancialReport = asyncHandler(async (req, res) => {
  const companyId = new mongoose.Types.ObjectId(req.user.company._id);
  const { from, to } = req.query;

  const dateFilter = {};

  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) dateFilter.createdAt.$lte = new Date(to);
  }

  /* ================= TOTAL REVENUE ================= */
  const totalRevenueAgg = await Invoice.aggregate([
    {
      $match: {
        company: companyId,
        status: "paid",
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  /* ================= TOTAL EXPENSE ================= */
  const totalExpenseAgg = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        isDeleted: false,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  /* ================= MONTHLY BREAKDOWN ================= */
  const monthlyRevenue = await Invoice.aggregate([
    {
      $match: {
        company: companyId,
        status: "paid",
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        company: companyId,
        isDeleted: false,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        expenses: { $sum: "$amount" },
      },
    },
  ]);

  /* ================= MERGE MONTHLY ================= */
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const monthly = months.map((month, index) => {
    const revenueData = monthlyRevenue.find(
      (r) => r._id === index + 1
    );
    const expenseData = monthlyExpenses.find(
      (e) => e._id === index + 1
    );

    return {
      month,
      revenue: revenueData?.revenue || 0,
      expenses: expenseData?.expenses || 0,
    };
  });

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const totalExpenses = totalExpenseAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      monthly,
    },
  });
});