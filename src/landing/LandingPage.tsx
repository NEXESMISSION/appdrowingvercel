import React, { useEffect } from 'react';
import NewLandingPage from './NewLandingPage';
import '../styles/GlobalDarkTheme.css';
import '../styles/ModernEffects.css';
import '../styles/Animations.css';

const LandingPage: React.FC = () => {
  // Add script to replace all video sources with main.mp4 as per user preference
  useEffect(() => {
    // Immediately replace all video sources with main.mp4
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      const sources = video.querySelectorAll('source');
      sources.forEach(source => {
        source.setAttribute('src', '/assets/main.mp4');
      });
    });
    
    // Also add a script to handle any dynamically added videos
    const script = document.createElement('script');
    script.innerHTML = `
      document.addEventListener('DOMContentLoaded', function() {
        // Function to replace video sources
        function replaceVideoSources() {
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
              source.setAttribute('src', '/assets/main.mp4');
            });
          });
        }
        
        // Initial replacement
        replaceVideoSources();
        
        // Set up a mutation observer to detect new videos
        const observer = new MutationObserver(function(mutations) {
          let shouldReplace = false;
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
              shouldReplace = true;
            }
          });
          
          if (shouldReplace) {
            replaceVideoSources();
          }
        });
        
        // Start observing the document
        observer.observe(document.body, { childList: true, subtree: true });
      });
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <NewLandingPage />;
};

export default LandingPage;
