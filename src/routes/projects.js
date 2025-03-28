// src/routes/projects.js
import express from "express";
import Project from "../models/Project.js";
import { logMessage, LOG_LEVELS } from "../utils/logger.js";

const router = express.Router();

// Generate Random Project ID
const generateProjectID = () => Math.random().toString(36).substr(2, 9);

// Create a new project
router.post("/", async (req, res) => {
    const { name } = req.body;
    const projectID = generateProjectID();

    try {
        const newProject = new Project({ name, projectID });
        await newProject.save();
        logMessage(LOG_LEVELS.info, `Project created: ${name}`, "projects.js", "POST");
        res.status(201).json({ message: "Project created", projectID });
    } catch (err) {
        logMessage(LOG_LEVELS.error, `Project creation failed: ${err.message}`, "projects.js", "POST");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all projects
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (err) {
        logMessage(LOG_LEVELS.error, `Failed to fetch projects: ${err.message}`, "projects.js", "GET");
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
