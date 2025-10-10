// client/src/components/Message.jsx

import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const Message = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {!isUser && <Avatar sx={{ bgcolor: 'primary.main' }}><HealthAndSafetyIcon /></Avatar>}
        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            bgcolor: isUser ? '#e3f2fd' : '#ffffff', // Light blue for user, white for assistant
            borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
            maxWidth: '600px',
          }}
        >
          <Typography variant="body1">{content}</Typography>
        </Paper>
         {isUser && <Avatar><PersonIcon /></Avatar>}
      </Box>
    </Box>
  );
};

export default Message;