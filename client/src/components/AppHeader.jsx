import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AppHeader = ({ appointments, onNotificationClick }) => {
  const getUpcomingAppointmentsCount = () => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return app.status === 'Confirmed' && appDate > now && appDate <= twoDaysFromNow;
    }).length;
  };

  const upcomingCount = getUpcomingAppointmentsCount();

  return (
    <AppBar position="fixed" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Aura Health
        </Typography>
        <IconButton color="inherit" onClick={onNotificationClick}>
          <Badge badgeContent={upcomingCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;