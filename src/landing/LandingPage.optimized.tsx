import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.optimized.css';

// SVG Icons Component
const Icons = {
  Security: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  ),
  Notification: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Mobile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12" y2="18"></line>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  ),
  Twitter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Linkedin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  )
};

const LandingPage: React.FC = () => {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  // Refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  
  // Typing animation phrases
  const phrases = [
    "track your assets",
    "monitor in real-time",
    "secure your valuables",
    "get instant alerts"
  ];

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Setup video elements
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, 5);
    videoRefs.current.forEach(video => {
      if (video) {
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = false;
        video.disablePictureInPicture = true;
      }
    });
  }, []);

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting && typedText === currentPhrase) {
        // Pause at the end of typing
        setTypingSpeed(2000);
        setIsDeleting(true);
      } else if (isDeleting && typedText === '') {
        // Move to the next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length);
        setTypingSpeed(150);
      } else {
        // Typing or deleting
        setTypedText(prev => {
          if (isDeleting) {
            setTypingSpeed(50);
            return prev.substring(0, prev.length - 1);
          } else {
            setTypingSpeed(150);
            return currentPhrase.substring(0, prev.length + 1);
          }
        });
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, currentPhraseIndex, isDeleting, typingSpeed, phrases]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Smooth scroll to section with improved accessibility
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // Add focus for accessibility
      section.scrollIntoView({ behavior: "smooth" });
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    }
    // Close mobile menu when navigating
    setIsMenuOpen(false);
  };

  return (
    <div className="landing-page">
      {/* Header/Navigation */}
      <header 
        ref={headerRef} 
        className={`header ${isScrolled ? 'scrolled' : ''}`}
        aria-label="Main navigation"
      >
        <div className="container header-container">
          <Link to="/" className="logo">
            <img src="/assets/logo.svg" alt="TraceMate Logo" />
            <span>TraceMate</span>
          </Link>
          
          <nav>
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <li>
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('features')}
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('how-it-works')}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('testimonials')}
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('pricing')}
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  className="nav-link" 
                  onClick={() => scrollToSection('faq')}
                >
                  FAQ
                </button>
              </li>
              <li>
                <Link to="/login" className="nav-cta">
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero section" id="hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <h1 className="hero-title">
              The smart way to <span className="animated-title">{typedText}</span>
            </h1>
            <p className="hero-subtitle">
              TraceMate helps you keep track of your valuable assets with real-time monitoring, 
              instant alerts, and comprehensive analytics.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => scrollToSection('how-it-works')}
              >
                Learn More
              </button>
            </div>
          </div>
          
          <div className="hero-video animate-slide-up">
            <video 
              ref={el => videoRefs.current[0] = el}
              src="/assets/videos/hero-demo.mp4"
              aria-label="Product demonstration video"
            />
          </div>
        </div>
        
        {/* Decorative shapes */}
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </section>

      {/* Features Section */}
      <section className="features section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to track, monitor, and secure your valuable assets
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Icons.Security />
              </div>
              <h3 className="feature-title">Advanced Security</h3>
              <p className="feature-description">
                End-to-end encryption and secure authentication to keep your data safe.
              </p>
            </div>
            
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Icons.Analytics />
              </div>
              <h3 className="feature-title">Detailed Analytics</h3>
              <p className="feature-description">
                Comprehensive insights and reports to help you make informed decisions.
              </p>
            </div>
            
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Icons.Notification />
              </div>
              <h3 className="feature-title">Instant Alerts</h3>
              <p className="feature-description">
                Get notified immediately when something requires your attention.
              </p>
            </div>
            
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Icons.Map />
              </div>
              <h3 className="feature-title">Real-time Tracking</h3>
              <p className="feature-description">
                Monitor the location and status of your assets in real-time.
              </p>
            </div>
            
            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <Icons.Mobile />
              </div>
              <h3 className="feature-title">Mobile Access</h3>
              <p className="feature-description">
                Access your dashboard and controls from any device, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get started with TraceMate in just a few simple steps
            </p>
          </div>
          
          <div className="steps">
            <div className="step animate-slide-right">
              <h3 className="step-title">Create Your Account</h3>
              <p className="step-description">
                Sign up for TraceMate and set up your secure account in minutes.
              </p>
            </div>
            
            <div className="step animate-slide-right">
              <h3 className="step-title">Add Your Assets</h3>
              <p className="step-description">
                Register your valuable assets and configure tracking preferences.
              </p>
            </div>
            
            <div className="step animate-slide-right">
              <h3 className="step-title">Install Tracking</h3>
              <p className="step-description">
                Set up the tracking devices or software on your assets.
              </p>
            </div>
            
            <div className="step animate-slide-right">
              <h3 className="step-title">Monitor & Manage</h3>
              <p className="step-description">
                Track, monitor, and manage your assets from the dashboard.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <video 
              ref={el => videoRefs.current[1] = el}
              className="mx-auto rounded-lg shadow-lg max-w-4xl w-full"
              src="/assets/videos/how-it-works.mp4"
              aria-label="How TraceMate works demonstration"
            />
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="testimonials section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied customers who trust TraceMate
            </p>
          </div>
          
          <div className="testimonial-grid">
            <div className="testimonial-card animate-fade-in">
              <p className="testimonial-content">
                TraceMate has completely transformed how we manage our fleet. The real-time tracking and analytics have improved our efficiency by 35%.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <img src="/assets/images/testimonial-1.jpg" alt="Sarah Johnson" />
                </div>
                <div className="testimonial-info">
                  <span className="testimonial-name">Sarah Johnson</span>
                  <span className="testimonial-role">Fleet Manager, Logistics Co</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card animate-fade-in">
              <p className="testimonial-content">
                The peace of mind that comes with knowing exactly where my valuable equipment is at all times is priceless. The alerts have saved us from theft twice!
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <img src="/assets/images/testimonial-2.jpg" alt="Michael Chen" />
                </div>
                <div className="testimonial-info">
                  <span className="testimonial-name">Michael Chen</span>
                  <span className="testimonial-role">Small Business Owner</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card animate-fade-in">
              <p className="testimonial-content">
                As someone who travels frequently, being able to keep track of my luggage and personal items gives me confidence. The mobile app is intuitive and reliable.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <img src="/assets/images/testimonial-3.jpg" alt="Emma Rodriguez" />
                </div>
                <div className="testimonial-info">
                  <span className="testimonial-name">Emma Rodriguez</span>
                  <span className="testimonial-role">Frequent Traveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing section section-alt" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              Choose the plan that works best for your needs
            </p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card animate-fade-in">
              <div className="pricing-header">
                <h3 className="pricing-name">Basic</h3>
                <div className="pricing-price">$9<span className="pricing-period">/month</span></div>
                <p>Perfect for individuals</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Track up to 3 assets</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Real-time location updates</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Basic alert notifications</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Mobile app access</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>7-day history</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=basic" className="btn btn-primary pricing-cta">
                Get Started
              </Link>
            </div>
            
            <div className="pricing-card popular animate-fade-in">
              <span className="popular-badge">Most Popular</span>
              <div className="pricing-header">
                <h3 className="pricing-name">Pro</h3>
                <div className="pricing-price">$29<span className="pricing-period">/month</span></div>
                <p>Ideal for small businesses</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Track up to 15 assets</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Real-time location updates</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Advanced alert system</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Mobile & desktop access</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>30-day history & analytics</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=pro" className="btn btn-primary pricing-cta">
                Get Started
              </Link>
            </div>
            
            <div className="pricing-card animate-fade-in">
              <div className="pricing-header">
                <h3 className="pricing-name">Enterprise</h3>
                <div className="pricing-price">$99<span className="pricing-period">/month</span></div>
                <p>For large organizations</p>
              </div>
              
              <ul className="pricing-features">
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Unlimited asset tracking</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Real-time location updates</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Custom alert configurations</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Full platform access</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Unlimited history & analytics</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>24/7 dedicated support</span>
                </li>
                <li className="pricing-feature">
                  <Icons.Check />
                  <span>Custom integration options</span>
                </li>
              </ul>
              
              <Link to="/signup?plan=enterprise" className="btn btn-primary pricing-cta">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq section" id="faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Find answers to common questions about TraceMate
            </p>
          </div>
          
          <div className="faq-list">
            {[
              {
                question: "How accurate is the asset tracking?",
                answer: "TraceMate provides highly accurate tracking with precision up to 2 meters outdoors and 5 meters indoors, depending on the environment and tracking technology used."
              },
              {
                question: "Is my data secure with TraceMate?",
                answer: "Yes, we take security very seriously. All data is encrypted end-to-end, and we follow industry best practices for data protection and privacy compliance."
              },
              {
                question: "Can I track assets internationally?",
                answer: "Yes, TraceMate works globally with coverage in over 150 countries. International tracking may have additional fees depending on your plan."
              },
              {
                question: "What happens if I lose connection?",
                answer: "TraceMate will continue to store tracking data locally and will sync once connection is restored. You'll never lose your tracking history."
              },
              {
                question: "How long does the battery last on tracking devices?",
                answer: "Battery life varies by device, but our standard trackers last 2-4 weeks on a single charge with typical use. Power-saving modes can extend this further."
              },
              {
                question: "Can I share access with my team?",
                answer: "Yes, Pro and Enterprise plans allow you to add team members with customizable permission levels to help manage your assets."
              }
            ].map((faq, index) => (
              <div className="faq-item" key={index}>
                <button 
                  className={`faq-question ${activeFaq === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={activeFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  {faq.question}
                  <Icons.ChevronDown />
                </button>
                <div 
                  id={`faq-answer-${index}`}
                  className={`faq-answer ${activeFaq === index ? 'active' : ''}`}
                  aria-hidden={activeFaq !== index}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to start tracking?</h2>
            <p className="cta-subtitle">
              Join thousands of users who trust TraceMate for their asset tracking needs.
              Start your free 14-day trial today.
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-white btn-lg">
                Start Free Trial
              </Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" className="footer-logo">
                TraceMate
              </Link>
              <p className="footer-description">
                The smart way to track, monitor, and secure your valuable assets with real-time updates and alerts.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" className="social-link" aria-label="Facebook">
                  <Icons.Facebook />
                </a>
                <a href="https://twitter.com" className="social-link" aria-label="Twitter">
                  <Icons.Twitter />
                </a>
                <a href="https://instagram.com" className="social-link" aria-label="Instagram">
                  <Icons.Instagram />
                </a>
                <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn">
                  <Icons.Linkedin />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-links">
                <li><Link to="/features" className="footer-link">Features</Link></li>
                <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
                <li><Link to="/integrations" className="footer-link">Integrations</Link></li>
                <li><Link to="/updates" className="footer-link">Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><Link to="/blog" className="footer-link">Blog</Link></li>
                <li><Link to="/documentation" className="footer-link">Documentation</Link></li>
                <li><Link to="/guides" className="footer-link">Guides</Link></li>
                <li><Link to="/help" className="footer-link">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                <li><Link to="/about" className="footer-link">About Us</Link></li>
                <li><Link to="/careers" className="footer-link">Careers</Link></li>
                <li><Link to="/contact" className="footer-link">Contact</Link></li>
                <li><Link to="/press" className="footer-link">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-links">
                <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
                <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="footer-link">Cookie Policy</Link></li>
                <li><Link to="/compliance" className="footer-link">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} TraceMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
