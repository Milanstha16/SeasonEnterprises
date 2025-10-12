import jwt from "jsonwebtoken";

// ✅ Middleware: Verify JWT & attach user info to req.user
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided, authorization denied" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];

    // Verify and decode the token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decoded); // Logging decoded JWT for debugging purposes

    req.user = decoded; // { id, role } - attach decoded payload to req.user
    next();
  } catch (err) {
    console.error("🔒 Auth error:", err.message);

    // Check if the error is due to expiration
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired. Please log in again." });
    }

    // Handle any other JWT errors (e.g., invalid signature)
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
