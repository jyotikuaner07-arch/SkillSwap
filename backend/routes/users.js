// ============================================================
//  routes/users.js
//  User Routes — Node.js + Express
//  GET  /api/users          → Get all users from MongoDB
//  GET  /api/users/me       → Get current logged-in user
//  PUT  /api/users/skills   → Update teach/learn skills in MongoDB
//  GET  /api/users/matches  → Get skill matches for current user
// ============================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// ── JWT Auth Middleware ──
// Protects routes — checks JWT token before allowing access
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify the JWT token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user from MongoDB to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};


// ────────────────────────────────────────────
//  GET /api/users
//  Fetch ALL users from MongoDB (for Browse page)
// ────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // MongoDB query: find all users, exclude passwords
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


// ────────────────────────────────────────────
//  GET /api/users/me
//  Get current logged-in user's profile
// ────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});


// ────────────────────────────────────────────
//  PUT /api/users/skills
//  Update user's teachSkills or learnSkills in MongoDB
// ────────────────────────────────────────────
router.put("/skills", protect, async (req, res) => {
  try {
    const { type, skill, action } = req.body;
    // type   = "teach" or "learn"
    // skill  = the skill name e.g. "Python"
    // action = "add" or "remove"

    if (!type || !skill || !action) {
      return res.status(400).json({ message: "type, skill, and action are required" });
    }

    const field = type === "teach" ? "teachSkills" : "learnSkills";

    let updatedUser;

    if (action === "add") {
      // MongoDB $addToSet — adds skill only if it doesn't already exist
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { [field]: skill } },
        { new: true }           // return the updated document
      ).select("-password");

    } else if (action === "remove") {
      // MongoDB $pull — removes the skill from the array
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { [field]: skill } },
        { new: true }
      ).select("-password");

    } else {
      return res.status(400).json({ message: "action must be 'add' or 'remove'" });
    }

    res.json(updatedUser);

  } catch (err) {
    console.error("Skills update error:", err.message);
    res.status(500).json({ message: "Failed to update skills" });
  }
});


// ────────────────────────────────────────────
//  GET /api/users/matches
//  Find skill matches for the current user
//  Algorithm: my learnSkills ∩ others' teachSkills
// ────────────────────────────────────────────
router.get("/matches", protect, async (req, res) => {
  try {
    const currentUser = req.user;

    // MongoDB query: get all users except current user
    const allUsers = await User.find({
      _id: { $ne: currentUser._id }  // $ne = "not equal"
    }).select("-password");

    // JavaScript matching algorithm
    const matches = allUsers
      .map((other) => {
        // Skills this person can teach that I want to learn
        const theyCanTeachMe = currentUser.learnSkills.filter((s) =>
          other.teachSkills.map(t => t.toLowerCase()).includes(s.toLowerCase())
        );
        // Skills I can teach that this person wants to learn
        const iCanTeachThem = currentUser.teachSkills.filter((s) =>
          other.learnSkills.map(l => l.toLowerCase()).includes(s.toLowerCase())
        );

        return {
          user: other,
          theyCanTeachMe,
          iCanTeachThem,
          score: theyCanTeachMe.length + iCanTeachThem.length,
        };
      })
      .filter((m) => m.score > 0)       // only return actual matches
      .sort((a, b) => b.score - a.score); // highest score first

    res.json(matches);

  } catch (err) {
    console.error("Matches error:", err.message);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
});


module.exports = router;