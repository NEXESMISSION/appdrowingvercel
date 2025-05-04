import { useState, useEffect, useCallback } from 'react';
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
}

const useImageInteraction = (
  initialSettings: OverlaySettings,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const [settings, setSettings] = useState<OverlaySettings>(initialSettings);
  const [isDragging, setIsDragging] = useState(false);
  const [touchState, setTouchState] = useState<TouchState>({});
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

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
      e.preventDefault();
      
      const touches = Array.from(e.touches);
      
      if (touches.length === 1) {
        // Single touch - start drag
        setIsDragging(true);
        setLastPoint({ x: touches[0].clientX, y: touches[0].clientY });
      } 
      else if (touches.length === 2) {
        // Two touches - start pinch/rotate
        const initialDistance = getDistance(touches[0], touches[1]);
        const initialAngle = getAngle(touches[0], touches[1]);
        
        setTouchState({
          initialTouches: touches,
          initialDistance,
          initialAngle,
          initialSettings: { ...settings }
        });
      }
    }
  }, [settings]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Always prevent default to ensure smooth touch handling
    e.preventDefault();
    
    const touches = Array.from(e.touches);
    
    if (touches.length === 1 && isDragging && lastPoint) {
      // Single touch - drag
      const deltaX = touches[0].clientX - lastPoint.x;
      const deltaY = touches[0].clientY - lastPoint.y;
      
      setSettings(prev => ({
        ...prev,
        positionX: prev.positionX + deltaX,
        positionY: prev.positionY + deltaY
      }));
      
      setLastPoint({ x: touches[0].clientX, y: touches[0].clientY });
    } 
    else if (touches.length === 2 && touchState.initialTouches && 
             touchState.initialDistance && touchState.initialAngle && 
             touchState.initialSettings) {
      // Two touches - handle pinch and rotate
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentAngle = getAngle(touches[0], touches[1]);
      
      // Calculate scale change
      const scaleChange = currentDistance / touchState.initialDistance;
      const newScale = touchState.initialSettings.scale * scaleChange;
      
      // Calculate rotation change
      const rotationChange = currentAngle - touchState.initialAngle;
      const newRotation = touchState.initialSettings.rotation + rotationChange;
      
      // Calculate tilt based on finger positions
      // This is a simple implementation that can be refined
      const tiltXChange = (touches[0].clientY - touchState.initialTouches[0].clientY + 
                          touches[1].clientY - touchState.initialTouches[1].clientY) / 10;
      const tiltYChange = (touches[0].clientX - touchState.initialTouches[0].clientX + 
                          touches[1].clientX - touchState.initialTouches[1].clientX) / 10;
      
      setSettings(prev => ({
        ...prev,
        scale: Math.max(0.1, newScale),
        rotation: newRotation,
        // Optional: update tilt based on finger movement
        // tiltX: touchState.initialSettings.tiltX + tiltXChange,
        // tiltY: touchState.initialSettings.tiltY + tiltYChange
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
