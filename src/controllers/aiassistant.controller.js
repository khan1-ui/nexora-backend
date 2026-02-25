const Invoice = require("../models/invoice.model");
const Expense = require("../models/expense.model");
const OpenAI = require("openai");

/**
 * Generate fallback AI response (No billing required)
 */
function generateFallbackAnalysis(data) {
  const {
    currentRevenue,
    currentExpenses,
    currentProfit,
    growthRate,
    expenseRatio,
  } = data;

  return `
Nexora AI Assistant (Demo Mode)

Financial Summary:
• Revenue: ${currentRevenue}
• Expenses: ${currentExpenses}
• Profit: ${currentProfit}

Insights:
${
  currentProfit < 0
    ? "⚠ Your business is operating at a loss. Immediate cost optimization is recommended."
    : "✅ Your business is profitable this month."
}

${
  expenseRatio > 0.6
    ? "⚠ Expense ratio is high. Consider reducing operational costs."
    : "✔ Expense ratio is under control."
}

Growth Rate: ${(growthRate * 100).toFixed(2)}%

Note:
To enable real AI-powered analysis, configure your OpenAI API key in the .env file.
`;
}

exports.aiAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const companyId = req.user.company._id;
    const now = new Date();

    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // ================= DATABASE AGGREGATION =================

    const currentRevenueAgg = await Invoice.aggregate([
      {
        $match: {
          company: companyId,
          status: "paid",
          createdAt: { $gte: currentStart, $lte: currentEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const prevRevenueAgg = await Invoice.aggregate([
      {
        $match: {
          company: companyId,
          status: "paid",
          createdAt: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const currentExpenseAgg = await Expense.aggregate([
      {
        $match: {
          company: companyId,
          expenseDate: { $gte: currentStart, $lte: currentEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const currentRevenue = currentRevenueAgg[0]?.total || 0;
    const prevRevenue = prevRevenueAgg[0]?.total || 0;
    const currentExpenses = currentExpenseAgg[0]?.total || 0;

    const currentProfit = currentRevenue - currentExpenses;

    const growthRate =
      prevRevenue > 0
        ? (currentRevenue - prevRevenue) / prevRevenue
        : 0;

    const expenseRatio =
      currentRevenue > 0
        ? currentExpenses / currentRevenue
        : 0;

    const forecastRevenue =
      currentRevenue * (1 + growthRate);

    const financialData = {
      currentRevenue,
      currentExpenses,
      currentProfit,
      growthRate,
      expenseRatio,
      forecastRevenue,
    };

    // ================= IF NO API KEY → DEMO MODE =================

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        data: generateFallbackAnalysis(financialData),
      });
    }

    // ================= TRY REAL AI =================

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const context = `
Current Month Revenue: ${currentRevenue}
Previous Month Revenue: ${prevRevenue}
Current Month Expenses: ${currentExpenses}
Current Month Profit: ${currentProfit}
Revenue Growth Rate: ${growthRate}
Expense Ratio: ${expenseRatio}
Forecast Next Month Revenue: ${forecastRevenue}
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
You are an enterprise financial AI assistant.

Financial Data:
${context}

User Question:
${message}

Analyze deeply.
If profit is negative, warn clearly.
If expense ratio is high, suggest cost optimization.
Be professional and strategic.
`,
    });

    return res.json({
      success: true,
      data: response.output_text,
    });

  } catch (error) {
    console.error("Enterprise AI Error:", error.message);

    // ================= GRACEFUL FALLBACK =================

    return res.json({
      success: true,
      data: `
AI service is currently unavailable.

The assistant is running in demo mode.
To enable full AI functionality, configure billing in your OpenAI account.
`,
    });
  }
};