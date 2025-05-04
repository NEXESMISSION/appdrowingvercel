import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraDevice } from '../types';

const useCameraHook = (initialDeviceId?: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(initialDeviceId);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [retryCount, setRetryCount] = useState(0);
  
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

  // Check if permission was previously granted
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if we have stored permission status
        const storedPermission = localStorage.getItem('cameraPermissionGranted');
        if (storedPermission === 'true') {
          setPermissionGranted(true);
          setPermissionState('granted');
        }
        
        // Check current permissions
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permissions.state as 'prompt' | 'granted' | 'denied');
        
        if (permissions.state === 'granted') {
          setPermissionGranted(true);
          localStorage.setItem('cameraPermissionGranted', 'true');
        } else if (permissions.state === 'denied') {
          setPermissionGranted(false);
          setError('Camera permission denied. Please enable camera access in your browser settings.');
        }
      } catch (err) {
        // Some browsers don't support permissions API, fall back to getUserMedia
        console.log('Permissions API not supported, will check on camera access');
      }
    };
    
    checkPermission();
  }, []);

  const getDevices = useCallback(async () => {
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
      if (!currentDeviceIdRef.current && videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      setError('Failed to enumerate devices');
      console.error('Error getting media devices:', err);
      return [];
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      // Stop all tracks in the current stream
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        stopCamera();
      }

      if (!isActiveRef.current) return null;

      setError(null); // Clear any previous errors
      
      console.log('Starting camera with deviceId:', deviceId || 'default');
      
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

      console.log('Using constraints:', JSON.stringify(constraints));
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      // Check if we have video tracks
      if (mediaStream.getVideoTracks().length === 0) {
        throw new Error('No video tracks found in the camera stream');
      }
      
      // Log video track info
      const videoTrack = mediaStream.getVideoTracks()[0];
      console.log('Video track:', videoTrack.label, 'enabled:', videoTrack.enabled);
      
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setError(null);
      setPermissionGranted(true);
      
      // Store permission status
      localStorage.setItem('cameraPermissionGranted', 'true');

      // If we don't have device info yet, get it now
      if (devices.length === 0) {
        await getDevices();
      }
      
      return mediaStream;
    } catch (err: any) {
      setPermissionGranted(false);
      setError(`Failed to access camera: ${err.message || 'Unknown error'}`);
      console.error('Error accessing camera:', err);
      return null;
    }
  }, [devices.length, getDevices, stopCamera]);

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

  // Request camera permission explicitly
  const requestPermission = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setPermissionGranted(true);
      setPermissionState('granted');
      localStorage.setItem('cameraPermissionGranted', 'true');
      return true;
    } catch (err) {
      setPermissionGranted(false);
      setPermissionState('denied');
      setError('Failed to get camera permission');
      return false;
    }
  }, []);

  // Retry camera initialization if it fails
  useEffect(() => {
    if (error && retryCount < 3 && isActive && permissionGranted !== false) {
      const timer = setTimeout(() => {
        console.log(`Retrying camera initialization (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        startCamera(currentDeviceIdRef.current);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, isActive, permissionGranted, startCamera]);

  // Initial camera setup - only run once when component mounts
  useEffect(() => {
    // Only start if permission was granted or not yet checked
    if (isActive && permissionGranted !== false) {
      console.log('Initial camera setup with deviceId:', currentDeviceId || 'default');
      startCamera(currentDeviceId);
    }

    // Cleanup function
    return () => {
      stopCamera();
    };
  }, [permissionGranted]); // Only depend on permissionGranted to avoid re-running

  // Add a visibility change listener to stop the camera when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden, stopping camera');
        stopCamera();
      } else if (isActiveRef.current && permissionGranted !== false) {
        console.log('Page visible, resuming camera');
        startCamera(currentDeviceIdRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [permissionGranted, startCamera, stopCamera]);

  return {
    stream,
    devices,
    currentDeviceId,
    error,
    permissionGranted,
    permissionState,
    isActive,
    switchCamera,
    refreshDevices: getDevices,
    stopCamera,
    pauseCamera,
    resumeCamera,
    requestPermission
  };
};

export default useCameraHook;
