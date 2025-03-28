import Project from "../models/Project.js";

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

export const createProject = async (req, res) => {
    try {
        const { title, description, owner } = req.body;
        const project = new Project({ title, description, owner });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: "Failed to create project" });
    }
};
