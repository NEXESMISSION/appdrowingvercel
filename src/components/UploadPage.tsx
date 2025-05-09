import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  // Check camera permission on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

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
      
      // Navigate to the tracing page
      navigate('/tracing');
    }
  };

  return (
    <div className="upload-page">
      <div className="logo-container">
        <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="app-logo" />
        <span className="logo-text">TraceMate</span>
      </div>
      
      {isCheckingPermission ? (
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
          
          <button className="upload-button" onClick={handleUploadClick}>
            📷 Upload Image
          </button>
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