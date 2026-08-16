import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach the logged-in user (without password) to the request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

export default protect;
