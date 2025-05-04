import React, { useState, useEffect } from 'react';
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
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
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
    <div className={`adjustment-panel ${visible ? 'visible' : ''}`}>
      <div className="panel-header">
        {devices.length > 1 && (
          <button className="flip-camera-button" onClick={() => {
            // Find the next camera in the list
            const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % devices.length;
            onDeviceChange(devices[nextIndex].deviceId);
          }} aria-label="Flip camera">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
        <button className="close-panel-button" onClick={onClose} aria-label="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <h3 className="panel-title">Image Adjustments</h3>
      
      <div className="compact-sliders">
        {/* Opacity slider */}
        <div className="slider-container">
          <label>
            Opacity
            <span>{Math.round(localSettings.opacity * 100)}%</span>
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
        
        {/* Scale slider */}
        <div className="slider-container">
          <label>
            Scale
            <span>{Math.round(localSettings.scale * 100)}%</span>
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
        
        {/* Position sliders in a row */}
        <div className="slider-row">
          <div className="slider-container half-width">
            <label>
              Position X
              <span>{Math.round(localSettings.positionX)}</span>
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
          
          <div className="slider-container half-width">
            <label>
              Position Y
              <span>{Math.round(localSettings.positionY)}</span>
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
        </div>
        
        {/* Rotation slider */}
        <div className="slider-container">
          <label>
            Rotation
            <span>{Math.round(localSettings.rotation)}°</span>
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
        
        {/* Tilt controls section */}
        <div className="section-divider">
          <span>3D Perspective</span>
        </div>
        
        {/* Tilt sliders in a row */}
        <div className="slider-row">
          <div className="slider-container half-width">
            <label>
              Tilt X
              <span>{Math.round(localSettings.tiltX)}°</span>
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
          
          <div className="slider-container half-width">
            <label>
              Tilt Y
              <span>{Math.round(localSettings.tiltY)}°</span>
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
      </div>
      
      <div className="panel-footer">
        <button className="reset-button" onClick={handleReset}>
          Reset All
        </button>
        
        {devices.length > 1 && (
          <div className="camera-select-container">
            <label>Camera:</label>
            <select
              className="camera-select"
              value={currentDeviceId}
              onChange={(e) => onDeviceChange(e.target.value)}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="interaction-tip">
          <small>Tip: Drag to move, pinch to zoom, rotate with two fingers</small>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentPanel;