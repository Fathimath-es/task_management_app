const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Get all tasks for a specific project
router.get('/:projectId', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project || project.owner.toString() !== req.user) {
            return res.status(404).json({ msg: 'Project not found or you do not have access' });
        }
        const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', 'username');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, status, assignee, dueDate, projectId } = req.body;
        
        // Ensure the project belongs to the user
        const project = await Project.findById(projectId);
        if (!project || project.owner.toString() !== req.user) {
            return res.status(401).json({ msg: 'You do not have permission to add a task to this project' });
        }

        const newTask = new Task({ title, description, status, assignee, dueDate, project: projectId });
        const task = await newTask.save();
        
        // Get full task object including populated assignee
        const populatedTask = await Task.findById(task._id).populate('assignee', 'username');

        // Emit real-time update
        req.app.get('io').emit('taskCreate', populatedTask);
        
        res.status(201).json(populatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task
router.put('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        // Ensure the task's project belongs to the user
        const project = await Project.findById(task.project);
        if (!project || project.owner.toString() !== req.user) {
            return res.status(401).json({ msg: 'You do not have permission to update this task' });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true }).populate('assignee', 'username');
        
        req.app.get('io').emit('taskUpdate', updatedTask);
        
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
router.delete('/:taskId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        const project = await Project.findById(task.project);
        if (!project || project.owner.toString() !== req.user) {
            return res.status(401).json({ msg: 'You do not have permission to delete this task' });
        }
        
        await Task.findByIdAndDelete(req.params.taskId);
        
        req.app.get('io').emit('taskDelete', req.params.taskId); // Emit a delete event
        
        res.json({ msg: 'Task removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;