import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    const response = await axios.get(`${API_URL}/projects`, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized'); // Will trigger logout in extraReducers
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects');
  }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue('No token found');
  try {
    const response = await axios.post(`${API_URL}/projects`, projectData, {
      headers: { 'x-auth-token': token },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return rejectWithValue('Unauthorized');
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to create project');
  }
});

const initialState = {
  projects: [],
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjects: (state) => {
      state.projects = [];
    },
    clearProjectError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        if (action.payload === 'Unauthorized') {
          // Dispatch logout action from authSlice
          // Need to import it or handle it in a thunk middleware
        }
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload); // Add new project to the list
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProjects, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;