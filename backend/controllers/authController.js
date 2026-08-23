const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= GENERATE TOKEN =================

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

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create new user
    // Every new user will wait for admin approval
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,

      role: "user",

      // New user is pending by default
      isApproved: false,
      rejected: false,

      hasVoted: false,
    });

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please wait for admin approval.",

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
    console.log("Register Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ================= USER APPROVAL CHECK =================

    // Admin can login directly
    if (user.role !== "admin") {

      // If admin rejected user
      if (user.rejected === true) {
        return res.status(403).json({
          success: false,
          status: "rejected",
          message:
            "Your account request has been rejected by the admin.",
        });
      }

      // If user is waiting for admin approval
      if (user.isApproved !== true) {
        return res.status(403).json({
          success: false,
          status: "pending",
          message:
            "Your account is waiting for admin approval. Please wait.",
        });
      }
    }

    // ================= LOGIN SUCCESS =================

    // Generate token only for admin or approved user
    const token = generateToken(
      user._id,
      user.role
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

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
    console.log("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};