import React from 'react';
import { Modal, Box, Typography, List, ListItem, ListItemText, IconButton, Divider, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 3,
};

const AppointmentsModal = ({ open, onClose, appointments, onComplete }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Upcoming Appointments
        </Typography>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {appointments && appointments.length > 0 ? (
            appointments.map((app) => (
              app.status === 'Confirmed' && (
                <React.Fragment key={app._id}>
                  <ListItem
                    secondaryAction={
                      <Tooltip title="Mark as Completed">
                        <IconButton edge="end" aria-label="complete" onClick={() => onComplete(app._id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={app.title}
                      secondary={new Date(app.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              )
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
              You have no upcoming appointments.
            </Typography>
          )}
        </List>
      </Box>
    </Modal>
  );
};

export default AppointmentsModal;