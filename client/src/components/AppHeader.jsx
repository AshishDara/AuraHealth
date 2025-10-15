import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AppHeader = ({ appointments = [], onNotificationClick }) => {
  const appointmentCount = appointments.length;

  return (
    // --- Updated AppBar Style ---
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'background.paper', // White background
        color: 'text.primary',      // Black text
        borderBottom: '1px solid #e0e0e0' // Subtle border
      }}
      elevation={0} // Remove shadow for a flatter look
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Luna Health
        </Typography>
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit" // Inherit black color
          onClick={onNotificationClick}
        >
          <Badge badgeContent={appointmentCount} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;