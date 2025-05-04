import React, { useEffect, useRef, useState } from 'react';
import { OverlaySettings } from '../types';

interface ImageOverlayProps {
  imageUrl: string;
  settings: OverlaySettings;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ imageUrl, settings }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { opacity, scale, positionX, positionY, rotation, tiltX, tiltY } = settings;
  const [showHint, setShowHint] = useState(true);

  const overlayStyle: React.CSSProperties = {
    opacity,
    transform: `translate(calc(-50% + ${positionX}px), calc(-50% + ${positionY}px)) 
                scale(${scale}) 
                rotate(${rotation}deg) 
                perspective(1000px) 
                rotateX(${tiltX}deg) 
                rotateY(${tiltY}deg)`,
    cursor: 'move',
    touchAction: 'none', // Prevents browser handling of touch events
  };

  // Control points rendering has been removed as requested

  return (
    <div className="overlay-container" ref={overlayRef}>
      <img
        src={imageUrl}
        alt="Overlay"
        className="image-overlay"
        style={overlayStyle}
        draggable="false" // Prevents default drag behavior
      />
      {showHint && (
        <div className="overlay-hint">
          <span>Drag to move • Pinch to zoom • Rotate with two fingers</span>
          <button 
            className="hint-close-button" 
            onClick={() => setShowHint(false)}
            aria-label="Close hint"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageOverlay;