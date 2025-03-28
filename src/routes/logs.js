// src/routes/logs.js
import express from "express";
import mongoose from "mongoose";
import { logMessage, LOG_LEVELS } from "../utils/logger.js";

const router = express.Router();

// Store logs
router.post("/", async (req, res) => {
    const { projectID, message, level } = req.body;

    if (!projectID || !message) {
        logMessage(LOG_LEVELS.warn, "Missing required fields", "logs.js", "POST");
        return res.status(400).json({ error: "Project ID and message are required" });
    }

    try {
        const logEntry = {
            projectID,
            message,
            level: level || LOG_LEVELS.info, // Default level is 'info'
            timestamp: new Date(),
        };

        const result = await mongoose.connection.db.collection("logs").insertOne(logEntry);

        if (!result.acknowledged) {
            throw new Error("Failed to insert log");
        }

        logMessage(LOG_LEVELS.info, `Log saved for Project ID: ${projectID}`, "logs.js", "POST");
        res.status(201).json({ message: "Log saved successfully", log: logEntry });
    } catch (error) {
        logMessage(LOG_LEVELS.error, `Error saving log: ${error.message}`, "logs.js", "POST");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get logs by project ID
router.get("/:projectID", async (req, res) => {
    const { projectID } = req.params;

    try {
        const logs = await mongoose.connection.db
            .collection("logs")
            .find({ "metadata.projectID": projectID }) // Corrected field name
            .toArray();

        if (!logs.length) {
            return res.status(404).json({ message: "No logs found for this project" });
        }

        res.status(200).json(logs);
    } catch (error) {
        logMessage(LOG_LEVELS.error, `Error fetching logs: ${error.message}`, "logs.js", "GET");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
