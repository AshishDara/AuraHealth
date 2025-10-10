// client/src/App.jsx

import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Create a simple, clean theme for our app
const theme = createTheme({
  palette: {
    primary: {
      main: '#00796b', // A calming teal color
    },
    background: {
      default: '#f4f6f8', // A light grey background
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* A helper component to normalize styles */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;