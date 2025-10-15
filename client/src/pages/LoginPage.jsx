import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Manually set header for immediate use after login
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <HealthAndSafetyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          Welcome Back
        </Typography>
        <Typography component="p" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue to Aura Health.
        </Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal" required fullWidth id="email" label="Email Address" name="email"
            autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password" type="password"
            id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Sign In
          </Button>
          <Typography color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" variant="body2">
              Sign Up
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;