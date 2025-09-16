import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { fetchProjects } from '../store/slices/projectSlice'; // To get project details
import { logout } from '../store/slices/authSlice';
import {
  Container, Typography, Box, CircularProgress, Alert, Button,
  Card, CardContent, Grid, Chip, TextField, Select,
  MenuItem, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, IconButton, Tooltip
} from '@mui/material';
import { Edit, Delete} from '@mui/icons-material'; // Icons
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
// For filtering
const STATUS_OPTIONS = ['todo', 'in-progress', 'done'];

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects } = useSelector((state) => state.projects);
  const { tasks, isLoading, error} = useSelector((state) => state.tasks);
  const { token } = useSelector((state) => state.auth);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState(''); // You'll need to fetch users for this
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // Task being edited or created
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Fetch project and tasks on mount
  useEffect(() => {
    if (!token) {
      dispatch(logout());
      navigate('/');
      return;
    }
    dispatch(fetchProjects()); // Fetch all projects to get current project details
    dispatch(fetchTasks(projectId));
  }, [projectId, dispatch, navigate, token]);

  // Find the current project
  const project = projects.find(p => p._id === projectId);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus ? task.status === filterStatus : true;
    // Assignee filtering requires user data. For now, assuming assignee is an ID.
    // You'd likely want to map assignee IDs to usernames fetched from backend.
    const assigneeMatch = filterAssignee ? task.assignee === filterAssignee : true;
    return statusMatch && assigneeMatch;
  });

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Open Modal for Task Creation/Editing
  const handleOpenTaskModal = useCallback((task = null, isCreate = false) => {
    setIsCreateMode(isCreate);
    setCurrentTask(task || { title: '', description: '', status: 'todo', assignee: '', dueDate: '' });
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setCurrentTask(null);
  }, []);

  // Handle Task Form Submission
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!currentTask.title.trim()) return;

    const taskData = {
      title: currentTask.title,
      description: currentTask.description,
      status: currentTask.status,
      assignee: currentTask.assignee || null, // Send null if empty
      dueDate: currentTask.dueDate || null,
      projectId: projectId,
    };

    if (isCreateMode) {
      await dispatch(createTask(taskData));
    } else if (currentTask._id) {
      await dispatch(updateTask({ taskId: currentTask._id, taskData }));
    }
    handleCloseTaskModal();
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(taskId));
    }
  };

  // Handle Drag and Drop completion
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same list, update status and dispatch
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same status (if needed for UI, but not strictly required by problem)
      // For simplicity, we'll focus on status change for now.
    } else {
      // Task moved between status columns (e.g., todo to in-progress)
      const updatedTaskData = {
        ...tasks.find(task => task._id === draggableId),
        status: destination.droppableId, // The ID of the droppable is the status
      };
      // Dispatch updateTask to update the status on backend and Redux
      await dispatch(updateTask({ taskId: draggableId, taskData: updatedTaskData }));
    }
  };

  // Helper to get assignee name (you'll need to fetch users)
  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return 'Unassigned';
    // Replace with actual user fetching logic
    return assigneeId.substring(0, 6) + '...'; // Placeholder
  };

  // Dummy users for filtering
  const dummyUsers = [
    { _id: 'user1_id', username: 'Alice' },
    { _id: 'user2_id', username: 'Bob' },
  ];

  if (!project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {project.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Tasks</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenTaskModal(null, true)}>
            Add Task
          </Button>
        </Box>

        {/* Filtering Controls */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
  <FormControl sx={{ minWidth: 180 }}>
    <InputLabel id="status-label" shrink={true}>Filter by Status</InputLabel>
    <Select
      labelId="status-label"
      id="status-select"
      value={filterStatus}
      label="Filter by Status"
      onChange={(e) => setFilterStatus(e.target.value)}
      displayEmpty
    >
      <MenuItem value="">All Statuses</MenuItem>
      {STATUS_OPTIONS.map(status => (
        <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
      ))}
    </Select>
  </FormControl>
  <FormControl sx={{ minWidth: 180 }}>
    <InputLabel id="assignee-label" shrink={true} >Filter by Assignee</InputLabel>
    <Select
      labelId="assignee-label"
      id="assignee-select"
      value={filterAssignee}
      label="Filter by Assignee"
      onChange={(e) => setFilterAssignee(e.target.value)}
      displayEmpty
    >
      <MenuItem value="">All Assignees</MenuItem>
      {dummyUsers.map(user => (
        <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {!isLoading && filteredTasks.length === 0 && (
          <Typography variant="body1" sx={{ mt: 3 }}>No tasks found for this project.</Typography>
        )}

        {/* Task Board using DragDropContext */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={3}>
            {STATUS_OPTIONS.map(status => (
              <Grid item key={status} xs={12} md={4}>
                <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize', color: 'text.secondary' }}>
                  {status}
                </Typography>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      sx={{
                        minHeight: '300px',
                        backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'background.paper',
                        borderRadius: 2,
                        p: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        transition: 'background-color 0.3s ease',
                      }}
                      {...provided.droppableProps}
                    >
                      {filteredTasks
                        .filter(task => task.status === status)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  p: 1,
                                  boxShadow: snapshot.isDragging ? 3 : 1,
                                  backgroundColor: snapshot.isDragging ? 'primary.light' : 'white',
                                  cursor: 'grab',
                                }}
                              >
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                        {task.title}
                                      </Typography>
                                      {task.description && <Typography variant="body2" color="text.secondary">{task.description}</Typography>}
                                      {task.dueDate && <Typography variant="caption" color="text.secondary">Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Chip label={getAssigneeName(task.assignee)} size="small" sx={{ mr: 1 }} />
                                      <Tooltip title="Edit Task">
                                        <IconButton size="small" onClick={() => handleOpenTaskModal(task, false)}>
                                          <Edit fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Task">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteTask(task._id)}>
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>

        {/* Task Edit/Create Modal */}
        <Dialog open={isTaskModalOpen} onClose={handleCloseTaskModal} maxWidth="sm" fullWidth>
          <DialogTitle>{isCreateMode ? 'Create New Task' : 'Edit Task'}</DialogTitle>
          <Box component="form" onSubmit={handleTaskSubmit}>
            <DialogContent>
              <TextField
                margin="dense"
                label="Title"
                type="text"
                fullWidth
                variant="standard"
                value={currentTask?.title || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                variant="standard"
                multiline
                rows={3}
                value={currentTask?.description || ''}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="standard">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={currentTask?.status || 'todo'}
                      onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                      label="Status"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth variant="standard">
                    <InputLabel>Assignee</InputLabel>
                    <Select
                      value={currentTask?.assignee || ''}
                      onChange={(e) => setCurrentTask({ ...currentTask, assignee: e.target.value })}
                      label="Assignee"
                      displayEmpty
                    >
                      <MenuItem value=""><em>Unassigned</em></MenuItem>
                      {dummyUsers.map(user => (
                        <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                margin="dense"
                label="Due Date"
                type="date"
                fullWidth
                variant="standard"
                value={currentTask?.dueDate ? currentTask.dueDate.split('T')[0] : ''} // Format for date input
                onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                sx={{ mt: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTaskModal}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!currentTask?.title.trim()}>
                {isCreateMode ? 'Create' : 'Save'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProjectDetailPage;