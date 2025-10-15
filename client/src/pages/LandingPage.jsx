import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/chat');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        px: 2,
      }}
    >
      {/* --- Updated Icon Color --- */}
      <HealthAndSafetyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

      <Typography component="h1" variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Luna Health
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        Your Personal AI Health Companion.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4, maxWidth: '600px' }}>
        Manage appointments, understand your health reports, and get answers to your health questions, all through a simple conversation.
      </Typography>
      
      {/* --- Updated Button Style --- */}
      <Button
        variant="contained"
        size="large"
        color="primary" // Use the primary theme color
        onClick={handleEnterApp}
        sx={{ 
          padding: '10px 30px', 
          fontSize: '1rem',
          bgcolor: 'primary.main', // Explicitly set background
          '&:hover': {
            bgcolor: '#000000', // Darken on hover
          }
        }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default LandingPage;