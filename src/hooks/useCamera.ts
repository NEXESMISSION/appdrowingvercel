import { useState, useEffect } from 'react';
import { CameraDevice } from '../types';

const useCamera = (initialDeviceId?: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(initialDeviceId);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const getDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
        }));
      
      setDevices(videoDevices);
      
      // If no current device is set and we have devices, set the first one
      if (!currentDeviceId && videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Failed to enumerate devices');
      console.error('Error getting media devices:', err);
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      // Stop any existing stream first
      stopCamera();

      if (!isActive) return;

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setError(null);

      // If we don't have device info yet, get it now
      if (devices.length === 0) {
        await getDevices();
      }
    } catch (err) {
      setError('Failed to access camera');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      // Stop all tracks in the current stream
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setCurrentDeviceId(deviceId);
    await startCamera(deviceId);
  };

  const pauseCamera = () => {
    setIsActive(false);
    stopCamera();
  };

  const resumeCamera = () => {
    setIsActive(true);
    startCamera(currentDeviceId);
  };

  useEffect(() => {
    // Initial camera setup
    if (isActive) {
      startCamera(currentDeviceId);
    }

    // Cleanup function
    return () => {
      stopCamera();
    };
  }, [isActive]);

  // Add a visibility change listener to stop the camera when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (isActive) {
        startCamera(currentDeviceId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentDeviceId, isActive]);

  return {
    stream,
    devices,
    currentDeviceId,
    error,
    switchCamera,
    refreshDevices: getDevices,
    stopCamera,
    pauseCamera,
    resumeCamera
  };
};

export default useCamera;