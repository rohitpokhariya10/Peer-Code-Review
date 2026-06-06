import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, please login first" });
    }

    //  verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get user from database and send in req.user
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next(); // if everything went right than carry forward to the very next thing in the controller
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired, please login again" });
  }
};