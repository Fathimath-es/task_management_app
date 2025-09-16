// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Button, Typography, Paper, Grid, TextField } from '@mui/material';
import { fetchProjects, createProject } from '../slices/projectSlice';
import { logout } from '../slices/authSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { projects, loading } = useSelector((state) => state.projects);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleCreateProject = (e) => {
        e.preventDefault();
        if (newProjectName) {
            dispatch(createProject({ name: newProjectName }));
            setNewProjectName('');
        }
    };

    return (
        <Container>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <Typography variant="h4">My Projects</Typography>
                <Button variant="contained" color="secondary" onClick={() => dispatch(logout())}>
                    Logout
                </Button>
            </div>
            <form onSubmit={handleCreateProject} style={{ margin: '20px 0' }}>
                <TextField
                    label="New Project Name"
                    variant="outlined"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    style={{ marginRight: 10 }}
                />
                <Button type="submit" variant="contained" color="primary">
                    Add Project
                </Button>
            </form>
            {loading ? (
                <Typography>Loading projects...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project._id}>
                            <Paper elevation={2} style={{ padding: 15 }}>
                                <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
                                    <Typography variant="h6" color="primary">{project.name}</Typography>
                                </Link>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;