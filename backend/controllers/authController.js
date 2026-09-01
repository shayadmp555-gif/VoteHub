const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= TOKEN =================

const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ================= REGISTER =================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Required fields
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    // Only allowed roles
    const selectedRole =
      role === "candidate"
        ? "candidate"
        : "user";

    // Check existing user
    const existingUser =
      await User.findOne({
        email: email.toLowerCase().trim(),
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),

      email: email
        .toLowerCase()
        .trim(),

      password: hashedPassword,

      role: selectedRole,

      // IMPORTANT
      // New users always need admin approval
      isApproved: false,

      rejected: false,

      hasVoted: false,
    });

    return res.status(201).json({
      message:
        selectedRole === "candidate"
          ? "Candidate registration submitted. Waiting for admin approval."
          : "Voter registration submitted. Waiting for admin approval.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });

  } catch (error) {

    console.log(
      "Register Error:",
      error
    );

    return res.status(500).json({
      message:
        "Registration failed.",
      error: error.message,
    });
  }
};

// ================= LOGIN =================

const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const user =
      await User.findOne({
        email: email
          .toLowerCase()
          .trim(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // Check password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // ================= REJECTED =================

    if (
      user.role !== "admin" &&
      user.rejected === true
    ) {
      return res.status(403).json({
        status: "rejected",
        message:
          "Your account has been rejected by admin.",
      });
    }

    // ================= PENDING =================

    if (
      user.role !== "admin" &&
      user.isApproved !== true
    ) {
      return res.status(403).json({
        status: "pending",
        message:
          user.role === "candidate"
            ? "Your candidate account is waiting for admin approval."
            : "Your voter account is waiting for admin approval.",
      });
    }

    // ================= TOKEN =================

    const token =
      generateToken(
        user._id,
        user.role
      );

    return res.json({
      message:
        "Login successful.",

      token,

      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        rejected: user.rejected,
        hasVoted: user.hasVoted,
      },
    });

  } catch (error) {

    console.log(
      "Login Error:",
      error
    );

    return res.status(500).json({
      message:
        "Login failed.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  generateToken,
};