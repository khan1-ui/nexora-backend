const express =require("express");
const { upload } =require("../middlewares/upload.middleware.js");
const { extractInvoiceData } =require("../services/ai.service.js");
const protect =require("../middlewares/auth.middleware.js");
const authorizeRoles = require("../middlewares/role.middleware");

const { aiAssistant } = require("../controllers/aiAssistant.controller");

const router = express.Router();

router.post(
  "/invoice-ocr",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const result = await extractInvoiceData(req.file.path);

      res.status(200).json({
        success: true,
        data: JSON.parse(result),
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "AI extraction failed",
      });
    }
  }
);
/**
 * AI Assistant Route
 * POST /api/ai/assistant
 */
router.post(
  "/assistant",
  protect,
  authorizeRoles("owner", "manager"),
  aiAssistant
);
module.exports = router;
