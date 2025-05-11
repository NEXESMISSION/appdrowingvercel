import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import authService from '../services/authService';

// Define the shape of our context
interface AuthContextType {
  isLoggedIn: boolean;
  isPremium: boolean;
  user: any | null;
  checkLoginStatus: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isPremium: false,
  user: null,
  checkLoginStatus: async () => {},
  refreshToken: async () => false
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number>(Date.now());

  // Function to refresh the auth token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const result = await authService.refreshSession();
      if (result.success) {
        // Update last activity timestamp
        setLastActivityTimestamp(Date.now());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      // Use the synchronous version for immediate UI update
      const loggedInSync = authService.isLoggedInSync();
      
      if (loggedInSync !== isLoggedIn) {
        setIsLoggedIn(loggedInSync);
      }
      
      // Also check premium status
      if (loggedInSync) {
        const premiumSync = authService.isPremiumUserSync();
        setIsPremium(premiumSync);
      }
      
      // Then verify with the async version for accuracy
      const confirmedLoggedIn = await authService.isLoggedIn();
      
      if (confirmedLoggedIn !== isLoggedIn) {
        setIsLoggedIn(confirmedLoggedIn);
        
        // Update premium status if logged in
        if (confirmedLoggedIn) {
          const confirmedPremium = await authService.isPremiumUser();
          setIsPremium(confirmedPremium);
          
          // Get current user data
          const currentUser = await authService.getCurrentUserData();
          setUser(currentUser);
        } else {
          setIsPremium(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }, [isLoggedIn]);

  // Track user activity to maintain session
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTimestamp(Date.now());
    };

    // Listen for user activity events
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousemove', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    };
  }, []);

  // Check for session timeout and refresh token when needed
  useEffect(() => {
    const SESSION_TIMEOUT = 25 * 60 * 1000; // 25 minutes in milliseconds
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

    const checkSessionTimeout = async () => {
      if (!isLoggedIn) return;

      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTimestamp;

      // If user has been inactive for too long, refresh the token
      if (timeSinceLastActivity > REFRESH_INTERVAL && timeSinceLastActivity < SESSION_TIMEOUT) {
        console.log('Refreshing token due to inactivity');
        await refreshToken();
      }
    };

    const sessionCheckInterval = setInterval(checkSessionTimeout, 60000); // Check every minute

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [isLoggedIn, lastActivityTimestamp]);

  // Handle route changes to maintain session state
  useEffect(() => {
    const handleRouteChange = () => {
      if (isLoggedIn) {
        // Update activity timestamp on route change
        setLastActivityTimestamp(Date.now());
        
        // Verify session is still valid on route change
        checkLoginStatus();
      }
    };

    // Listen for browser history changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Use a simpler approach to detect navigation changes
    // Create a custom event for route changes
    const routeChangeEvent = new Event('routeChange');
    
    // Create a MutationObserver to watch for changes to the URL
    const observer = new MutationObserver(() => {
      // When the DOM changes, check if the URL has changed
      window.dispatchEvent(routeChangeEvent);
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document, { subtree: true, childList: true });
    
    // Listen for our custom route change event
    window.addEventListener('routeChange', handleRouteChange);
    
    // Also listen for clicks on anchor tags
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        // Trigger route change event on anchor clicks
        setTimeout(handleRouteChange, 100);
      }
    });
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routeChange', handleRouteChange);
      document.removeEventListener('click', handleRouteChange);
      observer.disconnect();
    };
  }, [isLoggedIn, checkLoginStatus]);

  // Check login status when the component mounts
  useEffect(() => {
    checkLoginStatus();
    
    // Set up listeners for login status changes
    const handleStorageChange = (e: StorageEvent) => {
      // Check for Supabase auth token changes
      if (e.key === 'sb-obfdfrblfwinujayhezc-auth-token' || 
          e.key === 'userToken' || 
          e.key === 'userEmail' || 
          e.key === 'userPremiumStatus') {
        checkLoginStatus();
      }
    };
    
    // Listen for custom auth events
    const handleAuthEvent = () => {
      checkLoginStatus();
    };
    
    // Check login status periodically (every 5 minutes)
    const loginCheckInterval = setInterval(checkLoginStatus, 5 * 60 * 1000);
    
    // Listen for storage events (login/logout in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events
    window.addEventListener('premiumStatusUpdated', handleAuthEvent);
    window.addEventListener('authStateChange', handleAuthEvent);
    
    return () => {
      clearInterval(loginCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('premiumStatusUpdated', handleAuthEvent);
      window.removeEventListener('authStateChange', handleAuthEvent);
    };
  }, [checkLoginStatus]);

  // Value provided to consuming components
  const value = {
    isLoggedIn,
    isPremium,
    user,
    checkLoginStatus,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
