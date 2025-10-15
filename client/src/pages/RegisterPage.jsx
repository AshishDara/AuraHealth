import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', bloodType: '', allergies: '', healthConditions: '', healthGoals: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      navigate('/chat');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      const { data } = await api.post(
        '/auth/register',
        formData
      );
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Manually set header for immediate use after registration
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
        <HealthAndSafetyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
          Create Your Luna Health Account
        </Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField label="Full Name*" name="name" value={formData.name} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Email Address*" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Password*" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Blood Type" name="bloodType" value={formData.bloodType} onChange={handleChange} fullWidth margin="normal" placeholder="e.g., A+, O-" />
          <TextField label="Known Allergies" name="allergies" value={formData.allergies} onChange={handleChange} fullWidth margin="normal" placeholder="e.g., Peanuts" />
          <TextField label="Ongoing Health Conditions" name="healthConditions" value={formData.healthConditions} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Your Health Goals" name="healthGoals" value={formData.healthGoals} onChange={handleChange} fullWidth margin="normal" />
          
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Create Account
          </Button>
          <Typography color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" variant="body2">
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;