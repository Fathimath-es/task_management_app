import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject } from '../store/slices/projectSlice';
import { logout } from '../store/slices/authSlice';
import {
  Container, Typography, List, ListItem, ListItemText, Button,
  AppBar, Toolbar, Box, CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error } = useSelector((state) => state.projects);
  const { token } = useSelector((state) => state.auth); // Used for auth check
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (token) { // Only fetch if authenticated
      dispatch(fetchProjects());
    } else {
      navigate('/'); // Redirect to login if no token
    }
  }, [dispatch, navigate, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewProjectName('');
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      dispatch(createProject({ name: newProjectName }));
      handleCloseModal();
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Your Projects</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
            Add Project
          </Button>
        </Box>

        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!isLoading && projects.length === 0 && (
          <Typography variant="body1" sx={{ mt: 3 }}>No projects found. Click "Add Project" to get started!</Typography>
        )}

        <List component={Paper} elevation={2}>
          {projects.map((project) => (
            <ListItem
              key={project._id}
              button
              onClick={() => handleProjectClick(project._id)}
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText primary={project.name} secondary={`Created: ${new Date(project.createdAt).toLocaleDateString()}`} />
            </ListItem>
          ))}
        </List>
      </Container>

      {/* Dialog for Adding New Project */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Create New Project</DialogTitle>
        <Box component="form" onSubmit={handleCreateProject}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              type="text"
              fullWidth
              variant="standard"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!newProjectName.trim()}>Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default DashboardPage;