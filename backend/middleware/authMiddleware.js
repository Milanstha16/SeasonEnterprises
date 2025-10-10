// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// ✅ Middleware: Verify JWT & attach user info to req.user
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("🔒 Auth error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// ✅ Middleware: Admin-only access
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized: No user info found" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden: Admin access required" });
  }

  next();
};
