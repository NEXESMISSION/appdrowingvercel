import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraDevice } from '../types';

const useCamera = (initialDeviceId?: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(initialDeviceId);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Use refs to track state without triggering re-renders
  const streamRef = useRef<MediaStream | null>(null);
  const isActiveRef = useRef(isActive);
  const currentDeviceIdRef = useRef(currentDeviceId);

  // Keep refs in sync with state
  useEffect(() => {
    streamRef.current = stream;
    isActiveRef.current = isActive;
    currentDeviceIdRef.current = currentDeviceId;
  }, [stream, isActive, currentDeviceId]);

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
      // Handle error getting media devices silently
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        stopCamera();
      }

      if (!isActiveRef.current) return null;

      setError(null); // Clear any previous errors

      // Create a timeout to detect if camera initialization is taking too long
      const timeoutPromise = new Promise<MediaStream | null>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Camera initialization timed out. Trying alternative approach...'));
        }, 5000); // 5 second timeout
      });

      // Start camera with deviceId
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: 'environment', // Prefer back camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
        audio: false
      };

      // Try to get the camera stream with a timeout
      const mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        timeoutPromise
      ]);

      // If we reach here, we have a valid mediaStream
      if (!mediaStream) {
        throw new Error('Failed to initialize camera stream');
      }

      // Check if we have video tracks
      if (mediaStream.getVideoTracks().length === 0) {
        throw new Error('No video tracks found in the camera stream');
      }

      // Log video track info
      const videoTrack = mediaStream.getVideoTracks()[0];
      console.log('Camera initialized successfully with track:', videoTrack.label);

      // Set the stream in state and ref
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setError(null);
      setPermissionGranted(true);

      // If we don't have device info yet, get it now
      if (devices.length === 0) {
        await getDevices();
      }

      return mediaStream;
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      
      // Try a fallback approach with simpler constraints
      try {
        console.log('Trying fallback camera initialization...');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        setStream(fallbackStream);
        streamRef.current = fallbackStream;
        setError(null);
        setPermissionGranted(true);
        return fallbackStream;
      } catch (fallbackErr) {
        console.error('Fallback camera initialization also failed:', fallbackErr);
        setPermissionGranted(false);
        setError(`Failed to access camera: ${err.message || 'Unknown error'}`);
        return null;
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      // Stop all tracks in the current stream
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        // Camera track stopped
      });
      setStream(null);
      streamRef.current = null;
    }
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    setCurrentDeviceId(deviceId);
    return await startCamera(deviceId);
  }, [startCamera]);

  const pauseCamera = useCallback(() => {
    setIsActive(false);
    stopCamera();
  }, [stopCamera]);

  const resumeCamera = useCallback(() => {
    setIsActive(true);
    startCamera(currentDeviceIdRef.current);
  }, [startCamera]);

  useEffect(() => {
    // Only start if permission was granted or not yet checked
    if (isActive && permissionGranted !== false) {
      // Initial camera setup
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
      } else if (isActiveRef.current) {
        startCamera(currentDeviceIdRef.current);
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
    permissionGranted,
    isActive,
    switchCamera,
    refreshDevices: getDevices,
    stopCamera,
    pauseCamera,
    resumeCamera
  };
};

export default useCamera;