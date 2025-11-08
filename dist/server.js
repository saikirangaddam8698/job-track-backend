"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const allRoutes_1 = __importDefault(require("./routes/allRoutes"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions)); // ⬅️ Apply the specific configuration
app.use(express_1.default.json());
// File serving setup (for profile pictures and other uploads)
// Note: This still relies on the ephemeral file system, which we will fix next with S3.
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use(allRoutes_1.default);
// Ensure upload directories exist (essential for Multer)
const resumeDir = path_1.default.join(__dirname, "../uploads/resume");
const pictureDir = path_1.default.join(__dirname, "../uploads/picture");
const profileDir = path_1.default.join(__dirname, "../uploads/profilePicture");
if (!fs_1.default.existsSync(resumeDir))
    fs_1.default.mkdirSync(resumeDir, { recursive: true });
if (!fs_1.default.existsSync(pictureDir))
    fs_1.default.mkdirSync(pictureDir, { recursive: true });
if (!fs_1.default.existsSync(profileDir))
    fs_1.default.mkdirSync(profileDir, { recursive: true });
// Static routes for serving files from specific directories
app.use("/uploads/resume", express_1.default.static(resumeDir));
app.use("/uploads/picture", express_1.default.static(pictureDir));
app.use("/uploads/profilePicture", express_1.default.static(profileDir));
// Connect MongoDB
(0, db_1.connectDB)();
// Test route
app.get("/", (req, res) => {
    res.send("Job Tracker API is running...");
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
