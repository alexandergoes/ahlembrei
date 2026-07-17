import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

async function enrichUser(authUser) {
  if (!authUser) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type, role')
    .eq('id', authUser.id)
    .single();
  return { ...authUser, plan: profile?.plan_type || 'free', role: profile?.role || 'user' };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('getUser error:', error.message);
        setUser(null);
      } else {
        setUser(await enrichUser(data?.user ?? null));
      }
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(await enrichUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  const signUp = async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(await enrichUser(data.user));
  };

  const value = { user, loading, signInWithEmail, signUp, signOut, resetPassword, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}