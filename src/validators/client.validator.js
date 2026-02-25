const { body } = require("express-validator");

exports.clientValidation = [
  body("name")
    .notEmpty()
    .withMessage("Client name is required"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email required"),

  body("phone")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Phone number too short"),
];
