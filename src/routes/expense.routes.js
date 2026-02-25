const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const {
  createExpense,
  getExpenses,
  updateExpense,
  trashExpense,
  getTrashedExpenses,
  restoreExpense,
  permanentDeleteExpense,
} = require("../controllers/expense.controller");

/* ================= ACTIVE ================= */

router.post("/", protect, createExpense);
router.get("/", protect, getExpenses);

router.patch(
  "/:id",
  protect,
  authorizeRoles("owner", "manager"),
  updateExpense
);

/* ================= TRASH ================= */

router.patch(
  "/:id/trash",
  protect,
  authorizeRoles("owner", "manager"),
  trashExpense
);

router.get("/trash", protect, getTrashedExpenses);

router.patch(
  "/:id/restore",
  protect,
  authorizeRoles("owner", "manager"),
  restoreExpense
);

router.delete(
  "/:id/permanent",
  protect,
  authorizeRoles("owner", "manager"),
  permanentDeleteExpense
);

module.exports = router;