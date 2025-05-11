// Enforce dark theme on all elements
document.addEventListener('DOMContentLoaded', function() {
  // Dark theme colors
  const darkBg = '#111827';
  const darkText = '#ffffff';
  
  // Function to enforce dark theme on all elements
  function enforceDarkTheme() {
    // Set body and html background
    document.body.style.backgroundColor = darkBg;
    document.body.style.color = darkText;
    document.documentElement.style.backgroundColor = darkBg;
    
    // Set root element background
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.backgroundColor = darkBg;
      rootElement.style.color = darkText;
      rootElement.style.minHeight = '100vh';
    }
    
    // Find all major containers and set their background
    const containers = [
      '.app',
      '.landing-page',
      '.upload-page',
      '.tracing-page',
      '.payment-page',
      '.login-page',
      '.hero-section',
      '.how-it-works-section',
      '.before-after-section',
      '.pricing-section',
      '.testimonials-section',
      '.faq-section',
      '.footer'
    ];
    
    containers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.backgroundColor = darkBg;
        el.style.color = darkText;
      });
    });
    
    // Allow certain elements to have transparent backgrounds
    const transparentElements = [
      'video',
      '.video-container',
      '.hero-video-container',
      '.video-wrapper',
      '.hero-overlay',
      '.gradient-overlay',
      '.particle-container',
      '.transparent-bg',
      'img',
      'svg'
    ];
    
    transparentElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.backgroundColor = 'transparent';
      });
    });
  }
  
  // Run immediately
  enforceDarkTheme();
  
  // Run again after a short delay to catch dynamically created elements
  setTimeout(enforceDarkTheme, 100);
  
  // Run again after page is fully loaded
  window.addEventListener('load', enforceDarkTheme);
  
  // Set up a mutation observer to detect new elements
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        enforceDarkTheme();
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
});
