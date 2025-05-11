import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obfdfrblfwinujayhezc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmRmcmJsZndpbnVqYXloZXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5Nzc3NDIsImV4cCI6MjA2MjU1Mzc0Mn0.ZgYPSvZ87XAK2Zb8Zj4ACNdSR958_yUS67EdHbSTETg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for auth
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  return { data, error };
};

// Helper functions for user profiles
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
    
  return { data, error };
};

// Helper functions for session management
export const recordDeviceSession = async (userId: string, deviceId: string, deviceName: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      user_id: userId,
      device_id: deviceId,
      device_name: deviceName,
      last_active: new Date().toISOString()
    }, {
      onConflict: 'user_id, device_id'
    });
    
  return { data, error };
};

export const recordSessionUse = async (userId: string) => {
  const { data, error } = await supabase.rpc('record_session_use', { user_id: userId });
  return { data, error };
};

export const hasReachedSessionLimit = async (userId: string) => {
  const { data, error } = await supabase.rpc('has_reached_session_limit', { user_id: userId });
  return { data, error };
};

export const isPremiumUser = async (userId: string) => {
  const { data, error } = await supabase.rpc('is_premium_user', { user_id: userId });
  return { data, error };
};

// Helper functions for subscriptions
export const createSubscription = async (userId: string, subscriptionType: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      subscription_type: subscriptionType,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: subscriptionType === 'lifetime' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days for monthly
    });
    
  // Update the user profile to premium
  if (!error) {
    await updateUserProfile(userId, { is_premium: true });
  }
    
  return { data, error };
};

export const getActiveSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  return { data, error };
};
