import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice';
import { Button, TextField, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  // Get the success state from Redux
  const { isLoading, error, isRegistrationSuccess } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser({ username, password }));
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };
  
    useEffect(() => {
    if (isRegistrationSuccess) {
      setUsername(''); // Reset username field
      setPassword(''); // Reset password field
    }
  }, [isRegistrationSuccess]); 

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" onClose={handleCloseError} sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        {/* {isRegistrationSuccess && ( // Use the Redux state here
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            Registration successful! Please sign in.
          </Alert>
        )} */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || isRegistrationSuccess}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" variant="body2">
              {isRegistrationSuccess ? 'Sign up done! Please sign in' : 'Already have an account? Sign in'}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;