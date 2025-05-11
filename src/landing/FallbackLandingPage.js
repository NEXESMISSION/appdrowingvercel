import React, { useState, useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect';
import { useAuth } from '../context/AuthContext';

function FallbackLandingPage() {
  // Calculate user count based on date (adding 20-30 users per day since base date)
  const calculateUserCount = () => {
    const baseCount = 1593; // Starting count
    const baseDate = new Date('2025-01-01').getTime(); // Base date
    const today = new Date().getTime();
    const daysDifference = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
    
    // Generate a random number between 20-30 for each day, but make it deterministic for the same day
    let additionalUsers = 0;
    for (let i = 0; i < daysDifference; i++) {
      // Create a deterministic random number for each day
      const seed = new Date(baseDate + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const dailyIncrease = 20 + (seedNum % 11); // Random number between 20-30
      additionalUsers += dailyIncrease;
    }
    
    return baseCount + additionalUsers;
  };
  
  // Get auth state from context
  const { isLoggedIn } = useAuth();
  
  // State for testimonials and FAQs
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [userCount, setUserCount] = useState(calculateUserCount());
  const [isScrolled, setIsScrolled] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Refs for touch events
  const testimonialSliderRef = useRef(null);
  
  // Get current year for footer
  const currentYear = new Date().getFullYear();
  
  // Login status is now managed by AuthContext
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Example testimonial data
  const testimonials = [
    { 
      text: "Now my kids think I'm an art genius!",
      name: "Sarah K.",
      role: "Mom of 3" 
    },
    { 
      text: "My students are drawing with confidence thanks to TraceMate.",
      name: "Michael T.",
      role: "Art Teacher" 
    },
    { 
      text: "I can finally create my own comic book characters!",
      name: "Jason L.",
      role: "Aspiring Artist" 
    }
  ];

  // Example FAQ data
  const faqItems = [
    { 
      question: "How does it work?", 
      answer: "Your phone acts like a light projector. Trace the image right through the screen onto your paper." 
    },
    { 
      question: "Do I need special gear?", 
      answer: "Nope! Just your phone and a flat surface. (A glass cup or books can help hold it up.)" 
    },
    { 
      question: "Is it beginner-friendly?", 
      answer: "Yes! If you can hold a pencil, you can use TraceMate." 
    },
  ];
  
  // Handle touch events for testimonial slider
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextTestimonial();
    } else if (isRightSwipe) {
      prevTestimonial();
    }
    
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Function to get device type
  const isMobile = () => {
    return window.innerWidth <= 768;
  };
  
  // Navigation functions
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const toggleFAQ = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Add custom CSS for mobile testimonial dots and video placeholders
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        .testimonial-dot {
          width: 12px !important;
          height: 12px !important;
          min-width: 12px !important;
          min-height: 12px !important;
          border-radius: 50% !important;
          padding: 0 !important;
          margin: 0 8px !important;
          display: inline-block !important;
          appearance: none !important;
          -webkit-appearance: none !important;
        }
      }
      
      .video-container {
        position: relative;
      }
      
      .video-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        z-index: 2;
        transition: opacity 0.5s ease-in-out;
      }
      
      .video-placeholder.loaded {
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Handle video loading
  useEffect(() => {
    // Function to handle video loaded event
    const handleVideoLoaded = (videoId) => {
      const placeholder = document.getElementById(`placeholder-${videoId}`);
      if (placeholder) {
        placeholder.classList.add('loaded');
      }
    };
    
    // Set up video loading detection
    const setupVideoLoadDetection = () => {
      // For the hero video - use main.mp4 as per user preference
      const heroVideo = document.querySelector('.hero-main-video');
      if (heroVideo) {
        // Create an image element to preload the hero placeholder
        const preloadHeroImg = new Image();
        preloadHeroImg.onload = () => {
          // Once the placeholder is loaded, set it as the background for the placeholder
          const heroPlaceholder = document.getElementById('placeholder-hero');
          if (heroPlaceholder) {
            heroPlaceholder.style.backgroundImage = `url('${preloadHeroImg.src}')`;
          }
        };
        preloadHeroImg.src = '/assets/hero-placeholder.jpg';
        
        // Handle video loading
        heroVideo.addEventListener('loadeddata', () => handleVideoLoaded('hero'));
        // Fallback in case load event doesn't fire
        setTimeout(() => handleVideoLoaded('hero'), 3000);
      }
      
      // For the how-it-works videos
      const howItWorksVideos = document.querySelectorAll('.how-it-works-video');
      howItWorksVideos.forEach((video, index) => {
        // Create an image element to preload each placeholder
        const preloadImg = new Image();
        preloadImg.onload = () => {
          // Once the placeholder is loaded, set it as the background for the placeholder
          const placeholder = document.getElementById(`placeholder-how-it-works-${index + 1}`);
          if (placeholder) {
            placeholder.style.backgroundImage = `url('${preloadImg.src}')`;
          }
        };
        preloadImg.src = `/assets/step${index + 1}-placeholder.jpg`;
        
        // Handle video loading
        video.addEventListener('loadeddata', () => handleVideoLoaded(`how-it-works-${index + 1}`));
        // Fallback in case load event doesn't fire
        setTimeout(() => handleVideoLoaded(`how-it-works-${index + 1}`), 5000);
      });
    };
    
    // Run setup after a short delay to ensure DOM is ready
    const setupTimeout = setTimeout(setupVideoLoadDetection, 500);
    
    return () => {
      clearTimeout(setupTimeout);
    };
  }, []);
  
  // Add script to replace all hero video sources with main.mp4
  useEffect(() => {
    // Create a script element to inject our video source replacement code
    const script = document.createElement('script');
    script.innerHTML = `
      // Function to replace all hero video sources with main.mp4
      function replaceHeroVideoSources() {
        const heroVideo = document.querySelector('.hero-main-video');
        if (heroVideo) {
          heroVideo.src = '/assets/main.mp4';
        }
      }
      
      // Run on page load
      replaceHeroVideoSources();
      
      // Also run when DOM content is loaded
      document.addEventListener('DOMContentLoaded', replaceHeroVideoSources);
    `;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  // Define animations
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(255, 122, 0, 0.5); }
      50% { box-shadow: 0 0 20px rgba(255, 122, 0, 0.8); }
      100% { box-shadow: 0 0 5px rgba(255, 122, 0, 0.5); }
    }
  `;
  
  // Define responsive styles for videos and text sizes
  const responsiveStyles = `
    /* Video scaling for different aspect ratios */
    @media (max-width: 768px) {
      /* Mobile - prioritize height */
      .hero-video-container iframe {
        height: 120vh !important;
        width: auto !important;
        min-width: 100% !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(1.5) !important;
      }
      
      /* How It Works videos - more height without cropping */
      .how-it-works-video {
        height: auto !important;
        min-height: 300px !important;
        object-fit: contain !important;
      }
      
      /* Enhanced fade effects for mobile */
      .hero-top-fade {
        height: 40% !important;
        opacity: 1 !important;
        background: linear-gradient(to bottom, rgba(17, 24, 39, 1) 0%, rgba(17, 24, 39, 0.9) 30%, rgba(17, 24, 39, 0.7) 60%, rgba(17, 24, 39, 0) 100%) !important;
      }
      
      .hero-bottom-fade {
        height: 40% !important;
        opacity: 1 !important;
        background: linear-gradient(to top, rgba(17, 24, 39, 1) 0%, rgba(17, 24, 39, 0.9) 30%, rgba(17, 24, 39, 0.7) 60%, rgba(17, 24, 39, 0) 100%) !important;
      }
      
      h1 {
        font-size: 2rem !important;
      }
      
      h2 {
        font-size: 1.7rem !important;
      }
      
      h3 {
        font-size: 1.3rem !important;
      }
      
      p {
        font-size: 1.05rem !important;
      }
      
      .subtitle {
        font-size: 1.05rem !important;
      }
      
      .testimonial-text {
        font-size: 1.1rem !important;
      }
      
      .faq-question {
        font-size: 1.15rem !important;
      }
      
      .step-title {
        font-size: 1.3rem !important;
      }
      
      a.button, button {
        font-size: 0.9rem !important;
        padding: 10px 20px !important;
      }
    }
    
    /* For tablets */
    @media (min-width: 769px) and (max-width: 1024px) {
      .hero-video-container iframe {
        width: 100vw !important;
        height: auto !important;
        min-height: 100vh !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }
    
    /* For wide screens */
    @media (min-width: 1025px) {
      .hero-video-container iframe {
        width: 100vw !important;
        height: auto !important;
        min-height: 100vh !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }
    
    /* For ultra-wide screens */
    @media (min-width: 1600px) {
      .hero-video-container iframe {
        width: 100vw !important;
        height: auto !important;
        min-height: 100vh !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(1.3) !important;
      }
    }
  `;
  
  // Add style tag with animations and responsive styles to the document
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = keyframes + responsiveStyles;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  
  // Inline styles to ensure rendering without external CSS dependencies
  const styles = {
    pageContainer: {
      backgroundColor: '#111827',
      color: 'white',
      width: '100%',
      overflowX: 'hidden',
      fontFamily: 'Outfit, Poppins, Arial, sans-serif',
      backgroundImage: 'radial-gradient(circle at top right, rgba(255, 122, 0, 0.1), transparent 70%), radial-gradient(circle at bottom left, rgba(74, 159, 255, 0.1), transparent 70%)',
      position: 'relative',
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? '#111827' : 'transparent',
      boxShadow: isScrolled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      height: '45px',
      marginRight: '12px',
      filter: 'drop-shadow(0 0 8px rgba(74, 159, 255, 0.5))',
      transition: 'all 0.3s ease'
    },
    logoText: {
      fontSize: '26px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #4a9fff)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      textShadow: '0 0 15px rgba(74, 159, 255, 0.3)',
      letterSpacing: '0.5px'
    },
    section: {
      padding: '60px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    heroSection: {
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px'
    },
    heroVideoContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 1
    },
    heroVideo: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      opacity: 0.3,
      border: 'none'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      zIndex: 2
    },
    heroVideoFade: {
      position: 'absolute',
      left: 0,
      width: '100%',
      height: '20%',
      zIndex: 2,
      pointerEvents: 'none'
    },
    heroContent: {
      position: 'relative',
      zIndex: 3,
      maxWidth: '600px'
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '25px',
      lineHeight: 1.2,
      background: 'linear-gradient(135deg, #ffffff, #ff7a00)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      textShadow: '0 0 20px rgba(255, 122, 0, 0.3)',
      animation: 'fadeInUp 1s ease-out'
    },
    subtitle: {
      fontSize: '1.2rem',
      maxWidth: '600px',
      marginBottom: '30px',
      lineHeight: '1.5',
      color: '#e2e8f0'
    },
    button: {
      backgroundColor: '#ff7a00', // Changed to orange
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block',
      marginRight: '15px',
      boxShadow: '0 8px 20px rgba(255, 122, 0, 0.3)', // Changed shadow to match orange
      position: 'relative',
      overflow: 'hidden',
      animation: 'pulse 2s infinite'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: '1px solid white',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #ffffff, #ff7a00)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
      display: 'inline-block',
      textShadow: '0 0 15px rgba(255, 122, 0, 0.3)',
      animation: 'fadeIn 1.2s ease-out'
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      maxWidth: '700px',
      marginBottom: '50px',
      textAlign: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      color: '#e2e8f0'
    },
    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '50px'
    },
    stepItem: {
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '30px',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(74, 159, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    },
    stepTitle: {
      fontSize: '1.5rem',
      marginBottom: '15px',
      color: '#ff7a00',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(255, 122, 0, 0.3)'
    },
    stepVideoContainer: {
      width: '100%',
      height: '300px', /* Changed to 300px for 3:4 aspect ratio (assuming width is ~225px) */
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '20px',
      backgroundColor: '#111827',
      position: 'relative'
    },
    userCount: {
      textAlign: 'center',
      padding: '50px 40px',
      backgroundColor: '#1f2937',
      margin: '70px auto',
      borderRadius: '16px',
      maxWidth: '800px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25), 0 0 20px rgba(74, 159, 255, 0.2)',
      border: '1px solid rgba(74, 159, 255, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      width: 'calc(100% - 60px)' // Add margin on both sides
    },
    countNumber: {
      fontSize: '4.5rem',
      fontWeight: 'bold',
      color: '#ff7a00',
      margin: '20px 0',
      textShadow: '0 0 15px rgba(255, 122, 0, 0.5)',
      position: 'relative',
      animation: 'pulse 2s infinite'
    },
    beforeAfterSection: {
      padding: '80px 20px'
    },
    pricingSection: {
      padding: '80px 20px',
      backgroundColor: '#0f172a'
    },
    pricingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      maxWidth: '1000px',
      margin: '0 auto'
    },
    pricingCard: {
      backgroundColor: '#1f2937',
      borderRadius: '10px',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.3s ease',
      border: '1px solid #2d3748'
    },
    pricingCardPopular: {
      backgroundColor: '#1f2937',
      borderRadius: '10px',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.3s ease',
      border: '2px solid #4a9fff',
      position: 'relative',
      transform: 'scale(1.05)'
    },
    popularBadge: {
      position: 'absolute',
      top: '-12px',
      right: '20px',
      backgroundColor: '#4a9fff',
      color: 'white',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    pricingHeader: {
      marginBottom: '20px'
    },
    pricingTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    pricingPrice: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#4a9fff'
    },
    pricingDescription: {
      color: '#9ca3af',
      marginBottom: '20px'
    },
    pricingFeatures: {
      margin: '20px 0',
      flexGrow: 1
    },
    pricingFeature: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px'
    },
    checkIcon: {
      color: '#10b981',
      marginRight: '10px',
      fontSize: '1.2rem'
    },
    beforeAfterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px'
    },
    beforeAfterItem: {
      backgroundColor: '#1f2937',
      borderRadius: '10px',
      padding: '20px',
      textAlign: 'center'
    },
    beforeAfterImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '300px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '15px',
      display: 'block'
    },
    testimonialsSection: {
      padding: '80px 20px'
    },
    testimonialSlider: {
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative'
    },
    testimonialSlide: {
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '35px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(74, 159, 255, 0.1)',
      border: '1px solid rgba(74, 159, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    testimonialText: {
      fontSize: '1.2rem',
      fontStyle: 'italic',
      marginBottom: '20px',
      lineHeight: '1.6'
    },
    testimonialAuthor: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    testimonialRole: {
      fontSize: '0.9rem',
      color: '#9ca3af'
    },
    testimonialControls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '30px'
    },
    testimonialButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    testimonialDots: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '0 20px'
    },
    testimonialDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#4a4a4a',
      margin: '0 8px',
      cursor: 'pointer',
      border: 'none',
      minWidth: '12px',
      minHeight: '12px',
      display: 'inline-block',
      padding: 0
    },
    testimonialDotActive: {
      backgroundColor: '#4a9fff',
      transform: 'scale(1.2)',
      boxShadow: '0 0 8px rgba(74, 159, 255, 0.6)',
      width: '12px',
      height: '12px',
      borderRadius: '50%'
    },
    faqSection: {
      padding: '80px 20px'
    },
    faqItem: {
      marginBottom: '15px',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    faqQuestion: {
      backgroundColor: '#1f2937',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 'bold'
    },
    faqAnswer: {
      backgroundColor: '#374151',
      padding: '0',
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    faqAnswerActive: {
      padding: '15px 20px',
      maxHeight: '500px'
    },
    footer: {
      backgroundColor: '#0f172a',
      padding: '50px 20px',
      textAlign: 'center'
    },
    footerLogo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    footerLogoImage: {
      height: '40px',
      marginRight: '10px'
    },
    footerLogoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ffffff, #4a9fff)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent'
    },
    footerCopyright: {
      color: '#9ca3af',
      fontSize: '0.9rem'
    },
    // Media queries handled inline for mobile responsiveness
    mobileHide: {
      '@media (max-width: 768px)': {
        display: 'none'
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <img 
            src="/assets/logo-dark-bg.png" 
            alt="TraceMate Logo" 
            style={styles.logo}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={styles.logoText}>TraceMate</span>
        </div>
        {!isLoggedIn && (
          <a href="/login" style={styles.secondaryButton}>Sign In</a>
        )}
      </header>
      
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroVideoContainer} className="hero-video-container video-container">
          {/* Placeholder image that shows while video loads */}
          <div 
            id="placeholder-hero"
            className="video-placeholder"
            style={{
              backgroundImage: 'url("/assets/hero-placeholder.jpg")',
              backgroundColor: '#111827'
            }}
          ></div>
          <iframe 
            src="/assets/main.mp4" 
            style={styles.heroVideo}
            frameBorder="0" 
            allow="autoplay; fullscreen" 
            title="TraceMate Demo"
            loading="lazy"
            className="hero-main-video"
          ></iframe>
        </div>
        <div style={styles.heroOverlay}></div>
        
        {/* Top fade effect */}
        <div 
          style={{
            ...styles.heroVideoFade, 
            top: 0,
            background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0) 100%)',
          }} 
          className="hero-top-fade"
        ></div>
        
        {/* Bottom fade effect */}
        <div 
          style={{
            ...styles.heroVideoFade, 
            bottom: 0,
            background: 'linear-gradient(to top, rgba(17, 24, 39, 0.8) 0%, rgba(17, 24, 39, 0) 100%)',
          }}
          className="hero-bottom-fade"
        ></div>
        
        <div style={{...styles.section, ...styles.heroContent}}>
          <h1 style={styles.title}>
            <span>✨ </span>
            <Typewriter
              options={{
                strings: [
                  'Turn Your Phone into a Tracing Tool',
                  'Make Drawing Fun and Easy',
                  'Create Art Like a Pro',
                  'Master Drawing Techniques',
                  'Trace Any Image with Precision'
                ],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
              }}
            />
          </h1>
          <p style={styles.subtitle} className="subtitle">
            TraceMate makes drawing fun and frustration-free. Just load an image, trace it through your screen, and bring your art to life!
          </p>
          <div style={{display: 'flex', alignItems: 'center', marginTop: '30px'}}>
            <a href="/app" style={styles.button}>🎨 {isLoggedIn ? "Go to App" : "Try TraceMate"}</a>
            {!isLoggedIn && (
              <a href="/login" style={styles.secondaryButton}>Sign In</a>
            )}
          </div>
        </div>
      </section>
      
      {/* User Count Section */}
      <div style={{...styles.userCount}}>
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(74, 159, 255, 0.08), transparent 70%)'}}></div>
        <h3 style={{fontSize: '1.6rem', marginBottom: '25px', position: 'relative', fontWeight: '600'}}>💌 Join {userCount}+ Happy Artists!</h3>
        <p style={{fontSize: '1.3rem', position: 'relative', color: '#e2e8f0', marginBottom: '20px'}}>See How It Works in Seconds</p>
      </div>
      
      {/* How It Works Section */}
      <section style={{...styles.section, paddingTop: '50px'}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>TraceMate makes tracing simple with just three easy steps</p>
        </div>
        
        <div style={styles.stepsGrid}>
          <div style={{...styles.stepItem, animation: 'fadeInUp 0.8s ease-out 0.2s', animationFillMode: 'backwards'}}>
            <div style={{position: 'relative', width: '100%', minHeight: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'}} className="video-container">
              {/* Placeholder image that shows while video loads */}
              <div 
                id="placeholder-how-it-works-1"
                className="video-placeholder"
                style={{
                  backgroundImage: 'url("/assets/step1-placeholder.jpg")',
                  backgroundColor: '#111827'
                }}
              ></div>
              <iframe 
                src="https://player.vimeo.com/video/1083268723?h=b9c7a74a07&autoplay=1&loop=1&background=1&muted=1&controls=0&title=0&byline=0&portrait=0" 
                style={{position: 'relative', width: '100%', height: '300px', border: 'none'}} 
                title="Pick Your Image"
                frameBorder="0" 
                allow="autoplay; fullscreen" 
                loading="lazy"
                className="how-it-works-video"
              ></iframe>
            </div>
            <h3 style={styles.stepTitle} className="step-title">1. Pick Your Image</h3>
            <p>Choose any photo or drawing you want to trace.</p>
          </div>
          
          <div style={{...styles.stepItem, animation: 'fadeInUp 0.8s ease-out 0.4s', animationFillMode: 'backwards'}}>
            <div style={{position: 'relative', width: '100%', minHeight: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'}} className="video-container">
              {/* Placeholder image that shows while video loads */}
              <div 
                id="placeholder-how-it-works-2"
                className="video-placeholder"
                style={{
                  backgroundImage: 'url("/assets/step2-placeholder.jpg")',
                  backgroundColor: '#111827'
                }}
              ></div>
              <iframe 
                src="https://player.vimeo.com/video/1083268763?h=b9c7a74a07&autoplay=1&loop=1&background=1&muted=1&controls=0&title=0&byline=0&portrait=0" 
                style={{position: 'relative', width: '100%', height: '300px', border: 'none'}} 
                title="Set Up Your Phone" 
                frameBorder="0"
                allow="autoplay; fullscreen" 
                loading="lazy"
                className="how-it-works-video"
              ></iframe>
            </div>
            <h3 style={styles.stepTitle} className="step-title">2. Set Up Your Phone</h3>
            <p>Position it above your paper. Adjust size and transparency.</p>
          </div>
          
          <div style={{...styles.stepItem, animation: 'fadeInUp 0.8s ease-out 0.6s', animationFillMode: 'backwards'}}>
            <div style={{position: 'relative', width: '100%', minHeight: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'}} className="video-container">
              {/* Placeholder image that shows while video loads */}
              <div 
                id="placeholder-how-it-works-3"
                className="video-placeholder"
                style={{
                  backgroundImage: 'url("/assets/step3-placeholder.jpg")',
                  backgroundColor: '#111827'
                }}
              ></div>
              <iframe 
                src="https://player.vimeo.com/video/1083268756?autoplay=1&loop=1&background=1&muted=1&controls=0&title=0&byline=0&portrait=0" 
                style={{position: 'relative', width: '100%', height: '300px', border: 'none'}} 
                title="Trace Like Magic" 
                frameBorder="0"
                allow="autoplay; fullscreen" 
                loading="lazy"
                className="how-it-works-video"
              ></iframe>
            </div>
            <h3 style={styles.stepTitle} className="step-title">3. Trace Like Magic</h3>
            <p>Follow the lines on your screen. It's that simple!</p>
          </div>
        </div>
      </section>
      
      {/* Before/After Section */}
      <section style={{...styles.section, ...styles.beforeAfterSection}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={styles.sectionTitle}>🎯 From Sketchy to Stunning</h2>
          <p style={styles.sectionSubtitle}>You don't need to be a pro — just the right tool. TraceMate helps build your skills with every trace.</p>
        </div>
        
        <div style={styles.beforeAfterGrid}>
          <div style={{...styles.beforeAfterItem, animation: 'fadeInUp 0.8s ease-out 0.2s', animationFillMode: 'backwards'}}>
            <h3 style={{marginBottom: '15px', color: '#ff7a00'}}>Before</h3>
            <div style={{position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', maxWidth: '250px', margin: '0 auto'}}>
              <img 
                src="/images/befor.png" 
                alt="Before using TraceMate" 
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onError={(e) => { console.log('Image failed to load:', e.target.src); }}
              />
            </div>
            <p style={{marginTop: '15px', fontSize: '1.1rem'}}>Struggling with proportions? Can't get the details right?</p>
          </div>
          
          <div style={{...styles.beforeAfterItem, animation: 'fadeInUp 0.8s ease-out 0.4s', animationFillMode: 'backwards'}}>
            <h3 style={{marginBottom: '15px', color: '#ff7a00'}}>After</h3>
            <div style={{position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)', maxWidth: '250px', margin: '0 auto'}}>
              <img 
                src="/images/after.png" 
                alt="After using TraceMate" 
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onError={(e) => { console.log('Image failed to load:', e.target.src); }}
              />
            </div>
            <p style={{marginTop: '15px', fontSize: '1.1rem'}}>Clean lines, balanced shapes, and confident strokes!</p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section style={{...styles.section, ...styles.pricingSection}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={styles.sectionTitle}>💥 Launch Special – Limited Time Only!</h2>
          <p style={styles.sectionSubtitle}>Get lifetime access at our special introductory price</p>
        </div>
        
        <div style={styles.pricingGrid}>
          {/* Free Plan */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTitle}>Free</h3>
              <div style={styles.pricingPrice}>$0</div>
              <p style={styles.pricingDescription}>Perfect for trying out TraceMate</p>
            </div>
            
            <div style={styles.pricingFeatures}>
              <div style={styles.pricingFeature}>
                <span style={styles.checkIcon}>✓</span>
                <span>1-minute tracing sessions</span>
              </div>
              <div style={styles.pricingFeature}>
                <span style={styles.checkIcon}>✓</span>
                <span>Basic image adjustments</span>
              </div>
            </div>
            
            <a href="/app" style={{...styles.button, marginTop: 'auto', textAlign: 'center'}}>Try Free</a>
          </div>
          
          {/* Premium Plan */}
          <div style={styles.pricingCardPopular}>
            <div style={styles.popularBadge}>Most Popular</div>
            <div style={styles.pricingHeader}>
              <h3 style={styles.pricingTitle}>Premium</h3>
              <div style={styles.pricingPrice}>
                <span style={{textDecoration: 'line-through', fontSize: '0.8em', color: '#aaa', marginRight: '8px'}}>$45</span>
                $7.5
              </div>
              <p style={styles.pricingDescription}>One-time payment, lifetime access</p>
            </div>
            
            <div style={styles.pricingFeatures}>
              <div style={styles.pricingFeature}>
                <span style={styles.checkIcon}>✓</span>
                <span><strong>Unlimited</strong> tracing time</span>
              </div>
              <div style={styles.pricingFeature}>
                <span style={styles.checkIcon}>✓</span>
                <span>Premium features and tools</span>
              </div>
              <div style={styles.pricingFeature}>
                <span style={styles.checkIcon}>✓</span>
                <span>Priority support</span>
              </div>
            </div>
            
            <a href="/payment" style={{...styles.button, marginTop: 'auto', textAlign: 'center', backgroundColor: '#4a9fff', boxShadow: '0 4px 14px rgba(74, 159, 255, 0.4)'}}>Get Premium</a>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section style={{...styles.section, ...styles.testimonialsSection}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={styles.sectionTitle}>💬 What Users Are Saying</h2>
          <p style={styles.sectionSubtitle}>Don't just take our word for it</p>
        </div>
        
        <div 
          style={styles.testimonialSlider} 
          ref={testimonialSliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{...styles.testimonialSlide, position: 'relative'}}>
            <div style={{position: 'absolute', top: '15px', left: '15px', fontSize: '1.5rem', color: 'rgba(74, 159, 255, 0.2)'}}>❝</div>
            <div style={{position: 'absolute', bottom: '15px', right: '15px', fontSize: '1.5rem', color: 'rgba(74, 159, 255, 0.2)'}}>❞</div>
            <p style={styles.testimonialText} className="testimonial-text">"{testimonials[activeTestimonial].text}"</p>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
              <p style={styles.testimonialAuthor}>{testimonials[activeTestimonial].name}</p>
              <p style={styles.testimonialRole}>{testimonials[activeTestimonial].role}</p>
            </div>
          </div>
          
          <div style={styles.testimonialControls}>
            <button 
              style={styles.testimonialButton}
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              &#8249;
            </button>
            
            <div style={styles.testimonialDots}>
              {testimonials.map((_, i) => {
                // Apply specific styles based on device type
                const dotStyle = i === activeTestimonial ? 
                  {...styles.testimonialDot, ...styles.testimonialDotActive} : 
                  styles.testimonialDot;
                  
                return (
                  <button
                    key={i}
                    style={dotStyle}
                    onClick={() => setActiveTestimonial(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="testimonial-dot"
                  />
                );
              })}
            </div>
            
            <button 
              style={styles.testimonialButton}
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              &#8250;
            </button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section style={{...styles.section, ...styles.faqSection}}>
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h2 style={styles.sectionTitle}>❓ Got Questions?</h2>
          <p style={styles.sectionSubtitle}>We've got answers to help you get started</p>
        </div>
        
        <div>
          {faqItems.map((item, index) => (
            <div key={index} style={styles.faqItem}>
              <button 
                style={styles.faqQuestion}
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{item.question}</span>
                <span>{activeFaq === index ? '−' : '+'}</span>
              </button>
              <div style={activeFaq === index ? 
                {...styles.faqAnswer, ...styles.faqAnswerActive} : 
                styles.faqAnswer
              }>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <img 
            src="/assets/logo-dark-bg.png" 
            alt="TraceMate" 
            style={styles.footerLogoImage}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={styles.footerLogoText}>TraceMate</span>
        </div>
        <div style={styles.footerCopyright}>
          © {currentYear} TraceMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default FallbackLandingPage;
