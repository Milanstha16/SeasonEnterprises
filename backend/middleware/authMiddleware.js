import jwt from "jsonwebtoken";

// Define an interface for the user object attached to req
// interface User {
//   id: string;
//   role: string;
// }

const authMiddleware = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user data to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;
