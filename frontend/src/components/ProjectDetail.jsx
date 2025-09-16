// src/components/ProjectDetail.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Paper, Grid } from '@mui/material';
import { fetchTasks } from '../slices/taskSlice';
import TaskForm from './TaskForm';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.tasks);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        dispatch(fetchTasks(projectId));
    }, [dispatch, projectId]);

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    return (
        <Container>
            <Typography variant="h4" style={{ marginTop: 20 }}>
                Project Tasks
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} style={{ margin: '20px 0' }}>
                Add New Task
            </Button>
            <TaskForm open={openModal} handleClose={handleClose} projectId={projectId} />
            {loading ? (
                <Typography>Loading tasks...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {tasks.map((task) => (
                        <Grid item xs={12} key={task._id}>
                            <Paper elevation={2} style={{ padding: 15 }}>
                                <Typography variant="h6">{task.title}</Typography>
                                <Typography variant="body2" color="textSecondary">{task.description}</Typography>
                                {/* Add buttons for Edit and Delete */}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ProjectDetail;