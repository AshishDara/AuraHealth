import React from 'react';
import { Box, TextField, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';

const ChatInput = ({ 
  fileInputRef, // Accept the ref from the parent
  onSendMessage, 
  disabled, 
  onFileSelect, 
  onVoiceClick, 
  value, 
  onValueChange, 
  selectedFile 
}) => {
  const handleSendClick = () => {
    onSendMessage(value, selectedFile);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'background.paper' }}>
      {selectedFile && (
        <Chip
          label={selectedFile.name}
          onDelete={() => {
            onFileSelect(null);
            // Also reset the input value when the chip is deleted
            if (fileInputRef.current) {
              fileInputRef.current.value = null;
            }
          }}
          sx={{ mb: 1 }}
        />
      )}
      {/* --- Reverted UI Layout --- */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message or upload a report..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          multiline
          maxRows={4}
          sx={{ mr: 1 }} // Add margin to separate from icons
        />
        <IconButton onClick={onVoiceClick} disabled={disabled}>
          <MicIcon />
        </IconButton>
        <IconButton onClick={() => fileInputRef.current.click()} disabled={disabled}>
          <AttachFileIcon />
        </IconButton>
        <IconButton onClick={handleSendClick} disabled={disabled || (!value.trim() && !selectedFile)} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
      <input
        type="file"
        ref={fileInputRef} // Connect the ref here
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf"
      />
    </Box>
  );
};

export default ChatInput;