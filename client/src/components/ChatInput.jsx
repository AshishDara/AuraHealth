// client/src/components/ChatInput.jsx (Updated)

import React, { useState, useEffect, useRef } from 'react'; // Add useRef
import { Box, TextField, IconButton, CircularProgress, Typography, Chip } from '@mui/material'; // Add Chip
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile'; // Import attachment icon
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ChatInput = ({ onSendMessage, disabled, onFileSelect }) => { // Add onFileSelect prop
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => { setInputValue(transcript); }, [transcript]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file); // Notify parent component
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden input
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null); // Notify parent component
    fileInputRef.current.value = null; // Reset file input
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() || selectedFile) {
      onSendMessage(inputValue, selectedFile); // Pass both message and file
      setInputValue('');
      setSelectedFile(null);
      resetTranscript();
      fileInputRef.current.value = null;
    }
  };

  // ... (handleVoiceListening and browser support check remain the same) ...

  return (
    <Box>
      {/* Chip to show the selected file */}
      {selectedFile && (
        <Box sx={{ p: 1, pl: 2 }}>
          <Chip
            label={selectedFile.name}
            onDelete={handleRemoveFile}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 1, borderTop: '1px solid #ddd' }}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="application/pdf" // Only accept PDF files
        />
        <IconButton onClick={handleAttachClick} disabled={disabled}>
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a question for your report or chat..."
          // ... (rest of TextField props) ...
        />
        {/* ... (Send and Mic buttons remain the same) ... */}
      </Box>
    </Box>
  );
};

export default ChatInput;