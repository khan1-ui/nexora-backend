/**
 * Client Controller
 * Handles CRUD operations for company-specific clients
 */

const Client = require("../models/client.model");

/**
 * Create Client
 * @route POST /api/clients
 * @access Private (Owner, Manager)
 */
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      company: req.user.company._id, // 🔐 Tenant Isolation
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Client creation failed",
      error: error.message,
    });
  }
};

/**
 * Get All Clients (Company Specific)
 * @route GET /api/clients
 * @access Private
 */
exports.getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, search = "", sort = "name", order = "asc" } =
      req.query;

    const query = {
      company: req.user.company,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;

    const clients = await Client.find(query)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: clients,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getSingleClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!client)
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });

    res.json({
      success: true,
      data: client,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.company,
      },
      req.body,
      { new: true }
    );

    if (!client)
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });

    res.json({
      success: true,
      data: client,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!client)
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};