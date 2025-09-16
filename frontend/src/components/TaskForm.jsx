// src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { createTask, updateTask } from '../slices/taskSlice';
import { fetchUsers } from '../slices/userSlice';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const TaskForm = ({ open, handleClose, projectId, task = null }) => {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.users);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        assignee: '',
        dueDate: '',
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                assignee: task.assignee?._id || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
            });
        }
        dispatch(fetchUsers());
    }, [dispatch, task]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = { ...formData, projectId };
        if (task) {
            dispatch(updateTask({ taskId: task._id, updatedData: dataToSend }));
        } else {
            dispatch(createTask(dataToSend));
        }
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2">
                    {task ? 'Edit Task' : 'Create Task'}
                </Typography>
                <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        required
                        value={formData.title}
                        onChange={handleChange}
                        style={{ marginBottom: 15 }}
                    />
                    <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        style={{ marginBottom: 15 }}
                    />
                    <FormControl fullWidth style={{ marginBottom: 15 }}>
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={formData.status} onChange={handleChange}>
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth style={{ marginBottom: 15 }}>
                        <InputLabel>Assignee</InputLabel>
                        <Select name="assignee" value={formData.assignee} onChange={handleChange}>
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        fullWidth
                        value={formData.dueDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        style={{ marginBottom: 15 }}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        {task ? 'Update Task' : 'Create Task'}
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default TaskForm;