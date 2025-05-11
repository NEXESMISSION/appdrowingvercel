import React, { useRef, useEffect, useState } from 'react';
import '../styles/CameraView.css';

interface CameraViewProps {
  stream: MediaStream | null;
}

const CameraView: React.FC<CameraViewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing camera...');
  const [initializationTime, setInitializationTime] = useState(0);
  const initTimeRef = useRef<number | null>(null);

  // Start tracking initialization time
  useEffect(() => {
    if (isLoading && !initTimeRef.current) {
      initTimeRef.current = Date.now();
      
      // Set up a timer to update the loading message
      const intervalId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - (initTimeRef.current || 0)) / 1000);
        setInitializationTime(elapsedTime);
        
        // Update loading message based on elapsed time
        if (elapsedTime > 10) {
          setLoadingMessage('Still working on camera access... This might take a moment.');
        } else if (elapsedTime > 5) {
          setLoadingMessage('Connecting to camera...');
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
    
    // Reset timer when loading completes
    if (!isLoading && initTimeRef.current) {
      initTimeRef.current = null;
    }
  }, [isLoading]);

  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        // Clean up any previous stream
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject = null;
        }
        
        // Set the new stream
        videoRef.current.srcObject = stream;
        setIsLoading(false);
        setHasError(false);
        console.log('Camera stream attached to video element successfully');
      } catch (err) {
        console.error('Error attaching stream to video element:', err);
        setHasError(true);
        setIsLoading(false);
      }
    } else if (!stream) {
      setIsLoading(true);
      setLoadingMessage('Initializing camera...');
    }
  }, [stream]);
  
  const handleCanPlay = () => {
    console.log('Camera video can play now');
    setIsLoading(false);
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video element error:', e);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="camera-view-container">
      <video
        ref={videoRef}
        className={`camera-view ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
        autoPlay
        playsInline
        muted
        onCanPlay={handleCanPlay}
        onError={handleError}
      />
      {isLoading && !hasError && (
        <div className="camera-loading">
          <span>{loadingMessage}</span>
          {initializationTime > 3 && (
            <button 
              className="camera-retry-button"
              onClick={() => {
                // Force a reload of the video element
                if (videoRef.current && videoRef.current.srcObject) {
                  const currentStream = videoRef.current.srcObject as MediaStream;
                  videoRef.current.srcObject = null;
                  setTimeout(() => {
                    if (videoRef.current) videoRef.current.srcObject = currentStream;
                  }, 100);
                }
                // Reset initialization timer
                initTimeRef.current = Date.now();
                setInitializationTime(0);
                setLoadingMessage('Retrying camera initialization...');
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {hasError && (
        <div className="camera-error">
          <span>Camera error. Please check permissions and try again.</span>
          <button 
            className="camera-retry-button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              setLoadingMessage('Retrying camera initialization...');
              // Force a reload of the page's camera access
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraView;