const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { invoiceValidation } = require("../validators/invoice.validator");

const {
  createInvoice,
  getInvoices,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getTrashedInvoices,
  restoreInvoice,
  permanentDeleteInvoice
} = require("../controllers/invoice.controller");

/**
 * Routes
 */
router.post(
  "/",
  protect,
  authorizeRoles("owner", "manager"),
  invoiceValidation,
  validate,
  createInvoice
);
router.get("/", protect, getInvoices);
router.patch("/:id", protect, updateInvoice);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("owner", "manager"),
  updateInvoiceStatus
);
router.delete("/:id",protect, deleteInvoice);
router.get("/trash", protect, getTrashedInvoices);
router.patch("/:id/restore", protect, restoreInvoice);
router.delete("/:id/permanent", protect, permanentDeleteInvoice);
module.exports = router;
