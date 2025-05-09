// Script to replace the hero video with main.mp4
document.addEventListener('DOMContentLoaded', function() {
  // Find all video elements with hero-video class
  const heroVideos = document.querySelectorAll('.hero-video');
  
  // Replace the source of the hero video
  heroVideos.forEach(video => {
    const sources = video.querySelectorAll('source');
    sources.forEach(source => {
      // Replace only the hero section video, not the video demos
      if (video.closest('.hero')) {
        // Using main.mp4 from the assets directory
        source.setAttribute('src', '/assets/main.mp4');
        // Force the video to reload with the new source
        video.load();
      }
    });
  });
});
