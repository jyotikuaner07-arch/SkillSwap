// ============================================================
//  routes/auth.js
//  Authentication Routes — Node.js + Express
//  POST /api/auth/signup  → Register new user in MongoDB
//  POST /api/auth/login   → Login and get JWT token
// ============================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ── Helper: Generate JWT Token ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ── Helper: Avatar color and initials ──
const COLORS = ["#4f46e5","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899"];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const getInitials = (name) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);


// ────────────────────────────────────────────
//  POST /api/auth/signup
//  Register a new user → saves to MongoDB
// ────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, department, password } = req.body;

    // Validate required fields
    if (!name || !email || !department || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if email already exists in MongoDB
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new MongoDB document
    // Password is automatically hashed by the pre-save hook in User.js
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      department,
      password,
      teachSkills: [],
      learnSkills: [],
      color: randomColor(),
      initials: getInitials(name),
    });

    // Return user data + JWT token
    res.status(201).json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      department: user.department,
      teachSkills: user.teachSkills,
      learnSkills: user.learnSkills,
      color:      user.color,
      initials:   user.initials,
      token:      generateToken(user._id),
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});


// ────────────────────────────────────────────
//  POST /api/auth/login
//  Login user → verify against MongoDB
// ────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find user in MongoDB by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if user exists AND password matches (using bcrypt compare)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user data + new JWT token
    res.json({
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      department: user.department,
      teachSkills: user.teachSkills,
      learnSkills: user.learnSkills,
      color:      user.color,
      initials:   user.initials,
      token:      generateToken(user._id),
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
});


module.exports = router;