// ============================================================
//  server.js — Main Node.js + Express Server
//  Module 7: Backend with Node.js
//  Module 8: MongoDB with Node.js
//
//  To run:
//    npm install
//    npm run dev    (development with auto-reload)
//    npm start      (production)
// ============================================================

const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const dotenv    = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// ── Import Routes ──
const authRoutes  = require("./routes/auth");
const userRoutes  = require("./routes/users");

// ── Create Express App ──
const app = express();


// ════════════════════════════════════════════
//  MIDDLEWARE
//  (Functions that run before route handlers)
// ════════════════════════════════════════════

// Parse incoming JSON request bodies
app.use(express.json());

// CORS — Allow React frontend (port 3000) to call this server (port 5000)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));


// ════════════════════════════════════════════
//  MONGODB CONNECTION
//  Connects to MongoDB using Mongoose
// ════════════════════════════════════════════
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1); // Exit process if DB connection fails
  }
};


// ════════════════════════════════════════════
//  API ROUTES
//  All routes are prefixed with /api/
// ════════════════════════════════════════════

// Auth routes  → /api/auth/signup  and  /api/auth/login
app.use("/api/auth", authRoutes);

// User routes  → /api/users  and  /api/users/skills  and  /api/users/matches
app.use("/api/users", userRoutes);

// Health check route — test if server is running
app.get("/api/health", (req, res) => {
  res.json({
    status:   "OK",
    message:  "SkillSwap API is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});


// ════════════════════════════════════════════
//  START SERVER
// ════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();   // Connect to MongoDB first
  app.listen(PORT, () => {
    console.log(`🚀 SkillSwap Server running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST  /api/auth/signup`);
    console.log(`   POST  /api/auth/login`);
    console.log(`   GET   /api/users`);
    console.log(`   GET   /api/users/me`);
    console.log(`   PUT   /api/users/skills`);
    console.log(`   GET   /api/users/matches`);
  });
};

startServer();