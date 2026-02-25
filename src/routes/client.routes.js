const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { clientValidation } = require("../validators/client.validator");

const {
  createClient,
  getClients,
  updateClient,
  deleteClient,
  getSingleClient,
} = require("../controllers/client.controller");

/**
 * ===============================
 * CLIENT ROUTES (Enterprise SaaS)
 * ===============================
 */

/**
 * Create Client
 */
router.post(
  "/",
  protect,
  authorizeRoles("owner", "manager"),
  clientValidation,
  validate,
  createClient
);

/**
 * Get All Clients (Paginated)
 */
router.get("/", protect, getClients);

/**
 * Get Single Client
 */
router.get("/:id", protect, getSingleClient);

/**
 * Update Client
 */
router.patch(
  "/:id",
  protect,
  authorizeRoles("owner", "manager"),
  clientValidation,
  validate,
  updateClient
);

/**
 * Delete Client
 */
router.delete(
  "/:id",
  protect,
  authorizeRoles("owner", "manager"),
  deleteClient
);

module.exports = router;