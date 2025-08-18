// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // JWT should contain { id, role }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;
