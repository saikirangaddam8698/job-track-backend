"use strict";
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
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use(allRoutes_1.default);
const resumeDir = path_1.default.join(__dirname, "../uploads/resume");
const pictureDir = path_1.default.join(__dirname, "../uploads/picture");
const profileDir = path_1.default.join(__dirname, "../uploads/profilePicture");
if (!fs_1.default.existsSync(resumeDir))
    fs_1.default.mkdirSync(resumeDir, { recursive: true });
if (!fs_1.default.existsSync(pictureDir))
    fs_1.default.mkdirSync(pictureDir, { recursive: true });
if (!fs_1.default.existsSync(profileDir))
    fs_1.default.mkdirSync(profileDir, { recursive: true });
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
