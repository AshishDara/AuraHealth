import React from 'react';
import { Box, Typography, Avatar, Paper, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ReactMarkdown from 'react-markdown';

// The component now accepts 'fileName' from the database
const Message = ({ role, content, fileName }) => {
  const isUser = role === 'user';

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '85%' }}>
        {!isUser && <Avatar sx={{ bgcolor: 'primary.main' }}><HealthAndSafetyIcon /></Avatar>}
        <Paper
          elevation={2}
          sx={{
            p: 1.5,
            bgcolor: isUser ? '#e3f2fd' : '#ffffff',
            borderRadius: isUser ? '15px 15px 0 15px' : '15px 15px 15px 0',
            overflowWrap: 'break-word',
            '& h1, & h2, & h3': { marginTop: 0, marginBottom: '8px' },
            '& p': { margin: 0 },
            '& ul, & ol': { marginTop: '4px', marginBottom: '4px', paddingLeft: '20px' },
          }}
        >
          {/* If a fileName exists, display a Chip for it */}
          {fileName && (
            <Chip
              icon={<InsertDriveFileIcon />}
              label={fileName}
              variant="outlined"
              sx={{ mb: content ? 1 : 0 }}
            />
          )}
          {isUser ? (
            <Typography variant="body1">{content}</Typography>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </Paper>
        {isUser && <Avatar><PersonIcon /></Avatar>}
      </Box>
    </Box>
  );
};

export default Message;