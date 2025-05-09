import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './TraceSpark.css';
import './testimonials.css';
import './header.css';
import './hero-actions.css';
import './video-section.css';
import './flip-cards.css';
import './auto-flip-cards.css';
import './pricing-section.css';
// Import the consolidated mobile stylesheet last to ensure it overrides other styles
import './mobile-optimized.css';

const TraceMate: React.FC = () => {
  // State management
  const [typedText, setTypedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [userCount, setUserCount] = useState(1583); // Starting with a smaller number
  const [sliderValues, setSliderValues] = useState<{ [key: number]: number }>({
    0: 50,
    1: 50,
    2: 50,
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Typing animation phrases
  const phrases = [
    "Unlock Your Inner Artist...",
    "Sketch Anything, Effortlessly...",
    "Turn Photos Into Art...",
    "Master Drawing Techniques...",
    "Create Like A Pro...",
    "With TraceMate!"
  ];

  // Handle typing animation
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentPhrase) {
        // Pause at the end of phrase
        setIsDeleting(false);
        setTypingSpeed(2000); // Longer pause at end of phrase
        
        if (currentPhraseIndex < phrases.length - 1) {
          setTimeout(() => {
            setIsDeleting(true);
            setTypingSpeed(50);
          }, 2000);
        }
      } else if (isDeleting && typedText === '') {
        // Move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((current) => 
          current === phrases.length - 1 ? 0 : current + 1
        );
        setTypingSpeed(150);
      } else if (isDeleting) {
        // Delete character
        setTypedText((current) => current.substring(0, current.length - 1));
        setTypingSpeed(50);
      } else {
        // Type character
        setTypedText((current) => 
          currentPhrase.substring(0, current.length + 1)
        );
        setTypingSpeed(150);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, currentPhraseIndex, isDeleting, typingSpeed, phrases]);

  // Initialize sliders with animation effect
  useEffect(() => {
    // Animate the slider positions after a short delay
    const timer = setTimeout(() => {
      setSliderValues({ 0: 65, 1: 35 });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-flip cards effect
  useEffect(() => {
    // Set up auto-flipping for the before/after cards
    const flipInterval = 4000; // 4 seconds
    
    const setupCardFlipping = (cardId: string) => {
      const card = document.getElementById(cardId) as HTMLElement;
      if (!card) return null;
      
      let isFlipped = false;
      
      const flipCard = () => {
        isFlipped = !isFlipped;
        card.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      };
      
      const intervalId = setInterval(flipCard, flipInterval);
      return intervalId;
    };
    
    // Set up flipping for both cards with staggered timing
    const beforeCardInterval = setupCardFlipping('beforeCard');
    
    const afterCardInterval = setTimeout(() => {
      const interval = setupCardFlipping('afterCard');
      return interval;
    }, 2000);
    
    // Clean up intervals on component unmount
    return () => {
      if (beforeCardInterval) clearInterval(beforeCardInterval);
      if (afterCardInterval) clearTimeout(afterCardInterval);
    };
  }, []);
  
  // Gradually increase user count over time
  useEffect(() => {
    // Function to calculate the next user count increment
    const calculateIncrement = () => {
      // Generate a random number between 3 and 12
      const baseIncrement = Math.floor(Math.random() * 10) + 3;
      
      // Occasionally add a larger increment (about 20% of the time)
      const shouldAddLarger = Math.random() < 0.2;
      
      if (shouldAddLarger) {
        // Add between 15-30 users
        return baseIncrement + Math.floor(Math.random() * 16) + 15;
      }
      
      return baseIncrement;
    };
    
    // Check if we should update the count based on the date
    const checkAndUpdateCount = () => {
      // Get the current date and stored date from localStorage
      const currentDate = new Date();
      const storedDateStr = localStorage.getItem('lastUserCountUpdate');
      const storedCount = localStorage.getItem('currentUserCount');
      
      // If we have a stored count, use it as the starting point
      if (storedCount) {
        setUserCount(parseInt(storedCount, 10));
      }
      
      // If no stored date or it's been at least 2 days since the last update
      if (!storedDateStr) {
        // First time, just save the current date and count
        localStorage.setItem('lastUserCountUpdate', currentDate.toISOString());
        localStorage.setItem('currentUserCount', userCount.toString());
      } else {
        const storedDate = new Date(storedDateStr);
        const daysDifference = Math.floor((currentDate.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference >= 2) {
          // It's been at least 2 days, time to update
          const increment = calculateIncrement();
          const newCount = userCount + increment;
          
          setUserCount(newCount);
          localStorage.setItem('lastUserCountUpdate', currentDate.toISOString());
          localStorage.setItem('currentUserCount', newCount.toString());
        }
      }
    };
    
    // Run the check when the component mounts
    checkAndUpdateCount();
    
    // Also set up a daily check (in case the user keeps the page open for days)
    const dailyCheck = setInterval(checkAndUpdateCount, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(dailyCheck);
  }, [userCount]);

  // Toggle FAQ item
  const toggleFAQ = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setSliderValues({
      ...sliderValues,
      [index]: parseInt(event.target.value, 10),
    });
  };

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    }
  };

  // Track scroll position for sticky header
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Handle sticky header
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Handle scroll animations
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight * 0.8;
        
        if (elementTop < triggerPoint) {
          element.classList.add('animated');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="tracemate-landing">
      {/* Navigation */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="container">
          <div className="header-logo">
            <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="logo-image" />
            <span className="logo-text">TraceMate</span>
          </div>
          
          <nav className="main-nav">
            <ul className="nav-links">
              <li><button onClick={() => scrollToSection('how-it-works')}>How It Works</button></li>
              <li><button onClick={() => scrollToSection('results')}>Results</button></li>
              <li><button onClick={() => scrollToSection('pricing')}>Pricing</button></li>
              <li><button onClick={() => scrollToSection('testimonials')}>Testimonials</button></li>
              <li><button onClick={() => scrollToSection('faq')}>FAQ</button></li>
            </ul>
          </nav>
          
          {/* Sign In button for all views */}
          <a href="/app" className="signin-button">
            Sign In
          </a>
        </div>
      </header>
      {/* Hero Section */}
      <section className="hero">
        <div className="video-container">
          <video 
            ref={videoRef}
            className="hero-video"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/assets/2.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="overlay"></div>
        
        <div className="hero-content">
          <div className="logo-container">
            <img src="/assets/logo-dark-bg.png" alt="TraceMate Logo" className="hero-logo" />
          </div>
          <h1 className="hero-title no-spacing">
            <span className="typed-text">{typedText}</span><span className="cursor">|</span>
          </h1>
          <p className="hero-subtitle no-spacing">Transform your phone into a magical tracing tool that makes drawing easy and fun!</p>
          <div className="hero-actions">
            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="cta-button primary-button">🎨 Try TraceMate</a>
            <div className="social-proof">✨ Join {userCount.toLocaleString()}+ Happy Artists!</div>
          </div>
        </div>
      </section>

      {/* See It In Action Section */}
      <section className="see-it-in-action" id="how-it-works">
        <div className="container">
          <h2 className="section-title animate-on-scroll">See It In Action! (It's that easy)</h2>
          
          <div className="video-demos full-width">
            <div className="video-carousel">
              <div className="video-item">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="tall-video"
                  height="auto"
                  preload="metadata"
                >
                  <source src="/assets/1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-title">Setup & Image Choice</p>
              </div>
              
              <div className="video-item">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="tall-video"
                  height="auto"
                  preload="metadata"
                >
                  <source src="/assets/2.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-title">The Tracing Experience</p>
              </div>
              
              <div className="video-item">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="tall-video"
                  height="auto"
                  preload="metadata"
                >
                  <source src="/assets/3.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-title">Adjusting & Fine-tuning</p>
              </div>
            </div>
          </div>
          
          <div className="try-it-button-container">
            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="try-it-button">Try It Yourself</a>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="before-after" id="results">
        <div className="container">
          <h2 className="section-title animate-on-scroll">From "Oops" to "Ooh La La!" – See the Difference!</h2>
          
          <div className="comparison-container">
            <div className="comparison-pair">
              <div className="auto-flip-card before-card animate-on-scroll">
                <div className="auto-flip-card-inner" id="beforeCard">
                  <div className="auto-flip-card-front">
                    <img src="/assets/befor.png" alt="Before drawing example" />
                    <div className="auto-flip-card-label">Before</div>
                  </div>
                  <div className="auto-flip-card-back">
                    <img src="/assets/befor.png" alt="Before drawing example" />
                    <div className="auto-flip-card-label">Before</div>
                  </div>
                </div>
                <p className="comparison-caption">Without TraceMate</p>
              </div>
              
              <div className="auto-flip-card after-card animate-on-scroll">
                <div className="auto-flip-card-inner" id="afterCard">
                  <div className="auto-flip-card-front">
                    <img src="/assets/after.png" alt="After drawing example" />
                    <div className="auto-flip-card-label">After</div>
                  </div>
                  <div className="auto-flip-card-back">
                    <img src="/assets/after.png" alt="After drawing example" />
                    <div className="auto-flip-card-label">After</div>
                  </div>
                </div>
                <p className="comparison-caption">With TraceMate</p>
              </div>
            </div>
          </div>
          
          <p className="transformation-text">
            You don't need years of practice. You just need the right tool. 
            TraceMate guides your hand, building your skills and confidence with every line!
          </p>
        </div>
      </section>

      {/* Use Cases section removed as requested */}

      {/* Testimonials Section removed - keeping only the one below */}

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title animate-on-scroll">Unlock Your Artistic Potential</h2>
            <div className="pricing-subtitle">
              <span className="limited-offer">🔥 Special Launch Pricing - Limited Time Only! 🔥</span>
            </div>
          </div>
          
          <div className="pricing-toggle-container">
            <div className="pricing-plans-container">
              <div className="pricing-grid pricing-toggle-container">
                {/* Free Plan */}
                <div className="pricing-plan free-plan">
                  <div className="plan-header">
                    <h3 className="plan-name">Free</h3>
                    <div className="plan-price">
                      <span className="currency">$</span>
                      <span className="amount">0</span>
                      <span className="period">forever</span>
                    </div>
                    <p className="plan-description">Basic tracing tools</p>
                  </div>
                  
                  <div className="plan-features">
                    <ul>
                      <li><span className="feature-icon">✓</span> 5 Traces/Month</li>
                      <li><span className="feature-icon">✓</span> 5-Min Limit</li>
                    </ul>
                  </div>
                  
                  <div className="plan-cta">
                    <a href="/app" className="plan-button free-button">Start Free</a>
                  </div>
                </div>
                
                {/* Monthly Plan */}
                <div className="pricing-plan monthly-plan">
                  <div className="plan-header">
                    <h3 className="plan-name">Monthly</h3>
                    <div className="plan-price">
                      <div className="price-wrapper">
                        <span className="original-price">$8</span>
                        <span className="currency">$</span>
                        <span className="amount">5</span>
                        <span className="period">/month</span>
                      </div>
                    </div>
                    <p className="plan-description">Unlimited access</p>
                  </div>
                  
                  <div className="plan-features">
                    <ul>
                      <li><span className="feature-icon">✓</span> Unlimited Tracing</li>
                      <li><span className="feature-icon">✓</span> Full Features</li>
                      <li><span className="feature-icon">✓</span> No Watermarks</li>
                    </ul>
                  </div>
                  
                  <div className="plan-cta">
                    <a href="/app" className="plan-button monthly-button">Get Monthly</a>
                  </div>
                </div>
                
                {/* Lifetime Plan */}
                <div className="pricing-plan popular-plan lifetime-plan">
                  <div className="popular-tag">Most Popular</div>
                  <div className="plan-header">
                    <h3 className="plan-name">Lifetime</h3>
                    <div className="plan-price">
                      <div className="price-wrapper">
                        <span className="original-price">$55</span>
                        <span className="currency">$</span>
                        <span className="amount">25</span>
                        <span className="period">one-time</span>
                      </div>
                    </div>
                    <p className="plan-description">Best value</p>
                  </div>
                  
                  <div className="plan-features">
                    <ul>
                      <li><span className="feature-icon">✓</span> Unlimited Tracing</li>
                      <li><span className="feature-icon">✓</span> All Features</li>
                      <li><span className="feature-icon">✓</span> All Future Updates</li>
                      <li><span className="feature-icon">✓</span> Forever Access</li>
                    </ul>
                  </div>
                  
                  <div className="plan-cta">
                    <a href="/app" className="plan-button lifetime-button">Get Lifetime</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pricing-guarantee">
            <div className="guarantee-icon">🛡️</div>
            <p>30-Day Money-Back Guarantee. Try risk-free today!</p>
          </div>
          
          <div className="features-included">
            <h3>What's Included</h3>
            <ul className="features-list">
              <li>✅ Unlimited Tracing</li>
              <li>✅ Import Your Own Images</li>
              <li>✅ Growing Image Library</li>
              <li>✅ Adjustable Controls (Opacity, Size, etc.)</li>
              <li>✅ Regular Updates & New Features</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Creativity section removed as requested */}

      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title animate-on-scroll">What Our Artists Are Saying</h2>
          
          <div className="testimonials-grid" id="testimonials-slider">
            <div className="testimonial-card animate-on-scroll">
              <div className="user-avatar">
                <img src="/assets/avatar1.jpg" alt="User Avatar" />
              </div>
              <div className="rating">★★★★★</div>
              <p className="testimonial-text">
                "I never thought I could draw anything recognizable until I found TraceMate. Now my kids think I'm an art genius!"
              </p>
              <p className="testimonial-author">- Sarah K., Mom of 3</p>
            </div>
            
            <div className="testimonial-card animate-on-scroll">
              <div className="user-avatar">
                <img src="/assets/avatar2.jpg" alt="User Avatar" />
              </div>
              <div className="rating">★★★★★</div>
              <p className="testimonial-text">
                "As an art teacher, I've found TraceMate to be an incredible tool for helping my students gain confidence in their drawing abilities."
              </p>
              <p className="testimonial-author">- Michael T., Art Educator</p>
            </div>
            
            <div className="testimonial-card animate-on-scroll">
              <div className="user-avatar">
                <img src="/assets/avatar3.jpg" alt="User Avatar" />
              </div>
              <div className="rating">★★★★★</div>
              <p className="testimonial-text">
                "I've always wanted to create my own comic book characters but couldn't get the proportions right. TraceMate changed everything for me!"
              </p>
              <p className="testimonial-author">- Jason L., Aspiring Comic Artist</p>
            </div>
          </div>
          
          <div className="testimonials-navigation">
            <button aria-label="Previous testimonial" onClick={() => document.getElementById('testimonials-slider')?.scrollBy({left: -300, behavior: 'smooth'})}>&lt;</button>
            <button aria-label="Next testimonial" onClick={() => document.getElementById('testimonials-slider')?.scrollBy({left: 300, behavior: 'smooth'})}>&gt;</button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq" id="faq">
        <div className="container">
          <h2 className="section-title animate-on-scroll">Still on the Fence? Let's Clear Things Up!</h2>
          
          <div className="faq-container">
            {[
              {
                question: "How does the tracing actually work?",
                answer: "TraceMate cleverly uses your phone's camera and screen. You position your phone over paper, and the app projects your chosen image downwards, so you can see it on your paper and trace!"
              },
              {
                question: "Do I need any special stands or gadgets?",
                answer: "Nope! Just your phone and paper. Though some users get creative with household items like a glass cup to prop up their phone for hands-free tracing."
              },
              {
                question: "Is it really for beginners?",
                answer: "Absolutely! It's designed to be super intuitive. If you can hold a pencil, you can use TraceMate."
              }
            ].map((faq, index) => (
              <div className={`faq-item animate-on-scroll ${activeFaq === index ? 'active' : ''}`} key={index}>
                <button 
                  className={`faq-question ${activeFaq === index ? 'active' : ''}`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={activeFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question}
                  <span className="icon">{activeFaq === index ? '↑' : '↓'}</span>
                </button>
                <div 
                  id={`faq-answer-${index}`}
                  className={`faq-answer ${activeFaq === index ? 'active' : ''}`}
                  aria-hidden={activeFaq !== index}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
          
          <div className="final-cta animate-on-scroll animate-scale">
            <h3>Ready to Amaze Yourself? Your Art Journey Starts Now!</h3>
            <a href="/app" className="cta-button">Get Lifetime Access for $25! <span className="icon">→</span></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="copyright">
              © {currentYear} TraceMate. All Rights Reserved.
            </div>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/contact">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TraceMate;
