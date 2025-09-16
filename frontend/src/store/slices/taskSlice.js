import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (projectId, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    const response = await axios.get(`${API_URL}/tasks/${projectId}`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized');
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized');
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ taskId, taskData }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized');
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    await axios.delete(`${API_URL}/tasks/${taskId}`, {
      headers: { 'x-auth-token': token },
    });
    return taskId; // Return the ID of the deleted task
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized');
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to delete task');
  }
});

const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
  selectedTaskId: null, 
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => { 
        // For real-time updates
      state.tasks = action.payload;
    },
    addTaskRealtime: (state, action) => { 
        // Add a new task from socket
      state.tasks.push(action.payload);
    },
    updateTaskRealtime: (state, action) => { 
        // Update an existing task from socket
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTaskRealtime: (state, action) => {
        // Delete a task from socket
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
    setSelectedTaskId: (state, action) => {
      state.selectedTaskId = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    clearTaskError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        // Add task to list
        state.isLoading = false;
       //state.tasks.push(action.payload); 
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
            // Update task in the list
          state.tasks[index] = action.payload; 
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload); // Remove task from list
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setTasks, 
  addTaskRealtime, 
  updateTaskRealtime, 
  deleteTaskRealtime, 
  setSelectedTaskId, 
  clearTasks, 
  clearTaskError 
} = taskSlice.actions;
export default taskSlice.reducer;