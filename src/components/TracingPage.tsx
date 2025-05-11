import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CameraView from './CameraView';
import ImageOverlay from './ImageOverlay';
import AdjustmentPanel from './AdjustmentPanel';
import AlignmentGuides from './AlignmentGuides';
import ControlBar from './ControlBar';
import useCameraHook from '../hooks/useCameraHook';
import useImageInteraction from '../hooks/useImageInteraction';
import { OverlaySettings } from '../types';
import sessionLimitService from '../services/sessionLimitService';
import authService from '../services/authService';
import '../styles/SessionAlert.css';
import '../styles/Animations.css';
import '../styles/GlobalDarkTheme.css';
import '../styles/ModernEffects.css';
import '../styles/SessionLimit.css';
import '../styles/TracingPage.css';
import '../styles/CameraView.css';

const TracingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [adjustmentsVisible, setAdjustmentsVisible] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(60); // 60 seconds for free users
  const [showSessionAlert, setShowSessionAlert] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  
  // Initial settings with better default values
  const initialSettings: OverlaySettings = {
    opacity: 0.5, 
    scale: 0.8,
    positionX: 0,
    positionY: 0,
    rotation: 0,
    tiltX: 0,
    tiltY: 0
  };

  // Use our custom hook for image interaction
  const { settings, setSettings } = useImageInteraction(initialSettings, containerRef);
  
  // Get camera with enhanced controls
  const { stream, devices, currentDeviceId, switchCamera, stopCamera, error: cameraError, requestPermission } = useCameraHook();

  useEffect(() => {
    // Get the uploaded image URL from sessionStorage
    const storedImageUrl = sessionStorage.getItem('uploadedImage');
    
    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
    } else {
      // If no image is found, redirect back to upload page
      navigate('/');
    }

    // Check premium status from all storage mechanisms
    const checkAllStorageMechanisms = () => {
      // 1. Check sessionStorage first (fastest)
      const sessionPremiumStatus = sessionStorage.getItem('userPremiumStatus');
      if (sessionPremiumStatus === 'true') {
        setIsPremiumUser(true);
        return;
      }
      
      // 2. Check localStorage next
      const localPremiumStatus = localStorage.getItem('userPremiumStatus');
      if (localPremiumStatus === 'true') {
        setIsPremiumUser(true);
        return;
      }
      
      // 3. Check cookies
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('premium_status=true')) {
          setIsPremiumUser(true);
          return;
        }
      }
    };
    
    // Check all storage mechanisms immediately
    checkAllStorageMechanisms();
    
    // Also check premium status directly from Supabase for accuracy
    const checkPremiumStatus = async () => {
      try {
        // Use the authService to check premium status
        const isPremium = await authService.isPremiumUser();
        
        // Update all storage mechanisms and state
        localStorage.setItem('userPremiumStatus', String(isPremium));
        sessionStorage.setItem('userPremiumStatus', String(isPremium));
        document.cookie = `premium_status=${isPremium}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
        setIsPremiumUser(isPremium);
        
        console.log('TracingPage premium status check:', isPremium);
      } catch (error) {
        console.error('Error checking premium status in TracingPage:', error);
      }
    };
    
    // Check premium status from Supabase
    checkPremiumStatus();
    
    // Set up a listener for premium status updates
    const handlePremiumStatusUpdate = (event: CustomEvent) => {
      setIsPremiumUser(event.detail?.isPremium || false);
    };
    
    // Set up a listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userPremiumStatus') {
        setIsPremiumUser(event.newValue === 'true');
      }
    };
    
    // Set up an interval to check premium status regularly
    const checkInterval = setInterval(() => {
      const isPremium = authService.isPremiumUserSync();
      if (isPremium !== isPremiumUser) {
        setIsPremiumUser(isPremium);
      }
    }, 2000); // Check every 2 seconds
    
    // Add event listeners
    window.addEventListener('premiumStatusUpdated', handlePremiumStatusUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Clean up function
    return () => {
      // Revoke the object URL to free up memory
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      // Remove event listeners
      window.removeEventListener('premiumStatusUpdated', handlePremiumStatusUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
      
      // Stop the camera when navigating away
      stopCamera();
    };
  }, [navigate, stopCamera, isPremiumUser]);

  // Add an event listener for beforeunload to stop the camera
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopCamera();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopCamera]);

  const handleSettingsChange = (newSettings: Partial<OverlaySettings>) => {
    setSettings((prev: OverlaySettings) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const handleClose = () => {
    // Stop the camera before navigating away
    stopCamera();
    // Navigate to the app page instead of landing page so users can choose another image
    navigate('/app');
  };

  const handleDeviceChange = (deviceId: string) => {
    switchCamera(deviceId);
  };

  const toggleAdjustments = () => {
    setAdjustmentsVisible(prev => !prev);
  };
  
  const closeAdjustments = () => {
    setAdjustmentsVisible(false);
  };

  // Function to handle camera permission request
  const handleRequestCameraPermission = async () => {
    const result = await requestPermission();
    if (result) {
      console.log('Camera permission granted');
    } else {
      console.error('Failed to get camera permission');
    }
  };

  // Session timer for free users
  useEffect(() => {
    // Only start the timer for non-premium users
    if (!isPremiumUser) {
      const timer = setInterval(() => {
        setSessionTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setShowSessionAlert(true);
            
            // Automatically redirect after 5 seconds
            setTimeout(() => {
              stopCamera();
              navigate('/app');
            }, 5000);
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPremiumUser, navigate, stopCamera]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle subscription button click
  const handleSubscribe = () => {
    navigate('/payment');
  };

  // Handle go back button click
  const handleGoBack = () => {
    stopCamera();
    navigate('/app');
  };

  return (
    <div className={`tracing-page ${adjustmentsVisible ? 'with-panel' : ''}`} ref={containerRef}>
      <Link to="/" className="tracing-logo-container" title="Go to Home Page">
        <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="tracing-app-logo" />
        <span className="tracing-logo-text">TraceMate</span>
      </Link>
      <div className="camera-container">
        {cameraError && (
          <div className="camera-permission-overlay">
            <div className="camera-permission-content">
              <h3>Camera Access Required</h3>
              <p>{cameraError}</p>
              <button 
                className="camera-permission-button"
                onClick={handleRequestCameraPermission}
              >
                Grant Camera Access
              </button>
            </div>
          </div>
        )}
        <CameraView stream={stream} />
        
        {imageUrl && (
          <ImageOverlay
            imageUrl={imageUrl}
            settings={settings}
          />
        )}
        
        <AlignmentGuides />
        
        {showSessionAlert && (
          <div className="session-alert-overlay animate-fadeIn">
            <div className="session-alert animate-scaleInBounce">
              <h2 className="animate-fadeInDown delay-100">Session Time Expired</h2>
              <p className="animate-fadeInDown delay-200">Your free session has ended. Subscribe to get unlimited tracing time.</p>
              <p className="redirect-message animate-pulseOpacity delay-300">Redirecting to image selection in 5 seconds...</p>
              <div className="session-alert-buttons animate-fadeInUp delay-400">
                <button className="subscribe-button" onClick={handleSubscribe}>Subscribe Now</button>
                <button className="go-back-button" onClick={handleGoBack}>Choose Another Image</button>
              </div>
            </div>
          </div>
        )}
        
        <ControlBar
          onClose={handleClose}
          onToggleAdjustments={toggleAdjustments}
          adjustmentsVisible={adjustmentsVisible}
          devices={devices}
          currentDeviceId={currentDeviceId}
          onDeviceChange={handleDeviceChange}
        />
        
        <AdjustmentPanel
          visible={adjustmentsVisible}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          devices={devices}
          currentDeviceId={currentDeviceId}
          onDeviceChange={switchCamera}
          onClose={closeAdjustments}
        />
        
        {/* Session countdown positioned at the bottom center of the page */}
        {!isPremiumUser && (
          <>
            <div className="session-countdown">
              Session time: {formatTime(sessionTimeLeft)}
            </div>
            <div className="daily-session-count">
              {sessionLimitService.getSessionsUsedTodaySync()}/5 daily sessions used
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TracingPage;