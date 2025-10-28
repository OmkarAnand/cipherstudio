import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

// ✅ Save project
router.post("/save", async (req, res) => {
  try {
    const { projectId, name, files } = req.body;

    let project = await Project.findOne({ projectId });

    if (project) {
      // Update existing project
      project.name = name;
      project.files = files;
      await project.save();
      return res.status(200).json({ message: "Project updated successfully" });
    } else {
      // Create new project
      const newProject = new Project({ projectId, name, files });
      await newProject.save();
      return res.status(201).json({ message: "Project saved successfully" });
    }
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ message: "Error saving project" });
  }
});

// ✅ Load project
router.get("/load/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ projectId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error loading project:", error);
    res.status(500).json({ message: "Error loading project" });
  }
});

export default router;
