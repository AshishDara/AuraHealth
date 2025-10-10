import React, { useState, useEffect } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import AppHeader from '../components/AppHeader';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import axios from 'axios';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start as true to show loading initially
  const [attachedFile, setAttachedFile] = useState(null); // State for the file

  const welcomeMessage = { role: 'assistant', content: 'Hello! I am Aura, your personal health assistant. How can I help you today?' };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/v1/appointments');
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const historyRes = await axios.get('http://localhost:5001/api/v1/chat');
        if (historyRes.data && historyRes.data.length > 0) {
          setMessages(historyRes.data.map(msg => ({ role: msg.role, content: msg.content })));
        } else {
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setMessages([welcomeMessage]);
      }
      await fetchAppointments();
      setIsLoading(false);
    };

    fetchInitialData();
  }, []);

  const handleSendMessage = async (newMessageContent, file) => {
    setIsLoading(true);
    // Use a more descriptive placeholder if no text is typed with a file
    const userMessageContent = newMessageContent || (file ? `Analyze: ${file.name}` : '');
    if (!userMessageContent) {
        setIsLoading(false);
        return;
    }
    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setAttachedFile(null);

    try {
      let data;
      if (file) {
        // Handle file upload with FormData
        const formData = new FormData();
        formData.append('report', file);
        formData.append('message', newMessageContent);

        const response = await axios.post('http://localhost:5001/api/v1/reports/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = response.data;
      } else {
        // Handle normal chat message
        const updatedMessages = [...messages, userMessage];
        const response = await axios.post('http://localhost:5001/api/v1/chat', {
          messages: updatedMessages,
        });
        data = response.data;
      }

      setMessages(prev => [...prev, data.response]);
      if (data.response.content.includes("Appointment confirmed")) {
        await fetchAppointments(); // Refetch appointments to update badge
      }

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppHeader appointments={appointments} />
      <Box
        component={Paper}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '800px',
          width: '100%',
          margin: '80px auto 20px auto',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <ChatWindow messages={messages} />
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}><CircularProgress size={24} /></Box>}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          onFileSelect={setAttachedFile}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;