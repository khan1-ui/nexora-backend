const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model.js");
const Expense =require("../models/expense.model.js");
const Client = require("../models/client.model.js");

/**
 * @desc    Get Dashboard Stats
 * @route   GET /api/dashboard
 * @access  Private (Tenant Based)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.company);

    /* ================= TOTAL REVENUE ================= */
    const totalRevenueAgg = await Invoice.aggregate([
      { $match: { company: companyId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    /* ================= UNPAID ================= */
    const unpaidAgg = await Invoice.aggregate([
      { $match: { company: companyId, status: "unpaid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const unpaidInvoices = {
      total: unpaidAgg[0]?.total || 0,
      count: unpaidAgg[0]?.count || 0,
    };

    /* ================= OVERDUE ================= */
    const overdueAgg = await Invoice.aggregate([
      { $match: { company: companyId, status: "overdue" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const overdueInvoices = {
      total: overdueAgg[0]?.total || 0,
      count: overdueAgg[0]?.count || 0,
    };

    /* ================= MONTHLY REVENUE ================= */
    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          company: companyId,
          status: "paid",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    /* ================= MONTHLY EXPENSES ================= */
    const monthlyExpenses = await Expense.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    /* ================= NET PROFIT ================= */
    const totalExpenseAgg = await Expense.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenses = totalExpenseAgg[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;

    /* ================= OUTSTANDING ================= */
    const outstandingInvoices = await Invoice.find({
      company: companyId,
      status: { $in: ["unpaid", "overdue"] },
    })
      .populate("client", "name")
      .sort({ dueDate: 1 })
      .limit(5);

    /* ================= LATEST EXPENSES ================= */
    const latestExpenses = await Expense.find({
      company: companyId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    /* ================= RECENT CLIENTS ================= */
    const recentClients = await Client.find({
      company: companyId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      data: {
        totalRevenue,
        unpaidInvoices,
        overdueInvoices,
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        outstandingInvoices,
        latestExpenses,
        recentClients,
        revenueGrowth: 8.2, // optional dummy for now
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};