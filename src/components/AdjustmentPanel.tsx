import React, { useState, useEffect, useRef } from 'react';
import { OverlaySettings, CameraDevice } from '../types';

interface AdjustmentPanelProps {
  visible: boolean;
  settings: OverlaySettings;
  onSettingsChange: (settings: Partial<OverlaySettings>) => void;
  devices: CameraDevice[];
  currentDeviceId?: string;
  onDeviceChange: (deviceId: string) => void;
  onClose: () => void;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  visible,
  settings,
  onSettingsChange,
  devices,
  currentDeviceId,
  onDeviceChange,
  onClose
}) => {
  // Local state for slider values to make them smoother
  const [localSettings, setLocalSettings] = useState(settings);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Handle outside clicks to close the panel
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Only process if panel is visible
      if (!visible) return;
      
      // Check if the click was outside the panel
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add event listener when panel is visible
    if (visible) {
      // Use a small delay to prevent immediate closing when opening the panel
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick as EventListener);
      }, 100);
      
      // Cleanup function
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick as EventListener);
      };
    }
    
    return undefined;
  }, [visible, onClose]);
  
  // Handle slider change with debounce
  const handleSliderChange = (key: keyof OverlaySettings, value: number) => {
    // Update local state immediately for smooth UI
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Update parent state (this will eventually update props)
    onSettingsChange({ [key]: value });
  };

  const handleReset = () => {
    onSettingsChange({
      opacity: 0.5,
      scale: 0.8,
      positionX: 0,
      positionY: 0,
      rotation: 0,
      tiltX: 0,
      tiltY: 0
    });
  };

  return (
    <div className={`adjustment-panel ${visible ? 'visible' : ''}`} ref={panelRef}>
      <div className="panel-header">
        <button className="close-panel-button" onClick={onClose} aria-label="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="ultra-compact-sliders">
        {/* Opacity at the top */}
        <div className="opacity-slider">
          <div className="slider-mini">
            <label title="Opacity">
              <span className="slider-icon">👁️</span>
              <span className="slider-label">Opacity</span>
            </label>
            <input
              type="range"
              className="slider"
              min="0"
              max="1"
              step="0.01"
              value={localSettings.opacity}
              onChange={(e) => handleSliderChange('opacity', parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        {/* 3x2 Grid for other controls */}
        <div className="slider-grid">
          {/* Row 1, Column 1: Scale */}
          <div className="slider-mini">
            <label title="Scale">
              <span className="slider-icon">🔍</span>
              <span className="slider-label">Scale</span>
            </label>
            <input
              type="range"
              className="slider"
              min="0.1"
              max="3"
              step="0.01"
              value={localSettings.scale}
              onChange={(e) => handleSliderChange('scale', parseFloat(e.target.value))}
            />
          </div>
          
          {/* Row 1, Column 2: Position X */}
          <div className="slider-mini">
            <label title="Position X">
              <span className="slider-icon">↔️</span>
              <span className="slider-label">Move X</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-300"
              max="300"
              value={localSettings.positionX}
              onChange={(e) => handleSliderChange('positionX', parseInt(e.target.value))}
            />
          </div>
          
          {/* Row 1, Column 3: Position Y */}
          <div className="slider-mini">
            <label title="Position Y">
              <span className="slider-icon">↕️</span>
              <span className="slider-label">Move Y</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-300"
              max="300"
              value={localSettings.positionY}
              onChange={(e) => handleSliderChange('positionY', parseInt(e.target.value))}
            />
          </div>

          {/* Row 2, Column 1: Rotation */}
          <div className="slider-mini">
            <label title="Rotation">
              <span className="slider-icon">🔄</span>
              <span className="slider-label">Rotate</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-180"
              max="180"
              value={localSettings.rotation}
              onChange={(e) => handleSliderChange('rotation', parseInt(e.target.value))}
            />
          </div>

          {/* Row 2, Column 2: Tilt X */}
          <div className="slider-mini">
            <label title="Tilt X">
              <span className="slider-icon">↩️</span>
              <span className="slider-label">Tilt X</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-45"
              max="45"
              value={localSettings.tiltX}
              onChange={(e) => handleSliderChange('tiltX', parseInt(e.target.value))}
            />
          </div>
          
          {/* Row 2, Column 3: Tilt Y */}
          <div className="slider-mini">
            <label title="Tilt Y">
              <span className="slider-icon">↪️</span>
              <span className="slider-label">Tilt Y</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-45"
              max="45"
              value={localSettings.tiltY}
              onChange={(e) => handleSliderChange('tiltY', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        {/* Reset button */}
        <div className="reset-mini">
          <button className="reset-button-mini" onClick={handleReset} title="Reset All Settings">
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div className="panel-footer">
        {devices.length > 1 && (
          <button className="flip-camera-button" onClick={() => {
            // Find the next camera in the list
            const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % devices.length;
            onDeviceChange(devices[nextIndex].deviceId);
          }} aria-label="Flip camera" title="Switch Camera">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="camera-name">{devices.find(d => d.deviceId === currentDeviceId)?.label || `Camera ${devices.findIndex(d => d.deviceId === currentDeviceId) + 1}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdjustmentPanel;