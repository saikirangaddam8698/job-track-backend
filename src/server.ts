import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import { connectDB } from "./config/db";
import routes from "./routes/allRoutes";
import path from "path";
import fs from "fs";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(routes);

const resumeDir = path.join(__dirname, "../../uploads/resume");
const pictureDir = path.join(__dirname, "../../uploads/picture");

if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });
if (!fs.existsSync(pictureDir)) fs.mkdirSync(pictureDir, { recursive: true });

app.use("/uploads/resume", express.static(resumeDir));
app.use("/uploads/picture", express.static(pictureDir));


// Connect MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Job Tracker API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
