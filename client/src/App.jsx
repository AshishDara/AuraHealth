import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#212121', contrastText: '#ffffff' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#757575' },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

function App() {
  // The old useEffect that set axios headers has been REMOVED.
  // The new interceptor handles this automatically and more reliably.

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;