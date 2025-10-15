import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import VoiceModal from '../components/VoiceModal';
import AppointmentsModal from '../components/AppointmentsModal';
import api from '../api/axiosConfig';
import { speak } from '../utils/speechUtils';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState(''); // State for user's name
  const navigate = useNavigate();

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const silenceTimer = useRef();
  const fileInputRef = useRef(null);
  const welcomeMessage = { role: 'assistant', content: 'Hello! I am Aura, your personal health assistant. How can I help you today?' };

  useEffect(() => {
    if (listening) {
      setInputValue(transcript);
    }
  }, [transcript, listening]);

  useEffect(() => {
    if (!listening) return;
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      if (transcript.trim() || attachedFile) {
        SpeechRecognition.stopListening();
        setVoiceStatus('processing');
        handleSendMessage(transcript, attachedFile, { isVoiceInput: true });
      }
    }, 2000);
    return () => clearTimeout(silenceTimer.current);
  }, [transcript, listening, attachedFile]);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.name) {
        setUserName(userInfo.name);
      }

      try {
        const historyRes = await api.get('/chat');
        if (historyRes.data && historyRes.data.length > 0) {
          setMessages(historyRes.data.map(msg => ({ 
            role: msg.role, 
            content: msg.content, 
            fileName: msg.fileName 
          })));
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
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const handleSendMessage = async (messageContent, file, options = { isVoiceInput: false }) => {
    const userMessageContent = messageContent || (file ? `Analyze this file` : '');
    if (!userMessageContent && !file) {
      if (options.isVoiceInput) setVoiceStatus('idle');
      return;
    }

    const userMessage = { 
      role: 'user', 
      content: userMessageContent, 
      fileName: file ? file.name : null 
    };
    setMessages(prev => [...prev, userMessage]);

    setAttachedFile(null);
    setInputValue('');
    resetTranscript();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

    setIsLoading(true);
    if (options.isVoiceInput) setVoiceStatus('processing');

    try {
      let data;
      if (file) {
        const formData = new FormData();
        formData.append('report', file);
        formData.append('message', messageContent);
        const response = await api.post('/reports/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = response.data;
      } else {
        const updatedMessages = [...messages, userMessage];
        const response = await api.post('/chat', { messages: updatedMessages });
        data = response.data;
      }
      
      setMessages(prev => [...prev, data.response]);
      
      const responseText = data.response.content.toLowerCase();
      if (responseText.includes('confirmed') || responseText.includes('deleted') || responseText.includes('canceled')) {
        await fetchAppointments();
      }
      
      if (options.isVoiceInput) {
        setVoiceStatus('speaking');
        speak(data.response.content, startListening);
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMsg = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMsg]);
      if (options.isVoiceInput) {
        setVoiceStatus('speaking');
        speak(errorMsg.content, startListening);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    resetTranscript();
    setVoiceStatus('listening');
    SpeechRecognition.startListening({ continuous: true });
  };
  
  const handleCompleteAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}`, {
        status: 'Completed',
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };
  
  const handleModalMicClick = () => {
    if (voiceStatus === 'speaking') {
      window.speechSynthesis.cancel();
      startListening();
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      startListening();
    }
  };

  const handleOpenVoiceModal = () => {
    setIsVoiceModalOpen(true);
    startListening();
  };

  const handleCloseVoiceModal = () => {
    window.speechSynthesis.cancel();
    SpeechRecognition.stopListening();
    setIsVoiceModalOpen(false);
    setVoiceStatus('idle');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <AppHeader
        appointments={appointments}
        onNotificationClick={() => setIsAppointmentsModalOpen(true)}
        userName={userName}
        onLogout={handleLogout}
      />
      <Box component={Paper} sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '800px',
        margin: '80px auto 20px auto',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <ChatWindow messages={messages} />
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}><CircularProgress size={24} /></Box>}
        <ChatInput
          fileInputRef={fileInputRef}
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          onFileSelect={setAttachedFile}
          onVoiceClick={handleOpenVoiceModal}
          value={inputValue}
          onValueChange={setInputValue}
          selectedFile={attachedFile}
        />
      </Box>

      <VoiceModal
        open={isVoiceModalOpen}
        onClose={handleCloseVoiceModal}
        transcript={transcript}
        status={voiceStatus}
        onMicClick={handleModalMicClick}
      />

      <AppointmentsModal
        open={isAppointmentsModalOpen}
        onClose={() => setIsAppointmentsModalOpen(false)}
        appointments={appointments}
        onComplete={handleCompleteAppointment}
      />
    </Box>
  );
};

export default ChatPage;