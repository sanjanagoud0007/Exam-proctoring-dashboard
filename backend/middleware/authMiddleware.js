import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await User.findById(decoded.id).select(
        "-password"
      );

      const isProfileRoute =
        req.path === "/profile" ||
        req.originalUrl?.includes("/auth/profile");

      // Only students need admin approval; proctors/admins can use the platform immediately
      const studentPendingApproval =
        req.user?.role === "student" && !req.user.approved;

      if (studentPendingApproval && !isProfileRoute) {
        return res.status(403).json({
          message: "Account pending admin approval",
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
  }

  return res.status(401).json({
    message: "No token",
  });
};

export const protectAdmin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase?.() || req.user?.role;
  if (req.user && role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Require admin role" });
};

export const protectProctor = (req, res, next) => {
  const role = req.user?.role?.toLowerCase?.() || req.user?.role;
  if (req.user && role === "proctor") {
    return next();
  }
  return res.status(403).json({ message: "Require proctor role" });
};

export const protectAdminOrProctor = (req, res, next) => {
  const role = req.user?.role?.toLowerCase?.() || req.user?.role;

  if (req.user && (role === "admin" || role === "proctor")) {
    return next();
  }

  return res.status(403).json({
    message: `Require admin or proctor role (current: ${req.user?.role || "none"})`,
  });
};