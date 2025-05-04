import { useState, useEffect, useCallback } from 'react';

const useFullscreen = (elementRef: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (elementRef.current?.requestFullscreen) {
        elementRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => { /* Handle fullscreen error silently */ });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(() => { /* Handle exit fullscreen error silently */ });
      }
    }
  }, [elementRef]);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return { isFullscreen, toggleFullscreen };
};

export default useFullscreen;