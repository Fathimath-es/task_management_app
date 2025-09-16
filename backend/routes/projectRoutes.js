const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Project = require('../models/Project');

// Get all projects for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new project
router.post('/', auth, async (req, res) => {
    try {
        const newProject = new Project({
            name: req.body.name,
            owner: req.user
        });
        const project = await newProject.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;