// This script runs immediately before any content loads
(function() {
  // Set dark background on html and body elements immediately
  document.documentElement.style.backgroundColor = '#111827';
  document.documentElement.style.color = '#ffffff';
  
  // Create and inject a style element with highest priority styles
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root, div, section, header, footer, main {
      background-color: #111827 !important;
      color: #ffffff !important;
    }
    
    * {
      transition: none !important;
    }
  `;
  
  // Add the style element to the head
  document.head.appendChild(style);
})();
