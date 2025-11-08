import jwt from "jsonwebtoken";

// ------------------- Protect Routes -------------------
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Decoded JWT:", decoded);
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("🔒 Auth error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired. Please log in again." });
    }

    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// ------------------- Admin-Only Access -------------------
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized: No user info found" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Forbidden: Admin access required" });
  }

  next();
};
