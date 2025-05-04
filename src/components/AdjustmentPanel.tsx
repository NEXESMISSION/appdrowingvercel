import React from 'react';
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
        <h3>Image Adjustments</h3>
        <button className="close-panel-button" onClick={onClose} aria-label="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="compact-sliders">
        {/* Opacity slider */}
        <div className="slider-container">
          <label>
            Opacity
            <span>{Math.round(settings.opacity * 100)}%</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0"
            max="1"
            step="0.01"
            value={settings.opacity}
            onChange={(e) => onSettingsChange({ opacity: parseFloat(e.target.value) })}
          />
        </div>
        
        {/* Scale slider */}
        <div className="slider-container">
          <label>
            Scale
            <span>{Math.round(settings.scale * 100)}%</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0.1"
            max="3"
            step="0.01"
            value={settings.scale}
            onChange={(e) => onSettingsChange({ scale: parseFloat(e.target.value) })}
          />
        </div>
        
        {/* Position sliders in a row */}
        <div className="slider-row">
          <div className="slider-container half-width">
            <label>
              Position X
              <span>{Math.round(settings.positionX)}</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-300"
              max="300"
              value={settings.positionX}
              onChange={(e) => onSettingsChange({ positionX: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="slider-container half-width">
            <label>
              Position Y
              <span>{Math.round(settings.positionY)}</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-300"
              max="300"
              value={settings.positionY}
              onChange={(e) => onSettingsChange({ positionY: parseInt(e.target.value) })}
            />
          </div>
        </div>
        
        {/* Rotation slider */}
        <div className="slider-container">
          <label>
            Rotation
            <span>{Math.round(settings.rotation)}°</span>
          </label>
          <input
            type="range"
            className="slider"
            min="-180"
            max="180"
            value={settings.rotation}
            onChange={(e) => onSettingsChange({ rotation: parseInt(e.target.value) })}
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
              <span>{Math.round(settings.tiltX)}°</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-45"
              max="45"
              value={settings.tiltX}
              onChange={(e) => onSettingsChange({ tiltX: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="slider-container half-width">
            <label>
              Tilt Y
              <span>{Math.round(settings.tiltY)}°</span>
            </label>
            <input
              type="range"
              className="slider"
              min="-45"
              max="45"
              value={settings.tiltY}
              onChange={(e) => onSettingsChange({ tiltY: parseInt(e.target.value) })}
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
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="interaction-tip">
          <small>Tip: You can directly interact with the image using touch or mouse.</small>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentPanel;