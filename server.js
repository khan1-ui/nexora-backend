/**
 * Main Server Entry
 * Nexora SaaS - Production Ready Server
 * Includes:
 * - MongoDB Connection
 * - Socket.io Real-time Support
 * - Graceful Shutdown
 * - Environment Handling
 */

const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app =require("./src/app.js");
const connectDB = require("./src/config/db.js");

dotenv.config();

/**
 * Connect Database
 */
connectDB();

/**
 * Create HTTP Server
 */
const server = http.createServer(app);

/**
 * Initialize Socket.io
 */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

/**
 * Socket Connection Handling
 */
io.on("connection", (socket) => {
  // Join company-specific room
  socket.on("joinCompany", (companyId) => {
    socket.join(companyId);
     });

  socket.on("disconnect", () => {
  });
});

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/**
 * Graceful Shutdown
 */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});
