import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './FallbackLandingPage.css';

const FallbackLandingPage: React.FC = () => {
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [userCount, setUserCount] = useState(calculateUserCount());
  const [isScrolled, setIsScrolled] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Refs for touch events
  const testimonialSliderRef = useRef<HTMLDivElement>(null);
  
  // Get current year for footer
  const currentYear = new Date().getFullYear();
  
  // State to track window size
  const [isMobile, setIsMobile] = useState(false);
  
  // State for typewriter animation
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(30);
  
  // Phrases with emojis for the headline
  const phrases = [
    'Turn Your Phone into a Tracing Tool',
    'Make Drawing Fun',
    'Create Art Like a Pro',
    'Master Drawing Techniques',
    'Trace Any Image with Precision'
  ];
  
  // Fixed emojis for each phrase that will stay consistent
  const emojis = [
    '📱',
    '🎨',
    '🖌️',
    '✏️',
    '📄'
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const handleTyping = () => {
      const current = loopNum % phrases.length;
      const fullText = phrases[current];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      // Set typing speed based on whether we're deleting or typing
      // Fast typing, slightly slower deleting for readability
      setTypingSpeed(isDeleting ? 15 : 25);

      // If we've completed typing the full phrase
      if (!isDeleting && text === fullText) {
        // 2.5 second pause at the end of a complete phrase for better readability
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        // Move to the next phrase
        setLoopNum(loopNum + 1);
        // Very short pause before starting the next phrase
        setTypingSpeed(50);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, phrases]); 
  
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
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
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
  
  // Navigation functions
  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const toggleFAQ = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <img src="/assets/logo-dark-bg.png" alt="TraceMate Logo" className="logo" />
          <span className="logo-text">TraceMate</span>
        </div>
        {!isLoggedIn && (
          <a href="/login" className="secondary-button" style={{ whiteSpace: 'nowrap' }}>Sign In</a>
        )}
      </header>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ overflow: 'hidden', width: '100%' }}>
        <div className="hero-content" style={{ textAlign: 'center', width: '100%', maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="title" style={{ textAlign: 'center', width: '100%', maxWidth: '100%', overflow: 'hidden', minHeight: '70px', position: 'relative' }}>
            <div className="typewriter-container" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexWrap: 'nowrap',
              margin: '0 auto'
            }}>
              <span style={{ 
                display: 'inline-block', 
                marginRight: '8px', 
                fontSize: '2rem',
                lineHeight: '1',
                verticalAlign: 'middle'
              }}>
                {emojis[loopNum % emojis.length]}
              </span>
              <span className="typewriter-text" style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ffffff, #ff7a00)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                textShadow: '0 0 5px rgba(255, 122, 0, 0.3)',
                display: 'inline-block',
                verticalAlign: 'middle',
                lineHeight: '1.2'
              }}>{text}</span>
              <span className="cursor"></span>
            </div>
          </h1>
          <p className="subtitle" style={{ textAlign: 'center', margin: '20px auto' }}>
            TraceMate makes drawing fun and frustration-free. Just load an image, trace it through your screen, and bring your art to life!
          </p>
          <div className="hero-actions" style={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '500px',
            margin: '30px auto'
          }}>
            <a href="/app" className="primary-button" style={{ 
              width: isMobile ? '80%' : 'auto',
              minWidth: isMobile ? 'auto' : '180px',
              textAlign: 'center',
              marginBottom: isMobile ? '15px' : '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 28px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(255, 122, 0, 0.3)',
              margin: isMobile ? '0 auto 15px auto' : '0 20px 0 0'
            }}>
              <span style={{ marginRight: '10px', display: 'inline-block', background: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset', WebkitTextFillColor: 'initial', color: 'inherit' }}>🎨</span>
              <span>Try TraceMate</span>
            </a>
            {!isLoggedIn && (
              <a href="/login" className="secondary-button" style={{ 
                width: isMobile ? '80%' : 'auto',
                minWidth: isMobile ? 'auto' : '120px',
                textAlign: 'center',
                marginLeft: isMobile ? '0' : '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 24px',
                fontSize: '1.1rem',
                margin: isMobile ? '0 auto' : '0',
                whiteSpace: 'nowrap',
                lineHeight: '1.2'
              }}>Sign In</a>
            )}
          </div>
          <p className="user-count" style={{ textAlign: 'center', margin: '20px auto' }}>💌 Join {userCount}+ Happy Artists!</p>
          <p className="subtitle" style={{ textAlign: 'center', margin: '5px auto' }}>See How It Works in Seconds</p>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="section" style={{ marginTop: '15px', padding: '60px 20px 80px' }}>
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>How It Works</h2>
          <p style={{ 
            fontSize: '1.2rem', 
            maxWidth: '700px', 
            margin: '0 auto', 
            textAlign: 'center', 
            color: '#e2e8f0' 
          }}>TraceMate makes tracing simple with just three easy steps</p>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '30px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Step 1 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%'
          }}>
            <div style={{ padding: '25px 25px 15px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#ff7a00', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '15px',
                  boxShadow: '0 5px 15px rgba(255, 122, 0, 0.3)',
                  flexShrink: 0
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>1</span>
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#ff7a00', 
                  margin: 0 
                }}>Pick Your Image</h3>
              </div>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#e2e8f0', 
                marginBottom: '20px' 
              }}>Choose any photo or drawing you want to trace.</p>
            </div>
            
            <div style={{ 
              flex: '1',
              padding: '0 0 25px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '100%',
                height: '0',
                paddingBottom: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0 0 20px 20px'
                  }}
                >
                  <source src="/assets/vd/1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%'
          }}>
            <div style={{ padding: '25px 25px 15px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#ff7a00', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '15px',
                  boxShadow: '0 5px 15px rgba(255, 122, 0, 0.3)',
                  flexShrink: 0
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>2</span>
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#ff7a00', 
                  margin: 0 
                }}>Set Up Your Phone</h3>
              </div>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#e2e8f0', 
                marginBottom: '20px' 
              }}>Position it above your paper. Adjust size and transparency.</p>
            </div>
            
            <div style={{ 
              flex: '1',
              padding: '0 0 25px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '100%',
                height: '0',
                paddingBottom: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0 0 20px 20px'
                  }}
                >
                  <source src="/assets/vd/2.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%'
          }}>
            <div style={{ padding: '25px 25px 15px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#ff7a00', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: '15px',
                  boxShadow: '0 5px 15px rgba(255, 122, 0, 0.3)',
                  flexShrink: 0
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>3</span>
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#ff7a00', 
                  margin: 0 
                }}>Start Tracing</h3>
              </div>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#e2e8f0', 
                marginBottom: '20px' 
              }}>Use your pencil to follow the lines on your screen.</p>
            </div>
            
            <div style={{ 
              flex: '1',
              padding: '0 0 25px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '100%',
                height: '0',
                paddingBottom: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '0 0 20px 20px'
                  }}
                >
                  <source src="/assets/vd/3.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Before/After Section */}
      <section className="section before-after-section" style={{ padding: '60px 20px 80px' }}>
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '15px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '2.2rem' }}>🎯</span>
            <span>From Sketchy to Stunning</span>
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            maxWidth: '700px', 
            margin: '0 auto', 
            textAlign: 'center', 
            color: '#e2e8f0' 
          }}>You don't need to be a pro — just the right tool. TraceMate helps build your skills with every trace.</p>
        </div>
        
        {/* Modern redesigned comparison */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '40px',
          justifyContent: 'center',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Before item */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}>
            <h3 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: '#ff7a00', 
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px'
            }}>Before</h3>
            <div style={{
              width: '100%',
              height: '280px',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/images/befor.png" 
                alt="Before using TraceMate" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                }}
                onError={(e) => {
                  console.log('Before image failed to load');
                  e.currentTarget.src = '/assets/before-drawing.jpg';
                }}
              />
            </div>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#e2e8f0', 
              textAlign: 'center',
              margin: '0'
            }}>Struggling with proportions? Can't get the details right?</p>
          </div>
          
          {/* After item */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}>
            <h3 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: '#ff7a00', 
              marginBottom: '20px',
              position: 'relative',
              paddingBottom: '10px'
            }}>After</h3>
            <div style={{
              width: '100%',
              height: '280px',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/images/after.png" 
                alt="After using TraceMate" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.5s ease',
                }}
                onError={(e) => {
                  console.log('After image failed to load');
                  e.currentTarget.src = '/assets/after-drawing.jpg';
                }}
              />
            </div>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#e2e8f0', 
              textAlign: 'center',
              margin: '0'
            }}>Clean lines, balanced shapes, and confident strokes!</p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="section" style={{ padding: '60px 20px 80px', background: 'linear-gradient(145deg, #0f172a, #1a202c)' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>Launch Special – Limited Time Only!</h2>
          <p style={{ 
            fontSize: '1.2rem', 
            maxWidth: '700px', 
            margin: '0 auto', 
            color: '#e2e8f0' 
          }}>Get lifetime access at our special introductory price</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
          gap: '30px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {/* Free Plan */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '24px',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}>
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#ffffff'
              }}>Free</h3>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#4a9fff'
              }}>$0</div>
              <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>Perfect for trying out TraceMate</p>
            </div>
            
            <div style={{ 
              margin: '20px 0', 
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>1-minute tracing sessions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>Basic image adjustments</span>
              </div>
            </div>
            
            <a href="/app" style={{ 
              backgroundColor: '#ff7a00',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(255, 122, 0, 0.3)',
              marginTop: 'auto'
            }}>Try Free</a>
          </div>
          
          {/* Premium Plan */}
          <div style={{ 
            background: 'linear-gradient(145deg, #1a202c, #1E293B)',
            borderRadius: '24px',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            border: '2px solid #4a9fff',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            transform: isMobile ? 'none' : 'scale(1.05)',
            zIndex: 2
          }}>
            <div style={{ 
              position: 'absolute',
              top: '-12px',
              right: '20px',
              backgroundColor: '#4a9fff',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(74, 159, 255, 0.3)'
            }}>Most Popular</div>
            
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#ffffff'
              }}>Premium</h3>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#4a9fff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ 
                  textDecoration: 'line-through', 
                  fontSize: '1.8rem', 
                  color: '#aaa',
                  fontWeight: 'normal'
                }}>$45</span>
                <span>$7.5</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>One-time payment, lifetime access</p>
            </div>
            
            <div style={{ 
              margin: '20px 0', 
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>Unlimited tracing time</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>Premium features and tools</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>Priority support</span>
              </div>
            </div>
            
            <a href="/payment" style={{ 
              backgroundColor: '#4a9fff',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(74, 159, 255, 0.3)',
              marginTop: 'auto'
            }}>Get Premium</a>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="section-header">
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>What Users Are Saying</h2>
          <p style={{ 
            fontSize: '1.2rem', 
            maxWidth: '700px', 
            margin: '0 auto', 
            textAlign: 'center', 
            color: '#e2e8f0' 
          }}>Don't just take our word for it</p>
        </div>
        
        <div 
          className="testimonial-slider"
          ref={testimonialSliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="testimonial-slide">
            <div className="quote-marks">❝❞</div>
            <p className="testimonial-text">"{testimonials[activeTestimonial].text}"</p>
            <div className="testimonial-author-container">
              <p className="testimonial-author">{testimonials[activeTestimonial].name}</p>
              <p className="testimonial-role">{testimonials[activeTestimonial].role}</p>
            </div>
          </div>
          
          <div className="testimonial-controls">
            <button 
              className="testimonial-button"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot ${i === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="testimonial-button"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="section faq-section">
        <div className="section-header">
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>Got Questions?</h2>
          <p style={{ 
            fontSize: '1.2rem', 
            maxWidth: '700px', 
            margin: '0 auto', 
            textAlign: 'center', 
            color: '#e2e8f0' 
          }}>We've got answers to help you get started</p>
        </div>
        
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{item.question}</span>
                <span>{activeFaq === index ? '−' : '+'}</span>
              </button>
              <div className={`faq-answer ${activeFaq === index ? 'active' : ''}`}>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="footer-logo-image" />
          <span className="footer-logo-text">TraceMate</span>
        </div>
        <div className="footer-copyright">
          © {currentYear} TraceMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FallbackLandingPage;
