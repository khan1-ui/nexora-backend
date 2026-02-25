const { body } = require("express-validator");

exports.invoiceValidation = [
  body("client")
    .notEmpty()
    .withMessage("Client ID is required"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Invoice must contain at least one item"),

  body("items.*.description")
    .notEmpty()
    .withMessage("Item description required"),

  body("items.*.quantity")
    .isNumeric()
    .withMessage("Quantity must be numeric"),

  body("items.*.price")
    .isNumeric()
    .withMessage("Price must be numeric"),
];
