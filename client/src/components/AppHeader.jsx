import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Add userName and onLogout to the props
const AppHeader = ({ appointments = [], onNotificationClick, userName, onLogout }) => {
  const appointmentCount = appointments.length;

  return (
    <AppBar 
      position="fixed" 
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}
      elevation={0}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Luna Health
        </Typography>
        
        {/* --- THIS IS THE NEW LOGIC --- */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userName && (
            <Typography sx={{ mr: 2 }}>
              Welcome, {userName}
            </Typography>
          )}
          <IconButton
            size="large"
            color="inherit"
            onClick={onNotificationClick}
          >
            <Badge badgeContent={appointmentCount} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {/* Add a logout button */}
          <Button color="inherit" onClick={onLogout} sx={{ ml: 1 }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;