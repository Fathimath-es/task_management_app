import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Use your backend port

// Async thunks for API calls
export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    localStorage.setItem('token', response.data.token); // Store token locally
    return response.data.token;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    await axios.post(`${API_URL}/auth/register`, { username, password });
    return 'User registered successfully';
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Registration failed');
  }
});

const initialState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: localStorage.getItem('token') ? true : false,
  isLoading: false,
  error: null,
  isRegistrationSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear project and task data on logout
      state.projects = [];
      state.tasks = [];
      state.isRegistrationSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
      state.isRegistrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isRegistrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isRegistrationSuccess = true;
        // Optionally, redirect to login or show a success message
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isRegistrationSuccess = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;