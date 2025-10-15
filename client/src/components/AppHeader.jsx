import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AppHeader = ({ appointments = [], onNotificationClick }) => {
  const appointmentCount = appointments.length;

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Aura Health
        </Typography>
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          onClick={onNotificationClick}
        >
          <Badge badgeContent={appointmentCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;