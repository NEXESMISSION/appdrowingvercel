import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import authService from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [currentDevice, setCurrentDevice] = useState<{name: string, deviceId: string} | null>(null);
  
  const navigate = useNavigate();
  
  // Check if already logged in and scroll to top
  useEffect(() => {
    // Scroll to the top of the page when component mounts
    window.scrollTo(0, 0);
    
    // Use synchronous versions for immediate UI feedback
    if (authService.isLoggedInSync() && authService.verifyDeviceSync()) {
      navigate('/app');
    }
    
    // Get current device info
    const device = authService.getCurrentDevice();
    setCurrentDevice({
      name: device.name,
      deviceId: device.deviceId
    });
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Attempt to login
      const result = await authService.login(email, password);
      
      if (result.success) {
        // No device verification check - allow unlimited devices
        navigate('/app');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <Link to="/" className="logo-container" title="Go to Home Page">
        <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="app-logo" />
        <span className="logo-text">TraceMate</span>
      </Link>
      
      <div className="login-container">
        <div className="new-user-info">
          <h2>New User? Here's How to Get Premium Access:</h2>
          <p>
            To create an account and access our premium tools, please visit our 
            <Link to="/payment" className="payment-link"> Payment Information Page</Link>. 
            You'll find instructions on how to contact us to complete your payment. 
            Once confirmed, we'll swiftly create your account and provide login details. 
            We prioritize a professional and efficient service.
          </p>
        </div>
        
        <h1>Sign In</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {currentDevice && (
          <div className="device-info">
            <p>You are signing in from: <strong>{currentDevice.name}</strong></p>
            <p className="device-note">Note: Premium accounts can only be used on up to 3 devices.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="back-button-container">
          <Link to="/" className="back-button">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
