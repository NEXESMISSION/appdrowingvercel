import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import TracingPage from './components/TracingPage';
import FallbackLandingPage from './landing/FallbackLandingPage';
import LoginPage from './components/LoginPage';
import PaymentPage from './components/PaymentPage';
import { AuthProvider } from './context/AuthContext';
import './styles/reset.css'; // Import CSS reset first
import './styles.css';
import './styles/GlobalDarkTheme.css'; // Import global dark theme
import './styles/ForceDarkTheme.css'; // Import stronger dark theme overrides

// Using the standard Router setup to avoid TypeScript errors
// The warnings in the console are development-only and won't affect the production build
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app" style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', width: '100%' }}>
          <Routes>
            <Route path="/tracing" element={<TracingPage />} />
            <Route path="/app" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/" element={<FallbackLandingPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;