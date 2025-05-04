import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  stream: MediaStream | null;
}

const CameraView: React.FC<CameraViewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
      } catch (err) {
        // Handle error attaching stream silently
        setHasError(true);
      }
    } else if (!stream) {
      setIsLoading(true);
    }
  }, [stream]);
  
  const handleCanPlay = () => {
    setIsLoading(false);
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // Handle video error silently
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
          <span>Initializing camera...</span>
        </div>
      )}
      {hasError && (
        <div className="camera-error">
          <span>Camera error. Please check permissions and try again.</span>
        </div>
      )}
    </div>
  );
};

export default CameraView;