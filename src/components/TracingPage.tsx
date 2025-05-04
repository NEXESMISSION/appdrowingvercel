import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraView from './CameraView';
import ImageOverlay from './ImageOverlay';
import AdjustmentPanel from './AdjustmentPanel';
import AlignmentGuides from './AlignmentGuides';
import ControlBar from './ControlBar';
import useCamera from '../hooks/useCamera';
import useImageInteraction from '../hooks/useImageInteraction';
import { OverlaySettings } from '../types';

const TracingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [adjustmentsVisible, setAdjustmentsVisible] = useState(false);
  
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
  const { stream, devices, currentDeviceId, switchCamera, stopCamera } = useCamera();

  useEffect(() => {
    // Get the uploaded image URL from sessionStorage
    const storedImageUrl = sessionStorage.getItem('uploadedImage');
    
    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
    } else {
      // If no image is found, redirect back to upload page
      navigate('/');
    }

    // Clean up function
    return () => {
      // Revoke the object URL to free up memory
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      // Stop the camera when navigating away
      stopCamera();
    };
  }, [navigate, stopCamera]);

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
    navigate('/');
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

  return (
    <div className="tracing-page" ref={containerRef}>
      <div className="camera-container">
        <CameraView stream={stream} />
        
        {imageUrl && (
          <ImageOverlay
            imageUrl={imageUrl}
            settings={settings}
          />
        )}
        
        <AlignmentGuides />
        
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
      </div>
    </div>
  );
};

export default TracingPage;