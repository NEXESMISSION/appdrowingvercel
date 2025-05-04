import { useState, useEffect, useCallback, useRef } from 'react';
import { OverlaySettings } from '../types';

interface Point {
  x: number;
  y: number;
}

interface TouchState {
  initialTouches?: Touch[];
  initialDistance?: number;
  initialAngle?: number;
  initialSettings?: OverlaySettings;
  lastTouchTime?: number;
  touchMode?: string; // Using string type to avoid TypeScript comparison issues
}

const useImageInteraction = (
  initialSettings: OverlaySettings,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const [settings, setSettings] = useState<OverlaySettings>(initialSettings);
  const [isDragging, setIsDragging] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({});
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  
  // Use refs for performance optimization
  const settingsRef = useRef(settings);
  
  // Keep refs in sync with state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Calculate distance between two points (for pinch zoom)
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Calculate angle between two points (for rotation)
  const getAngle = (touch1: Touch, touch2: Touch): number => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  };

  // Mouse handlers
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target instanceof HTMLImageElement && 
        e.target.classList.contains('image-overlay')) {
      setIsDragging(true);
      setLastPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && lastPoint) {
      const deltaX = e.clientX - lastPoint.x;
      const deltaY = e.clientY - lastPoint.y;
      
      setSettings(prev => ({
        ...prev,
        positionX: prev.positionX + deltaX,
        positionY: prev.positionY + deltaY
      }));
      
      setLastPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, [isDragging, lastPoint]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPoint(null);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.target instanceof HTMLImageElement && 
        e.target.classList.contains('image-overlay')) {
      // Prevent the default scroll behavior
      e.preventDefault();
      
      // Scale factor - adjust as needed for sensitivity
      const scaleFactor = 0.05;
      const scaleChange = e.deltaY < 0 ? scaleFactor : -scaleFactor;
      
      setSettings(prev => ({
        ...prev,
        scale: Math.max(0.1, prev.scale + scaleChange)
      }));
    }
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.target instanceof HTMLImageElement &&
      e.target.classList.contains('image-overlay')) {
      e.preventDefault(); // Prevent default touch behavior

      if (e.touches.length === 1) {
        // Single touch - regular drag
        const touch = e.touches[0];
        setIsDragging(true);
        setLastPoint({ x: touch.clientX, y: touch.clientY });
        setTouchState({
          touchMode: 'drag',
          initialSettings: { ...settingsRef.current },
          initialTouches: Array.from(e.touches),
          lastTouchTime: Date.now()
        });
      } else if (e.touches.length === 2) {
        // Two finger gesture - pinch zoom or rotation
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const initialDistance = getDistance(touch1, touch2);
        const initialAngle = getAngle(touch1, touch2);
        
        setTouchState({
          touchMode: 'pinch', // Start with pinch, may change to rotate
          initialDistance,
          initialAngle,
          initialSettings: { ...settingsRef.current },
          initialTouches: Array.from(e.touches),
          lastTouchTime: Date.now()
        });
      }
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.touchMode) return;

    e.preventDefault(); // Prevent default touch behavior

    if (touchState.touchMode === 'drag') {
      // Regular drag
      if (e.touches.length !== 1 || !lastPoint) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPoint.x;
      const deltaY = touch.clientY - lastPoint.y;

      setSettings(prev => ({
        ...prev,
        positionX: prev.positionX + deltaX,
        positionY: prev.positionY + deltaY
      }));

      setLastPoint({ x: touch.clientX, y: touch.clientY });
    } else if (touchState.touchMode === 'pinch' && e.touches.length === 2) {
      // Pinch zoom or rotation
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = getDistance(touch1, touch2);
      const currentAngle = getAngle(touch1, touch2);

      // Calculate scale change
      const scaleChange = currentDistance / touchState.initialDistance!;
      const newScale = touchState.initialSettings!.scale * scaleChange;

      // Calculate rotation change
      const rotationChange = currentAngle - touchState.initialAngle!;

      // Handle significant rotation
      if (Math.abs(rotationChange) > 10) {
        // Apply rotation and update mode
        setSettings(prev => ({
          ...prev,
          rotation: touchState.initialSettings!.rotation + rotationChange
        }));
        
        // Update mode to rotation
        if (touchState.touchMode && touchState.touchMode.toString() !== 'rotate') {
          setTouchState({
            ...touchState,
            touchMode: 'rotate'
          });
        }
      } 
      // Handle tilt for small rotation changes in pinch mode
      else if (Math.abs(rotationChange) < 5) {
        // Handle tilt (3D perspective)
        const tiltXChange = (currentDistance - touchState.initialDistance!) / 10;
        const tiltYChange = rotationChange / 2;
        
        setSettings(prev => ({
          ...prev,
          tiltX: touchState.initialSettings!.tiltX + tiltXChange,
          tiltY: touchState.initialSettings!.tiltY + tiltYChange
        }));
      } 
      // Default pinch behavior (scale)
      else {
        setSettings(prev => ({
          ...prev,
          scale: Math.max(0.1, newScale)
        }));
      }
    } else if (touchState.touchMode === 'rotate' && e.touches.length === 2) {
      // Handle rotation mode
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentAngle = getAngle(touch1, touch2);
      const rotationChange = currentAngle - touchState.initialAngle!;
      
      setSettings(prev => ({
        ...prev,
        rotation: touchState.initialSettings!.rotation + rotationChange
      }));
    }
  }, [isDragging, lastPoint, touchState, getDistance, getAngle]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastPoint(null);
    setTouchState({});
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      // Mouse events
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('wheel', handleWheel, { passive: false });

      // Touch events
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      // Cleanup
      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('wheel', handleWheel);

        container.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  ]);

  return {
    settings,
    setSettings
  };
};

export default useImageInteraction;
