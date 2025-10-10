import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import AppHeader from '../components/AppHeader';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import VoiceModal from '../components/VoiceModal';
import AppointmentsModal from '../components/AppointmentsModal';
import axios from 'axios';
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

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const silenceTimer = useRef();
  const welcomeMessage = { role: 'assistant', content: 'Hello! I am Aura, your personal health assistant. How can I help you today?' };

  useEffect(() => {
    setInputValue(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!listening) return;
    setVoiceStatus('listening');
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      SpeechRecognition.stopListening();
      if (transcript || attachedFile) {
        setVoiceStatus('processing');
        handleSendMessage(transcript, attachedFile, { isVoiceInput: true });
      }
    }, 2000);
    return () => clearTimeout(silenceTimer.current);
  }, [transcript, listening, attachedFile]);

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
          setMessages(historyRes.data.map(msg => ({ 
            role: msg.role, content: msg.content, fileName: msg.fileName 
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

  const handleSendMessage = async (messageContent, file, options = { isVoiceInput: false }) => {
    const userMessageContent = messageContent || (file ? `Analyze: ${file.name}` : '');
    if (!userMessageContent && !file) return;

    const userMessage = { 
      role: 'user', 
      content: userMessageContent, 
      fileName: file ? file.name : null 
    };
    setMessages(prev => [...prev, userMessage]);

    setAttachedFile(null);
    setInputValue('');
    resetTranscript();

    setIsLoading(true);
    if (options.isVoiceInput) setVoiceStatus('processing');

    try {
      let data;
      let toolUsed = false;

      if (file) {
        const formData = new FormData();
        formData.append('report', file);
        formData.append('message', messageContent);
        const response = await axios.post('http://localhost:5001/api/v1/reports/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = response.data;
      } else {
        const updatedMessages = [...messages, userMessage];
        const response = await axios.post('http://localhost:5001/api/v1/chat', { messages: updatedMessages });
        data = response.data;
        if (data.response.content.includes("Appointment confirmed") || data.response.content.includes("deleted") || data.response.content.includes("cancelled")) {
          toolUsed = true;
        }
      }

      setMessages(prev => [...prev, data.response]);

      if (options.isVoiceInput) {
        setVoiceStatus('speaking');
        speak(data.response.content, () => startListening());
      }

      if (toolUsed) {
        await fetchAppointments();
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMsg = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMsg]);

      if (options.isVoiceInput) {
        setVoiceStatus('speaking');
        speak(errorMsg.content, () => setVoiceStatus('idle'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/v1/appointments/${id}`, {
        status: 'Completed',
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  const startListening = () => {
    resetTranscript();
    setVoiceStatus('listening');
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleModalMicClick = () => {
    switch (voiceStatus) {
      case 'speaking':
        window.speechSynthesis.cancel();
        startListening();
        break;
      case 'idle':
        startListening();
        break;
      case 'listening':
        SpeechRecognition.stopListening();
        if (transcript || attachedFile) {
          setVoiceStatus('processing');
          handleSendMessage(transcript, attachedFile, { isVoiceInput: true });
        } else {
          setVoiceStatus('idle');
        }
        break;
      default:
        break;
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', bgcolor: 'background.default' }}>
      <AppHeader
        appointments={appointments}
        onNotificationClick={() => setIsAppointmentsModalOpen(true)}
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