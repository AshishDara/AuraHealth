import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// --- THE NEW BLACK & WHITE THEME ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#212121', // A dark, near-black color
      contrastText: '#ffffff', // White text on primary buttons
    },
    background: {
      default: '#ffffff', // Pure white background
      paper: '#ffffff',   // White for components like the chat window
    },
    text: {
      primary: '#000000',     // Black for primary text
      secondary: '#757575', // Gray for secondary text
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;