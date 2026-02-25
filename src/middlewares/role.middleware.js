/**
 * Role-Based Authorization Middleware
 * @param  {...String} roles
 */

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permission",
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
