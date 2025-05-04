import React, { useRef, useEffect } from 'react';

interface CameraViewProps {
  stream: MediaStream | null;
}

const CameraView: React.FC<CameraViewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className="camera-view"
      autoPlay
      playsInline
      muted
    />
  );
};

export default CameraView;