// backend/middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied: admin only" });
  }

  next();
};

export default adminMiddleware;
