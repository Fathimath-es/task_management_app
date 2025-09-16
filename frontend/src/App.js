// src/App.js

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import { logout, clearError as clearAuthError } from './store/slices/authSlice';
import { clearProjects, clearProjectError } from './store/slices/projectSlice';
import { clearTasks, clearTaskError } from './store/slices/taskSlice';

import io from 'socket.io-client';
import { addTaskRealtime, updateTaskRealtime, deleteTaskRealtime } from './store/slices/taskSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error: authError } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authError === 'Unauthorized') {
      dispatch(logout());
      dispatch(clearAuthError());
      dispatch(clearProjects());
      dispatch(clearTasks());
      navigate('/');
    }
  }, [authError, dispatch, navigate]);

  useEffect(() => {
    dispatch(clearProjectError());
    dispatch(clearTaskError());
  }, [dispatch]);

  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // We'll use the token from localStorage directly for the socket connection
  //const token = localStorage.getItem('token');
  const {isAuthenticated,token} = useSelector((state) => state.auth);

  useEffect(() => {
    let socket;
    if (isAuthenticated && token) {
      socket = io(SOCKET_URL, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socket.on('taskUpdate', (task) => {
        console.log('Real-time task update:', task);
        dispatch(updateTaskRealtime(task));
      });

      socket.on('taskCreate', (task) => {
        console.log('Real-time task create:', task);
        dispatch(addTaskRealtime(task));
      });

      socket.on('taskDelete', (taskId) => {
        console.log('Real-time task delete:', taskId);
        dispatch(deleteTaskRealtime(taskId));
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, token, dispatch, navigate]);

  return (
    <Routes>
      <Route path="/" element={<RegisterPage/>} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage/>}/>
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PrivateRoute>
            <ProjectDetailPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;