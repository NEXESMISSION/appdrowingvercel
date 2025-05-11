import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/UploadPage.css';
import '../styles/GlobalDarkTheme.css';
import '../styles/ModernEffects.css';
import '../styles/Animations.css';
import '../styles/SessionLimit.css';
import authService from '../services/authService';
import sessionLimitService from '../services/sessionLimitService';
import { useAuth } from '../context/AuthContext';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Get auth state from context
  const { isLoggedIn, isPremium: isPremiumUser } = useAuth();

  // Check camera permission on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);
  
  // Premium status is now managed by AuthContext

  const checkCameraPermission = async () => {
    setIsCheckingPermission(true);
    try {
      // Try to access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If successful, stop all tracks and set permission as granted
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch (error) {
      // Handle camera permission error silently
      setCameraPermission('denied');
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleRequestPermission = async () => {
    await checkCameraPermission();
  };

  const handleUploadClick = () => {
    if (cameraPermission === 'granted') {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      // Store the image URL in sessionStorage to access it in the TracingPage
      sessionStorage.setItem('uploadedImage', imageUrl);
      
      // Check if user is premium
      if (isPremiumUser) {
        // Premium users can always proceed
        navigate('/tracing');
      } else {
        // For free users, check if they've reached their daily session limit
        if (sessionLimitService.hasReachedDailyLimitSync()) {
          // Show session limit reached dialog
          setShowLoginPrompt(true);
        } else {
          // Record this session use and proceed to tracing page
          sessionLimitService.recordSessionUseSync();
          navigate('/tracing');
        }
      }
    }
  };
  
  // Continue as free user
  const handleContinueAsFree = () => {
    setShowLoginPrompt(false);
    navigate('/tracing');
  };
  
  // Go to login page
  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="upload-page">
      <Link to="/" className="logo-container" title="Go to Home Page">
        <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="app-logo" />
        <span className="logo-text">TraceMate</span>
      </Link>
      
      {showLoginPrompt ? (
        <div className="login-prompt">
          <h2>Get the Most Out of TraceMate</h2>
          <p>
            {sessionLimitService.hasReachedDailyLimitSync() ? 
              `You've reached your daily limit of 5 free sessions. Premium users enjoy unlimited sessions!` : 
              `Free users have a 1-minute time limit per session and 5 sessions per day. Premium users enjoy unlimited tracing!`
            }
          </p>
          
          <div className="account-options">
            <div className="account-option">
              <h3>Continue as Free User</h3>
              <ul>
                <li>1-minute session limit</li>
                <li>5 sessions per day</li>
                <li>Basic features</li>
              </ul>
              {sessionLimitService.hasReachedDailyLimitSync() ? (
                <div className="limit-reached">
                  <span className="limit-icon">⚠️</span>
                  <span>Daily limit reached</span>
                  <div className="sessions-info">
                    {sessionLimitService.getSessionsUsedTodaySync()}/5 sessions used today
                  </div>
                </div>
              ) : (
                <button className="free-button" onClick={handleContinueAsFree}>
                  Continue Free
                  <div className="sessions-left">
                    {sessionLimitService.getRemainingSessionsTodaySync()} sessions left today
                  </div>
                </button>
              )}
            </div>
            
            <div className="account-option premium">
              <div className="popular-tag">Recommended</div>
              <h3>Get Premium</h3>
              <ul>
                <li>Unlimited session time</li>
                <li>Unlimited daily sessions</li>
                <li>All premium features</li>
              </ul>
              <button className="premium-button" onClick={handleGoToLogin}>Login or Subscribe</button>
            </div>
          </div>
        </div>
      ) : isCheckingPermission ? (
        <div className="loading-message">
          <p>🔍 Checking camera access...</p>
        </div>
      ) : cameraPermission === 'granted' ? (
        <>
          <div className="instructions">
            <h2>🚀 How to use TraceMate:</h2>
            <ol>
              <li>📤 Upload an image you want to trace or reference</li>
              <li>🎯 Position the image over your camera feed</li>
              <li>👆 Use touch or mouse to move, rotate, and scale the image</li>
              <li>🎚️ Adjust opacity and other settings using the control panel</li>
              <li>🎨 Create your artwork by tracing over the image</li>
            </ol>
          </div>
          
          {/* Upload button positioned directly under the instructions */}
          <button className="upload-button" onClick={handleUploadClick}>
            📷 Upload Image
          </button>
          
          {isPremiumUser ? (
            <div className="premium-badge">
              <span className="premium-icon">⭐</span> Welcome Premium User! Enjoy Unlimited Sessions
            </div>
          ) : authService.isLoggedInSync() ? (
            <div className="user-status-container">
              <div className="logged-in-badge">
                <div className="logged-in-badge-icon">👤</div>
                <div className="logged-in-badge-text">
                  <span className="logged-in-badge-label">LOGGED IN</span>
                  <span className="logged-in-badge-message">Welcome back!</span>
                </div>
              </div>
              <div className="auth-options">
                <Link to="/payment" className="upgrade-button">
                  <span className="upgrade-icon">⭐</span>
                  <span>Upgrade to Premium</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="user-status-container">
              <div className="free-badge">
                <div className="free-badge-icon">⏱️</div>
                <div className="free-badge-text">
                  <span className="free-badge-label">FREE USER</span>
                  <span className="free-badge-limit">1 Minute Session Limit</span>
                </div>
              </div>
              
              <div className="auth-options">
                <Link to="/payment" className="upgrade-button">
                  <span className="upgrade-icon">⭐</span>
                  <span>Upgrade</span>
                </Link>
                <div className="or-separator">or</div>
                <Link to={isLoggedIn ? "/app" : "/login"} className="signin-button">
                  <span className="signin-icon">👤</span>
                  <span>{isLoggedIn ? "Go to App" : "Sign In"}</span>
                </Link>
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      ) : (
        <div className="camera-permission">
          <div className="permission-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>📷 Camera Access Required</h2>
          <p>📱 TraceMate needs access to your camera to work properly. Please grant camera permission to continue.</p>
          <button className="permission-button" onClick={handleRequestPermission}>
            🔓 Grant Camera Access
          </button>
        </div>
      )}
      <div className="credit-line">Made by Saif Elleuchi</div>
    </div>
  );
};

export default UploadPage;