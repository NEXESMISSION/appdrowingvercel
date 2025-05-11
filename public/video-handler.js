// Video handling script for TraceMate
document.addEventListener('DOMContentLoaded', function() {
  // Function to fix all videos and ensure they load properly
  function fixAllVideos() {
    console.log('Fixing all videos...');
    
    // Get all video elements
    const videos = document.querySelectorAll('video');
    console.log('Found ' + videos.length + ' videos');
    
    if (videos.length === 0) return;
    
    // Process each video
    videos.forEach(function(video, index) {
      try {
        console.log('Processing video #' + index);
        
        // First, pause any playing videos to prevent errors
        try {
          if (!video.paused) {
            video.pause();
          }
        } catch (e) {
          console.log('Error pausing video:', e);
        }
        
        // Only update the hero video to use main.mp4
        if (video.classList.contains('hero-video')) {
          // Find all source elements within this video
          const sources = video.querySelectorAll('source');
          if (sources.length > 0) {
            sources.forEach(function(source) {
              source.src = '/assets/main.mp4';
            });
            // Force reload
            video.load();
          } else {
            // If no source elements, set src directly
            video.src = '/assets/main.mp4';
          }
        } else if (video.classList.contains('step-video')) {
          // Keep the original sources for step videos
          const sources = video.querySelectorAll('source');
          if (sources.length === 0 && !video.src) {
            // Fallback if no sources
            const videoNum = (index % 3) + 1;
            video.src = '/assets/vd/video' + videoNum + '.mp4';
          }
        }
        
        // Set essential attributes
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.controls = false;
        
        // Style based on video type
        if (video.classList.contains('hero-video')) {
          // Hero video styling
          video.style.objectFit = 'cover';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.position = 'absolute';
          video.style.top = '0';
          video.style.left = '0';
        } else if (video.classList.contains('step-video')) {
          // Step video styling
          video.style.objectFit = 'cover';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.borderRadius = '8px';
        }
        
        // Make video visible
        video.style.display = 'block';
        video.style.opacity = '1';
        
        // Try to play the video with error handling
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(function(error) {
              console.log('Auto-play prevented:', error);
              // We'll try again when user interacts with the page
              document.addEventListener('click', function() {
                video.play().catch(function(e) {
                  console.log('Still cannot play video:', e);
                });
              }, { once: true });
            });
          }
        } catch (e) {
          console.log('Error playing video:', e);
        }
      } catch (error) {
        console.log('Error processing video #' + index + ':', error);
      }
    });
  }
  
  // Observer for new videos added to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        console.log('New videos detected in added DOM node, fixing them...');
        fixAllVideos();
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial fix
  fixAllVideos();
  
  // Fix again after a short delay to catch any videos loaded after initial render
  setTimeout(fixAllVideos, 1000);
  
  // Fix again after page is fully loaded
  window.addEventListener('load', fixAllVideos);
  
  // Fix when user interacts with the page
  document.addEventListener('click', function() {
    setTimeout(fixAllVideos, 100);
  }, { once: true });
});
