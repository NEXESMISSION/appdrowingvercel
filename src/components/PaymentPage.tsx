import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PaymentPage.css';
import '../styles/GlobalDarkTheme.css';
import '../styles/ModernEffects.css';
import '../styles/Animations.css';

// Simple Button component
interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', onClick }) => {
  return (
    <button 
      className={`cta-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Countdown Timer Component
const CountdownTimer = () => {
  // Initialize timer state from localStorage or default values
  const [time, setTime] = useState(() => {
    // Try to get saved timer state from localStorage
    const savedTimer = localStorage.getItem('countdownTimer');
    if (savedTimer) {
      try {
        const parsedTimer = JSON.parse(savedTimer);
        // Validate the timer data
        if (parsedTimer && 
            typeof parsedTimer.hours === 'number' && 
            typeof parsedTimer.minutes === 'number' && 
            typeof parsedTimer.seconds === 'number' &&
            parsedTimer.expireTime) {
          
          // Calculate remaining time based on saved expiration time
          const now = new Date().getTime();
          const expireTime = parsedTimer.expireTime;
          const totalSecondsLeft = Math.max(0, Math.floor((expireTime - now) / 1000));
          
          if (totalSecondsLeft > 0) {
            const hours = Math.floor(totalSecondsLeft / 3600);
            const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
            const seconds = totalSecondsLeft % 60;
            return { hours, minutes, seconds, expireTime };
          }
        }
      } catch (error) {
        console.error('Error parsing saved timer:', error);
      }
    }
    
    // Default timer values (5 hours)
    const defaultHours = 5;
    const defaultMinutes = 0;
    const defaultSeconds = 0;
    
    // Calculate expiration time (current time + timer duration in milliseconds)
    const now = new Date().getTime();
    const expireTime = now + (defaultHours * 3600 + defaultMinutes * 60 + defaultSeconds) * 1000;
    
    return {
      hours: defaultHours,
      minutes: defaultMinutes,
      seconds: defaultSeconds,
      expireTime: expireTime
    };
  });

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTime(prevTime => {
        let { hours, minutes, seconds, expireTime } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        // Save updated timer to localStorage
        const updatedTimer = { hours, minutes, seconds, expireTime };
        localStorage.setItem('countdownTimer', JSON.stringify(updatedTimer));
        
        return updatedTimer;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-container">
      <div className="countdown-header">
        <span className="countdown-warning-icon">⚠️</span>
        <p className="countdown-title">Limited Time Offer Ends In:</p>
      </div>
      
      <div className="countdown-timer">
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(time.hours).padStart(2, '0')}
          </div>
          <div className="countdown-label">HOURS</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(time.minutes).padStart(2, '0')}
          </div>
          <div className="countdown-label">MINUTES</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">
            {String(time.seconds).padStart(2, '0')}
          </div>
          <div className="countdown-label">SECONDS</div>
        </div>
      </div>
    </div>
  );
};

const paymentOptions = [
  { name: 'Visa', logo: '/assets/logos/Visa_Logo.png' },
  { name: 'Mastercard', logo: '/assets/logos/Mastercard-logo.svg' },
  { name: 'Binance', logo: '/assets/logos/Binance_Logo.png' },
  { name: 'Coinbase', logo: '/assets/logos/coinbase.png' },
  { name: 'Kraken', logo: '/assets/logos/kraken.png' },
  { name: 'Bitcoin', logo: '/assets/logos/Bitcoin.svg' },
  { name: 'Wise', logo: '/assets/logos/wise.png' }
];

const contactOptions = [
  { 
    name: "WhatsApp", 
    icon: "💬", 
    cssClass: "whatsapp",
    link: "https://wa.me/YourWhatsAppNumber"
  },
  { 
    name: "Instagram", 
    icon: "📸", 
    cssClass: "instagram",
    link: "https://instagram.com/YourInstagramProfile"
  },
  { 
    name: "Telegram", 
    icon: "✈️", 
    cssClass: "telegram",
    link: "https://t.me/YourTelegramUsername"
  }
];

const PaymentPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleMessageUs = () => {
    setShowModal(true);
  };
  
  const handleContactOption = (option: string, link: string) => {
    window.open(link, '_blank');
    setShowModal(false);
  };

  return (
    <div className="payment-page">
      {/* Logo with link to home page */}
      <Link to="/" className="logo-container" title="Go to Home Page">
        <img src="/assets/logo-dark-bg.png" alt="TraceMate" className="app-logo" />
        <span className="logo-text">TraceMate</span>
      </Link>
      
      {/* Countdown Timer */}
      <CountdownTimer />
      
      {/* Hero Section */}
      <div className="hero-container">
        <span className="flash-sale-badge">FLASH SALE</span>
        <h1 className="hero-title"><span className="white-text">Unlock</span> <span className="premium-text">TraceMate Premium</span></h1>
        <p className="hero-price">
          One-time payment of <span className="price-original">$45</span> <span className="price-current">$7.5</span>
        </p>
        <p className="hero-description">Instant lifetime access. No subscription. No hidden fees.</p>
      </div>
      
      {/* Main CTA */}
      <button 
        className="cta-button" 
        onClick={handleMessageUs}
      >
        <span>💬</span> Get Started Now
      </button>
      
      <p className="guarantee-text">
        <span className="guarantee-icon">⏱️</span> Setup in under 15 minutes • 30-day money back guarantee
      </p>
      
      {/* Payment Options */}
      <div className="payment-options-container">
        <p className="payment-options-title">We accept all major payment methods:</p>
        <div className="payment-options-grid">
          {paymentOptions.map(opt => {
            return (
              <div key={opt.name} className="payment-option">
                <div className={`payment-option-icon-container ${opt.name === 'Wise' ? 'wise' : ''}`}>
                  <img 
                    src={opt.logo} 
                    alt={opt.name} 
                    className="payment-option-icon" 
                  />
                </div>
                <span className="payment-option-name">{opt.name}</span>
              </div>
            );
          })}
        </div>
        <div className="payment-options-note">
          Don't see your preferred payment method? <button onClick={handleMessageUs} className="contact-link">Let us know</button>
        </div>
      </div>
      
      {/* Social Proof */}
      <div className="social-proof">
        <p>🔒 Secure Payment • 24/7 Support • 4.9/5 User Rating (1,200+ reviews)</p>
      </div>
      
      {/* Back Button - Moved to bottom */}
      <Link to="/" className="back-link bottom-back-link">
        <span className="back-arrow">←</span>
        <span className="back-text">Back to Home</span>
      </Link>
      
      {/* Contact Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Contact Us for Payment</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close-button"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-description">
              <p>We process payments manually to provide you with:</p>
              <ul className="payment-benefits-list">
                <li>Personalized setup assistance</li>
                <li>Flexible payment options</li>
                <li>Direct support during onboarding</li>
                <li>No automated subscription renewals</li>
              </ul>
              <p className="mt-4">Choose your preferred messaging platform to start the payment process:</p>
            </div>
            
            <div className="contact-options-grid">
              {contactOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleContactOption(option.name, option.link)}
                  className={`contact-option-button ${option.cssClass}`}
                >
                  <span className="contact-option-icon">{option.icon}</span>
                  <span className="contact-option-text">Contact via {option.name}</span>
                </button>
              ))}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowModal(false)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
