// client/src/components/ChatWindow.jsx

import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import Message from './Message';

const ChatWindow = ({ messages }) => {
  const scrollRef = useRef(null);

  // Effect to auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} content={msg.content} />
      ))}
    </Box>
  );
};

export default ChatWindow;