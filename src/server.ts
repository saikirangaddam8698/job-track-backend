// server.ts

import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./config/db";
import routes from "./routes/allRoutes";
import path from "path";
import fs from "fs";

const app = express();

// 🟢 CORS Configuration Fix
const allowedOrigins = [
  "http://localhost:5000", // Allow local backend testing
  "http://localhost:5173", // Allow local frontend testing (Vite default)
  "https://myjobtracker-projects.vercel.app", // ⬅️ CRITICAL: Your Vercel frontend URL
];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow all necessary methods
  credentials: true, // Important for cookies/auth headers
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions)); // ⬅️ Apply the specific configuration
app.use(express.json());

// File serving setup (for profile pictures and other uploads)
// Note: This still relies on the ephemeral file system, which we will fix next with S3.
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(routes);

// Ensure upload directories exist (essential for Multer)
const resumeDir = path.join(__dirname, "../uploads/resume");
const pictureDir = path.join(__dirname, "../uploads/picture");
const profileDir = path.join(__dirname, "../uploads/profilePicture");

if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
if (!fs.existsSync(pictureDir)) fs.mkdirSync(pictureDir, { recursive: true });
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

// Static routes for serving files from specific directories
app.use("/uploads/resume", express.static(resumeDir));
app.use("/uploads/picture", express.static(pictureDir));
app.use("/uploads/profilePicture", express.static(profileDir));

// Connect MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Job Tracker API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
