import React, { useRef } from 'react';
import { Box, TextField, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// This component is now fully controlled by its parent (ChatPage)
const ChatInput = ({ 
  onSendMessage, 
  disabled, 
  onFileSelect, 
  onVoiceClick, 
  value, 
  onValueChange, 
  selectedFile // We receive the selected file as a prop
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file); // Notify the parent of the new file
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null); // Notify the parent to clear the file
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use the props directly to send the message
    if (value.trim() || selectedFile) {
      onSendMessage(value, selectedFile);
    }
  };

  return (
    <Box>
      {selectedFile && (
        <Box sx={{ p: 1, pl: 2, bgcolor: '#f5f5f5' }}>
          <Chip
            label={selectedFile.name}
            onDelete={handleRemoveFile}
            color="primary"
            variant="outlined"
            disabled={disabled}
          />
        </Box>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 1, borderTop: '1px solid #ddd', bgcolor: '#f5f5f5' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="application/pdf"
        />
        <IconButton onClick={handleAttachClick} disabled={disabled || !!selectedFile}>
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a question or use the microphone..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
        />
        <IconButton color="primary" type="submit" disabled={disabled || (!value.trim() && !selectedFile)}>
          <SendIcon />
        </IconButton>
        <IconButton color="primary" onClick={onVoiceClick} disabled={disabled}>
          <MicIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;