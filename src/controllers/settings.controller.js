// controllers/settings.controller.js

import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

/* =========================================================
   GET SETTINGS
========================================================= */
export const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  const company = await Company.findById(req.user.company);

  res.status(200).json({
    success: true,
    data: {
      profile: user,
      company: company,
    },
  });
});

/* =========================================================
   UPDATE PROFILE
========================================================= */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name = req.body.name || user.name;

  if (req.body.password) {
    user.password = req.body.password; // hash middleware assumed
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

/* =========================================================
   UPDATE COMPANY
========================================================= */
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.company);

  company.name = req.body.name || company.name;
  company.email = req.body.email || company.email;

  await company.save();

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
  });
});