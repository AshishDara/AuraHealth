import React from 'react';
import {
  Modal, Box, Typography, List, ListItem, ListItemText, Button, IconButton, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Icon for the header
import EventBusyIcon from '@mui/icons-material/EventBusy';   // Icon for the empty state

// A cleaner, more modern style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3, // Adjusted padding
  borderRadius: '12px', // Softer corners
  display: 'flex',
  flexDirection: 'column',
};

const AppointmentsModal = ({ open, onClose, appointments, onComplete }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="appointments-modal-title"
    >
      <Box sx={modalStyle}>
        {/* --- Improved Header --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EventNoteIcon color="primary" />
            <Typography id="appointments-modal-title" variant="h6" component="h2" fontWeight="bold">
              Upcoming Appointments
            </Typography>
          </Box>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* --- List or Empty State --- */}
        {appointments && appointments.length > 0 ? (
          <List sx={{ overflowY: 'auto', maxHeight: '60vh' }}>
            {appointments.map((app) => (
              <ListItem
                key={app._id}
                secondaryAction={
                  <Button
                    variant="text" // A softer button style
                    size="small"
                    onClick={() => onComplete(app._id)}
                  >
                    Complete
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight="500">
                      {app.title}
                    </Typography>
                  }
                  secondary={new Date(app.date).toLocaleString([], {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          // --- Improved Empty State ---
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, gap: 2 }}>
            <EventBusyIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography color="text.secondary">
              You have no upcoming appointments.
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AppointmentsModal;