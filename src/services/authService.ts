import { supabase, getCurrentUser, getUserProfile, recordDeviceSession, getSession } from './supabaseClient';

// Types
interface UserDevice {
  deviceId: string;
  name: string;
  lastLogin: number; // timestamp
}

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  devices: UserDevice[];
}

// Generate a unique device ID based on browser and device information with fallbacks for different browsers
const generateDeviceId = (): string => {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    
    // Get browser-specific information with fallbacks
    const userAgent = nav.userAgent || 'unknown';
    const screenHeight = screen?.height || window.innerHeight || 0;
    const screenWidth = screen?.width || window.innerWidth || 0;
    const colorDepth = screen?.colorDepth || screen?.pixelDepth || 24;
    const timezone = new Date().getTimezoneOffset();
    const language = nav.language || nav.languages?.[0] || 'unknown';
    
    // Additional browser fingerprinting data that's more stable across sessions
    const platform = nav.platform || 'unknown';
    const doNotTrack = nav.doNotTrack || 'unknown';
    const cookieEnabled = nav.cookieEnabled ? '1' : '0';
    
    // Get canvas fingerprint if available (more unique across devices)
    let canvasFingerprint = 'no-canvas';
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a unique pattern
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('TraceMate', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('TraceMate', 4, 17);
        
        // Get the data URL and create a hash from it
        canvasFingerprint = canvas.toDataURL();
      }
    } catch (e) {
      console.warn('Canvas fingerprinting not supported', e);
    }
    
    // Collect device information with fallbacks for different browsers
    const info = [
      userAgent,
      screenWidth,
      screenHeight,
      colorDepth,
      timezone,
      language,
      platform,
      doNotTrack,
      cookieEnabled,
      canvasFingerprint.length > 20 ? canvasFingerprint.substring(0, 20) : 'no-canvas' // Just use part of it to keep the ID manageable
    ].join('|');
    
    // Create a hash of the device info
    let hash = 0;
    for (let i = 0; i < info.length; i++) {
      const char = info.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to a positive hex string
    const deviceId = Math.abs(hash).toString(16);
    
    // Store it in localStorage for consistency
    localStorage.setItem('tracemate_device_id', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    
    // Fallback to stored ID if available
    const storedId = localStorage.getItem('tracemate_device_id');
    if (storedId) return storedId;
    
    // Last resort: generate a random ID and store it
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('tracemate_device_id', randomId);
    return randomId;
  }
};

// Get current device info
const getCurrentDevice = (): UserDevice => {
  const deviceId = generateDeviceId();
  const userAgent = window.navigator.userAgent;
  
  // Determine device name from user agent
  let name = 'Unknown Device';
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    name = 'iOS Device';
  } else if (/Android/.test(userAgent)) {
    name = 'Android Device';
  } else if (/Windows/.test(userAgent)) {
    name = 'Windows Device';
  } else if (/Mac/.test(userAgent)) {
    name = 'Mac Device';
  } else if (/Linux/.test(userAgent)) {
    name = 'Linux Device';
  }
  
  return {
    deviceId,
    name,
    lastLogin: Date.now()
  };
};

// Login user and handle device tracking
const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    if (!data.user || !data.session) {
      return { success: false, message: 'Login failed' };
    }
    
    // Get current device
    const currentDevice = getCurrentDevice();
    
    // Record device session in Supabase
    await recordDeviceSession(data.user.id, currentDevice.deviceId, currentDevice.name);
    
    // Store user email in localStorage for convenience
    localStorage.setItem('userEmail', email);
    
    // Create a session cookie with a longer expiration
    document.cookie = `tracemate_session=${data.session.access_token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
    
    // Check and store premium status
    try {
      const { data: profile } = await getUserProfile(data.user.id);
      const isPremium = profile?.is_premium || false;
      
      // Store premium status in localStorage
      localStorage.setItem('userPremiumStatus', String(isPremium));
      
      // Also store in sessionStorage for immediate access
      sessionStorage.setItem('userPremiumStatus', String(isPremium));
      
      // Create a cookie for premium status that persists across browser sessions
      document.cookie = `premium_status=${isPremium}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
      
      // If user is premium, log it for debugging
      if (isPremium) {
        console.log('Premium user logged in successfully');
      }
      
      // Dispatch a custom event that other components can listen for
      window.dispatchEvent(new CustomEvent('premiumStatusUpdated', { detail: { isPremium } }));
    } catch (profileError) {
      console.error('Error fetching premium status during login:', profileError);
      // Default to non-premium if we can't verify
      localStorage.setItem('userPremiumStatus', 'false');
      sessionStorage.setItem('userPremiumStatus', 'false');
    }
    
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

// Check if user is logged in - now uses Supabase session
const isLoggedIn = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    // Check if token is expired
    const expiresAt = data.session.expires_at;
    if (expiresAt) {
      const expiryTime = new Date(expiresAt * 1000); // Convert to milliseconds
      const now = new Date();
      
      // If token is expired or about to expire in the next 5 minutes
      if (expiryTime <= new Date(now.getTime() + 5 * 60 * 1000)) {
        // Try to refresh the session
        const refreshed = await refreshAuthSession();
        return refreshed.success;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Synchronous version for backward compatibility
const isLoggedInSync = (): boolean => {
  try {
    // Check for token in localStorage
    const tokenString = localStorage.getItem('sb-obfdfrblfwinujayhezc-auth-token');
    if (!tokenString) return false;
    
    // Parse the token to check expiration
    const tokenData = JSON.parse(tokenString);
    if (!tokenData || !tokenData.expiresAt) return false;
    
    // Check if token is expired
    const expiryTime = new Date(tokenData.expiresAt * 1000); // Convert to milliseconds
    const now = new Date();
    
    // Return false if token is expired or about to expire in the next 5 minutes
    return expiryTime > new Date(now.getTime() + 5 * 60 * 1000);
  } catch (error) {
    // If there's any error parsing the token, assume not logged in
    console.error('Error checking login status synchronously:', error);
    return false;
  }
};

// Check if user is premium - now treats all logged-in users as premium
const isPremiumUser = async (): Promise<boolean> => {
  try {
    // Check if user is logged in - if yes, they are premium
    const user = await getCurrentUser();
    if (user) {
      // User is logged in, so they are premium
      console.log('User is logged in, treating as premium');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};

// Synchronous version for backward compatibility
const isPremiumUserSync = (): boolean => {
  // If user is logged in, they are premium
  if (isLoggedInSync()) {
    // Set premium status in all storage mechanisms
    localStorage.setItem('userPremiumStatus', 'true');
    sessionStorage.setItem('userPremiumStatus', 'true');
    document.cookie = `premium_status=true; path=/; max-age=2592000; SameSite=Strict`; // 30 days
    
    // Dispatch an event to notify any listening components
    try {
      window.dispatchEvent(new CustomEvent('premiumStatusUpdated', { detail: { isPremium: true } }));
    } catch (err) {
      // Ignore errors from event dispatch
    }
    
    return true;
  }
  
  return false;
};

// Get user's devices from Supabase
const getUserDevices = async (): Promise<UserDevice[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id);
      
    if (error || !data) return [];
    
    return data.map(session => ({
      deviceId: session.device_id,
      name: session.device_name || 'Unknown Device',
      lastLogin: new Date(session.last_active).getTime()
    }));
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};

// Logout user - now uses Supabase auth
const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPremiumStatus');
};

// Verify device is authorized with Supabase - now allows unlimited devices
const verifyDevice = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Generate a device ID for this device if not already stored
    const currentDeviceId = localStorage.getItem('tracemate_device_id') || generateDeviceId();
    
    // Get current device info
    const currentDevice = getCurrentDevice();
    
    // Always record this device session - allowing unlimited devices
    await recordDeviceSession(user.id, currentDeviceId, currentDevice.name);
    
    // Update the last active timestamp for this device
    try {
      await supabase
        .from('sessions')
        .upsert({
          user_id: user.id,
          device_id: currentDeviceId,
          device_name: currentDevice.name,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'user_id, device_id'
        });
    } catch (updateError) {
      console.warn('Error updating device session:', updateError);
      // Continue anyway - this is just for tracking
    }
    
    // Always return true for logged-in users - allowing unlimited devices
    return true;
  } catch (error) {
    console.error('Error verifying device:', error);
    
    // Fallback: if we can't verify with the server, check if logged in
    const session = await getSession();
    return !!session;
  }
};

// Synchronous version for backward compatibility - now allows unlimited devices
const verifyDeviceSync = (): boolean => {
  try {
    // Simply check if the user is logged in - all devices are allowed
    const isLoggedIn = isLoggedInSync();
    
    // If logged in, store verification status for future quick checks
    if (isLoggedIn) {
      localStorage.setItem('tracemate_device_verified', 'true');
      localStorage.setItem('tracemate_device_verified_time', Date.now().toString());
      
      // Ensure we have a device ID stored
      if (!localStorage.getItem('tracemate_device_id')) {
        localStorage.setItem('tracemate_device_id', generateDeviceId());
      }
    }
    
    // Always return true for logged-in users - allowing unlimited devices
    return isLoggedIn;
  } catch (error) {
    console.error('Error in verifyDeviceSync:', error);
    return false;
  }
};

// Get current user data
const getCurrentUserData = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data: profile } = await getUserProfile(user.id);
    return {
      id: user.id,
      email: user.email,
      ...profile
    };
  } catch (error) {
    console.error('Error getting current user data:', error);
    return null;
  }
};

// Refresh the session token
const refreshAuthSession = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error('Error refreshing session:', error);
      return { success: false, message: error?.message || 'Failed to refresh session' };
    }
    
    // Update the session cookie
    document.cookie = `tracemate_session=${data.session.access_token}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
    
    // Dispatch an event to notify components that the session was refreshed
    window.dispatchEvent(new CustomEvent('sessionRefreshed', { 
      detail: { timestamp: new Date().getTime() } 
    }));
    
    return { success: true, message: 'Session refreshed successfully' };
  } catch (error) {
    console.error('Error in refreshSession:', error);
    return { success: false, message: 'An unexpected error occurred while refreshing session' };
  }
};

export default {
  // Async functions
  login,
  logout,
  isLoggedIn,
  isPremiumUser,
  getUserDevices,
  verifyDevice,
  getCurrentDevice,
  getCurrentUserData,
  refreshSession: refreshAuthSession,
  
  // Sync functions for backward compatibility
  isLoggedInSync,
  isPremiumUserSync,
  verifyDeviceSync,
  
  // Utility functions
  generateDeviceId
};
