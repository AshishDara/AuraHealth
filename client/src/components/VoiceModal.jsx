import React from 'react';
import { Modal, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { keyframes } from '@emotion/react';

// A pulsating animation for the listening icon
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 121, 107, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 10px 20px rgba(0, 121, 107, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 121, 107, 0); }
`;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '15px',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const VoiceModal = ({ open, onClose, transcript, status, onMicClick }) => {
  const isListening = status === 'listening';

  // Function to determine what to display based on the current status
  const renderContent = () => {
    switch (status) {
      case 'listening':
        return {
          title: "Listening...",
          icon: <MicIcon sx={{ fontSize: 50 }} />,
          isPulsing: true,
        };
        case 'processing':
        return {
          title: "Luna is thinking...",
          icon: <CircularProgress size={50} color="inherit" />,
          isPulsing: false,
        };
      case 'speaking':
        return {
          title: "Luna is speaking...",
          icon: <GraphicEqIcon sx={{ fontSize: 50 }} />,
          isPulsing: false,
        };
      default: // idle
        return {
          title: "Voice Chat",
          icon: <MicIcon sx={{ fontSize: 50 }} />,
          isPulsing: false,
        };
    }
  };

  const { title, icon, isPulsing } = renderContent();

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <IconButton
          aria-label="close voice modal"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        <IconButton
          onClick={onMicClick}
          sx={{
            width: 100,
            height: 100,
            mt: 3,
            mb: 2,
            bgcolor: isListening ? 'primary.main' : 'grey.300',
            color: 'white',
            animation: isPulsing ? `${pulse} 2s infinite` : 'none',
            cursor: 'pointer', // Ensure it looks clickable
          }}
        >
          {icon}
        </IconButton>

        <Typography variant="body1" sx={{ minHeight: '50px' }}>
          {transcript || "..."}
        </Typography>
      </Box>
    </Modal>
  );
};

export default VoiceModal;