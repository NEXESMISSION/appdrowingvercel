// Service to track and manage free user session limits using Supabase
import { supabase } from './supabaseClient';
import authService from './authService';

// Constants
const MAX_DAILY_SESSIONS = 5; // Maximum 5 sessions per day for free users

// Get the current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Get session data from Supabase
const getSessionData = async () => {
  try {
    // Check if user is authenticated
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { date: getCurrentDate(), sessionsUsed: 0 };
    }

    // Get session usage for today
    const { data, error } = await supabase
      .from('session_usage')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('session_date', getCurrentDate())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error fetching session data:', error);
      return { date: getCurrentDate(), sessionsUsed: 0 };
    }

    return {
      date: getCurrentDate(),
      sessionsUsed: data?.sessions_used || 0
    };
  } catch (error) {
    console.error('Error in getSessionData:', error);
    return { date: getCurrentDate(), sessionsUsed: 0 };
  }
};

// Local fallback for when Supabase is not available or user is not authenticated
const getLocalSessionData = () => {
  const storedData = localStorage.getItem('freeUserSessions');
  
  if (storedData) {
    const sessionData = JSON.parse(storedData);
    const currentDate = getCurrentDate();
    
    // If the stored date is not today, reset the counter
    if (sessionData.date !== currentDate) {
      const newData = {
        date: currentDate,
        sessionsUsed: 0
      };
      localStorage.setItem('freeUserSessions', JSON.stringify(newData));
      return newData;
    }
    
    return sessionData;
  }
  
  // No data found, create new session data for today
  const newData = {
    date: getCurrentDate(),
    sessionsUsed: 0
  };
  localStorage.setItem('freeUserSessions', JSON.stringify(newData));
  return newData;
};

// Record a new session use in Supabase
const recordSessionUse = async (): Promise<void> => {
  try {
    // Check if user is premium
    const isPremium = await authService.isPremiumUser();
    if (isPremium) {
      // Premium users don't consume session counts
      return;
    }

    // Get current user
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      // Fallback to local storage for non-authenticated users
      const sessionData = getLocalSessionData();
      sessionData.sessionsUsed += 1;
      localStorage.setItem('freeUserSessions', JSON.stringify(sessionData));
      return;
    }

    // Record session use in Supabase using the RPC function
    await supabase.rpc('record_session_use', { user_id: user.data.user.id });
  } catch (error) {
    console.error('Error recording session use:', error);
    // Fallback to local storage
    const sessionData = getLocalSessionData();
    sessionData.sessionsUsed += 1;
    localStorage.setItem('freeUserSessions', JSON.stringify(sessionData));
  }
};

// Synchronous version for immediate UI feedback
const recordSessionUseSync = (): void => {
  const sessionData = getLocalSessionData();
  sessionData.sessionsUsed += 1;
  localStorage.setItem('freeUserSessions', JSON.stringify(sessionData));
};

// Check if the user has reached their daily session limit
const hasReachedDailyLimit = async (): Promise<boolean> => {
  try {
    // Check if user is premium
    const isPremium = await authService.isPremiumUser();
    if (isPremium) {
      // Premium users have no limit
      return false;
    }
    
    // Check if user is logged in (even non-premium users get unlimited sessions when logged in)
    const isLoggedIn = await authService.isLoggedIn();
    if (isLoggedIn) {
      // Logged-in users also have no limit
      return false;
    }

    // Get current user
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      // Fallback to local storage for non-authenticated users
      const sessionData = getLocalSessionData();
      return sessionData.sessionsUsed >= MAX_DAILY_SESSIONS;
    }

    // Check if user has reached limit using the RPC function
    const { data, error } = await supabase.rpc('has_reached_session_limit', { user_id: user.data.user.id });
    
    if (error) {
      console.error('Error checking session limit:', error);
      // Fallback to local storage
      const sessionData = getLocalSessionData();
      return sessionData.sessionsUsed >= MAX_DAILY_SESSIONS;
    }

    return data || false;
  } catch (error) {
    console.error('Error in hasReachedDailyLimit:', error);
    // Fallback to local storage
    const sessionData = getLocalSessionData();
    return sessionData.sessionsUsed >= MAX_DAILY_SESSIONS;
  }
};

// Synchronous version for immediate UI feedback
const hasReachedDailyLimitSync = (): boolean => {
  // Check if user is premium using the sync version
  const isPremium = authService.isPremiumUserSync();
  if (isPremium) {
    // Premium users have no limit
    return false;
  }
  
  // Check if user is logged in (even non-premium users get unlimited sessions when logged in)
  const isLoggedIn = authService.isLoggedInSync();
  if (isLoggedIn) {
    // Logged-in users also have no limit
    return false;
  }

  // Use local storage data
  const sessionData = getLocalSessionData();
  return sessionData.sessionsUsed >= MAX_DAILY_SESSIONS;
};

// Get remaining sessions for today
const getRemainingSessionsToday = async (): Promise<number> => {
  try {
    // Check if user is premium
    const isPremium = await authService.isPremiumUser();
    if (isPremium) {
      // Premium users have unlimited sessions
      return Infinity;
    }

    const sessionData = await getSessionData();
    return Math.max(0, MAX_DAILY_SESSIONS - sessionData.sessionsUsed);
  } catch (error) {
    console.error('Error getting remaining sessions:', error);
    // Fallback to local storage
    const sessionData = getLocalSessionData();
    return Math.max(0, MAX_DAILY_SESSIONS - sessionData.sessionsUsed);
  }
};

// Synchronous version for immediate UI feedback
const getRemainingSessionsTodaySync = (): number => {
  // Check if user is premium using the sync version
  const isPremium = authService.isPremiumUserSync();
  if (isPremium) {
    // Premium users have unlimited sessions
    return Infinity;
  }

  // Use local storage data
  const sessionData = getLocalSessionData();
  return Math.max(0, MAX_DAILY_SESSIONS - sessionData.sessionsUsed);
};

// Get total sessions used today
const getSessionsUsedToday = async (): Promise<number> => {
  try {
    const sessionData = await getSessionData();
    return sessionData.sessionsUsed;
  } catch (error) {
    console.error('Error getting sessions used:', error);
    // Fallback to local storage
    const sessionData = getLocalSessionData();
    return sessionData.sessionsUsed;
  }
};

// Synchronous version for immediate UI feedback
const getSessionsUsedTodaySync = (): number => {
  const sessionData = getLocalSessionData();
  return sessionData.sessionsUsed;
};

export default {
  // Async functions
  recordSessionUse,
  hasReachedDailyLimit,
  getRemainingSessionsToday,
  getSessionsUsedToday,
  
  // Sync functions for immediate UI feedback
  recordSessionUseSync,
  hasReachedDailyLimitSync,
  getRemainingSessionsTodaySync,
  getSessionsUsedTodaySync
};
