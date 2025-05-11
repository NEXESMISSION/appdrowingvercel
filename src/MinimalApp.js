import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import './styles/reset.css';

// Minimal landing page component
const MinimalLanding = () => {
  // Get auth state from context
  const { isLoggedIn } = useAuth();
  return (
    <div style={{
      backgroundColor: '#111827',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <img 
        src="/assets/logo-dark-bg.png" 
        alt="TraceMate Logo" 
        style={{ maxWidth: '120px', marginBottom: '20px' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        TraceMate
      </h1>
      <p style={{
        fontSize: '1.2rem',
        maxWidth: '600px',
        marginBottom: '30px'
      }}>
        The perfect tool for tracing images through your camera.
      </p>
      <div>
        <a 
          href="/app" 
          style={{
            backgroundColor: '#4a9fff',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
            marginRight: '10px'
          }}
        >
          Try It Now
        </a>
        <a 
          href={isLoggedIn ? "/app" : "/login"} 
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            border: '1px solid white',
            display: 'inline-block'
          }}
        >
          {isLoggedIn ? "Go to App" : "Sign In"}
        </a>
      </div>
    </div>
  );
};

// Minimal App component
function MinimalApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MinimalLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Wrap MinimalApp with AuthProvider
function MinimalAppWithAuth() {
  return (
    <AuthProvider>
      <MinimalApp />
    </AuthProvider>
  );
}

export default MinimalAppWithAuth;
