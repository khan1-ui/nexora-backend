/**
 * Nexora SaaS
 * Express App Configuration
 */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require("./routes/client.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const expenseRoutes = require("./routes/expense.routes");
const reportRoutes =require("./routes/report.routes.js");
const dashboardRoutes = require("./routes/dashboard.routes");
const notificationRoutes =require("./routes/notification.routes.js");
const settingsRoutes =require( "./routes/settings.routes.js");
const aiRoutes =require("./routes/ai.routes.js");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

/**
 * Middlewares
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight
app.use(express.json());


/**
 * Routes
 */
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

/**
 * Health Check Route
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nexora API Running",
  });
});
// Global Error Handler (Must be last middleware)
app.use(errorHandler);
module.exports = app;
