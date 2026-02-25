const { body } = require("express-validator");

exports.expenseValidation = [
  body("title")
    .notEmpty()
    .withMessage("Expense title is required"),

  body("amount")
    .isNumeric()
    .withMessage("Amount must be numeric"),
];
