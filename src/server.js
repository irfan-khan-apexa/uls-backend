// src/server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import config from "./config/config.js";
import { logger, logMessage, LOG_LEVELS } from "./utils/logger.js";
import projectRoutes from "./routes/projects.js";
import logRoutes from "./routes/logs.js";
import authRoutes from "./routes/auth.js";


// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    // .then(() => logMessage(LOG_LEVELS.info, "MongoDB Connected", "server.js", "DB Connection"))
    .then(() => console.log("DB Connection"))
    .catch((err) => logMessage(LOG_LEVELS.error, `MongoDB Connection Error: ${err.message}`, "server.js", "DB Connection"));


// Routes
app.use("/projects", projectRoutes);
app.use("/logs", logRoutes);
app.use("/auth", authRoutes);

// Start Server
// app.listen(config.port, () => logger.info(`Server running on port ${config.port}`, { file: "server.js", method: "Startup" }));
app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
