// ============================================================
//  models/User.js
//  MongoDB Schema using Mongoose ORM
//  Module 8: MongoDB — Create and Manage MongoDB
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── MongoDB Document Schema ──
// This defines the structure of every User document in MongoDB
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,           // MongoDB unique index
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    // Arrays of strings — MongoDB supports arrays natively
    teachSkills: {
      type: [String],
      default: [],
    },

    learnSkills: {
      type: [String],
      default: [],
    },

    // Profile color and initials for UI
    color: {
      type: String,
      default: "#4f46e5",
    },

    initials: {
      type: String,
      default: "",
    },
  },
  {
    // Mongoose option: automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ── Mongoose Middleware (Pre-save Hook) ──
// Automatically hash password before saving to MongoDB
UserSchema.pre("save", async function (next) {
  // Only hash if password was modified (new user or password change)
  if (!this.isModified("password")) return next();

  // bcrypt: hash the password with salt rounds = 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Mongoose Instance Method ──
// Compare entered password with hashed password in MongoDB
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model — MongoDB collection will be named "users"
module.exports = mongoose.model("User", UserSchema);