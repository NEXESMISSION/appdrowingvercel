import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraDevice } from '../types';

// Define camera initialization strategies
type CameraStrategy = {
  name: string;
  constraints: MediaStreamConstraints;
};

const useCameraHook = (initialDeviceId?: string) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(initialDeviceId);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Use refs to track state without triggering re-renders
  const streamRef = useRef<MediaStream | null>(null);
  const isActiveRef = useRef(isActive);
  const currentDeviceIdRef = useRef(currentDeviceId);
  const initializingRef = useRef(false);
  
  // Keep refs in sync with state
  useEffect(() => {
    streamRef.current = stream;
    isActiveRef.current = isActive;
    currentDeviceIdRef.current = currentDeviceId;
    initializingRef.current = isInitializing;
  }, [stream, isActive, currentDeviceId, isInitializing]);

  // Define camera initialization strategies in order of preference
  const getCameraStrategies = useCallback((deviceId?: string): CameraStrategy[] => {
    return [
      // Strategy 1: Try with specific deviceId and high quality
      {
        name: 'Specific device with high quality',
        constraints: {
          video: deviceId ? { 
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } : {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }
      },
      // Strategy 2: Try with specific deviceId but no quality constraints
      {
        name: 'Specific device only',
        constraints: {
          video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' },
          audio: false
        }
      },
      // Strategy 3: Try with any camera, no specific constraints
      {
        name: 'Any camera',
        constraints: {
          video: true,
          audio: false
        }
      },
      // Strategy 4: Last resort - try with minimal constraints
      {
        name: 'Minimal constraints',
        constraints: {
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        }
      }
    ];
  }, []);

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
      
      console.log('Available video devices:', videoDevices.length);
      setDevices(videoDevices);
      
      // If no current device is set and we have devices, set the first one
      if (!currentDeviceIdRef.current && videoDevices.length > 0) {
        console.log('Setting default camera device:', videoDevices[0].deviceId);
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      setError('Failed to enumerate devices');
      return [];
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('Stopping camera tracks');
      // Stop all tracks in the current stream
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      streamRef.current = null;
    }
  }, []);

  // Try to get camera access using multiple strategies
  const tryGetUserMedia = useCallback(async (strategies: CameraStrategy[]): Promise<MediaStream | null> => {
    if (strategies.length === 0) {
      throw new Error('All camera initialization strategies failed');
    }
    
    const currentStrategy = strategies[0];
    const remainingStrategies = strategies.slice(1);
    
    try {
      console.log(`Trying camera strategy: ${currentStrategy.name}`);
      const stream = await navigator.mediaDevices.getUserMedia(currentStrategy.constraints);
      console.log(`Camera strategy successful: ${currentStrategy.name}`);
      return stream;
    } catch (err) {
      console.warn(`Camera strategy failed: ${currentStrategy.name}`, err);
      // Try next strategy
      return tryGetUserMedia(remainingStrategies);
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) {
      console.log('Camera already initializing, ignoring duplicate request');
      return null;
    }
    
    try {
      setIsInitializing(true);
      initializingRef.current = true;
      
      // Stop any existing stream first
      if (streamRef.current) {
        stopCamera();
      }

      if (!isActiveRef.current) {
        console.log('Camera not active, aborting initialization');
        setIsInitializing(false);
        initializingRef.current = false;
        return null;
      }

      setError(null); // Clear any previous errors
      console.log('Starting camera initialization process...');
      
      // Get all camera strategies to try
      const strategies = getCameraStrategies(deviceId);
      
      // Try strategies with timeout
      const timeoutPromise = new Promise<MediaStream | null>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Camera initialization timed out'));
        }, 10000); // 10 second timeout
      });
      
      // Race between camera initialization and timeout
      const mediaStream = await Promise.race([
        tryGetUserMedia(strategies),
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
      setRetryCount(0); // Reset retry count on success
      
      // Store permission status
      localStorage.setItem('cameraPermissionGranted', 'true');

      // If we don't have device info yet, get it now
      if (devices.length === 0) {
        await getDevices();
      }
      
      return mediaStream;
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setError(`Failed to access camera: ${err.message || 'Unknown error'}`);
      
      // Only set permission denied if we're sure it's a permission issue
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionGranted(false);
        setPermissionState('denied');
      }
      
      return null;
    } finally {
      setIsInitializing(false);
      initializingRef.current = false;
    }
  }, [devices.length, getDevices, stopCamera, getCameraStrategies, tryGetUserMedia]);

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
        // Retrying camera initialization
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
      // Initial camera setup
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
        // Page hidden, stopping camera
        stopCamera();
      } else if (isActiveRef.current && permissionGranted !== false) {
        // Page visible, resuming camera
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
