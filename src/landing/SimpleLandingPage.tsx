import React from 'react';
import '../styles/GlobalDarkTheme.css';

const SimpleLandingPage: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#111827', 
      color: 'white', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>TraceMate</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }}>
        The perfect tool for tracing images through your camera.
      </p>
      <div style={{ marginTop: '30px' }}>
        <button style={{ 
          backgroundColor: '#4a9fff', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Try It Now
        </button>
      </div>
    </div>
  );
};

export default SimpleLandingPage;
