// backend/middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized: No user data found" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden: Admins only" });
  }

  // All good
  next();
};

export default adminMiddleware;
