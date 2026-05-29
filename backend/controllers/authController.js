import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Otp from "../models/OtpModel.js";
import generateToken from "../utils/generateToken.js";
import {
  sendWelcomeEmail,
  sendOtpEmail,
  sendResetSuccessEmail,
} from "../services/notificationService.js";
import {
  normalizeEmail,
  isValidEmail,
  validatePassword,
} from "../utils/authValidation.js";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || name.trim().length < 2) {
    return res.status(400).json({ message: "Name is required (min 2 characters)" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const normalizedEmail = normalizeEmail(email);
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const allowedRoles = ["student", "proctor"];
  const selectedRole = allowedRoles.includes(role)
    ? role
    : "student";

  const autoApproveStudents =
    process.env.AUTO_APPROVE_STUDENTS === "true" ||
    process.env.NODE_ENV !== "production";

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: selectedRole,
    approved: selectedRole === "proctor" || autoApproveStudents,
  });

  if (user) {
    await sendWelcomeEmail(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      token: generateToken(user._id),
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  if (!password || String(password).length < 1) {
    return res.status(400).json({ message: "Password is required" });
  }

  const user = await User.findOne({ email: normalizeEmail(email) });

  if (user && (await user.matchPassword(password))) {
    if (
      (user.role === "proctor" || user.role === "admin") &&
      !user.approved
    ) {
      user.approved = true;
      await user.save();
    }

    if (
      user.role === "student" &&
      !user.approved &&
      process.env.AUTO_APPROVE_STUDENTS === "true"
    ) {
      user.approved = true;
      await user.save();
    }

    await applyBootstrapAdmin(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      profileImage: user.profileImage,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({
      message: "Invalid email or password",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" ? {} : { role: "student" };
    const users = await User.find(filter).select(
      "name email role approved createdAt"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyBootstrapAdmin = async (user) => {
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (
    bootstrapEmail &&
    user.email?.toLowerCase() === bootstrapEmail
  ) {
    user.role = "admin";
    user.approved = true;
    await user.save();
  }
};

export const approveUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.approved = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    approved: req.user.approved,
    profileImage: req.user.profileImage || null,
    preferredLanguage: req.user.preferredLanguage,
    theme: req.user.theme,
  });
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = ["student", "proctor", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({
        message: "If the account exists, a verification code was sent.",
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail(user, otp);

    res.json({
      message: "If the account exists, a verification code was sent.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ message: "Too many failed attempts. Request a new OTP." });
    }

    const hashed = crypto.createHash("sha256").update(otp.trim()).digest("hex");
    if (otpRecord.otpHash !== hashed) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Generate a secure, short-lived JWT password reset token
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await Otp.deleteOne({ email: normalizedEmail });

    res.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid token usage" });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    await sendResetSuccessEmail(user);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { profileImage, preferredLanguage, theme } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (profileImage !== undefined) {
      if (profileImage === null || profileImage === "") {
        user.profileImage = undefined;
      } else if (typeof profileImage === "string") {
        if (profileImage.length > 3_000_000) {
          return res.status(400).json({
            message: "Image too large. Please use a smaller photo.",
          });
        }
        user.profileImage = profileImage;
      }
    }

    if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage;
    }

    if (theme && ["light", "dark"].includes(theme)) {
      user.theme = theme;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      profileImage: user.profileImage || null,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({
      message: error.message || "Failed to save profile",
    });
  }
};
