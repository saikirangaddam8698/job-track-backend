import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import { connectDB } from "./config/db";
import routes from "./routes/allRoutes";


const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Connect MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Job Tracker API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
