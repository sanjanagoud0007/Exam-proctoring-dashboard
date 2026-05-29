import User from "../models/UserModel.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const allowedRoles = ["student", "proctor", "admin"];
    const selectedRole = allowedRoles.includes(role) ? role : "student";

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
      approved: true,
    });

    res.status(201).json({
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

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await user.deleteOne();
    res.json({ message: "User deleted", _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.approved = false;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      approved: user.approved,
      message: "User access revoked",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listProctors = async (req, res) => {
  try {
    const proctors = await User.find({ role: "proctor" }).select("-password");
    res.json(proctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
