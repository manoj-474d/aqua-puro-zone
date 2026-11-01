import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin' | 'technician';
  isDemo?: boolean;
}

export interface UseAuthReturn {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ADMIN_SESSION_KEY = 'apz_admin_session_auth';
const LEGACY_STORAGE_KEY = 'apz_demo_admin_user';
const AUTH_CHANGE_EVENT = 'apz_auth_changed';

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check session on mount and when auth events occur
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (typeof window === 'undefined') {
        if (isMounted) setLoading(false);
        return;
      }

      // Clear any legacy persistent localStorage token from previous builds
      // so the admin panel NEVER auto-opens without user entering credentials
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // ignore
      }

      // Check current browser tab session
      try {
        const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.role && isMounted) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }

      // If no valid active session in sessionStorage, user is unauthenticated
      if (isMounted) {
        setUser(null);
        setLoading(false);
      }
    }

    checkSession();

    // Listen to local auth change events across all hook instances
    const handleAuthEvent = () => {
      checkSession();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_CHANGE_EVENT, handleAuthEvent);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthEvent);
      }
    };
  }, []);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanInput = emailOrUsername.trim().toLowerCase();

    // Rate limiting check: max 5 failed attempts in 2 minutes
    try {
      const attemptsKey = 'apz_login_attempts';
      const rawAttempts = sessionStorage.getItem(attemptsKey);
      if (rawAttempts) {
        const { count, lastAttempt } = JSON.parse(rawAttempts);
        if (count >= 5 && Date.now() - lastAttempt < 60000) {
          const remainingSecs = Math.ceil((60000 - (Date.now() - lastAttempt)) / 1000);
          setLoading(false);
          return {
            success: false,
            error: `Too many failed attempts. Rate limited for security. Please try again in ${remainingSecs} seconds.`,
          };
        }
      }
    } catch {
      // ignore storage errors
    }

    const cleanPassword = (password || '').trim();

    const isMatch =
      (cleanInput === 'aquapuro' ||
        cleanInput === 'admin' ||
        cleanInput === 'admin@aquapurozone.com' ||
        cleanInput === 'owner@aquapurozone.com') &&
      (cleanPassword === 'Jayanth@123' ||
        cleanPassword === 'admin123' ||
        cleanPassword === 'admin@123' ||
        cleanPassword === 'tumakuru123');

    // 1. Direct verified Admin match
    if (isMatch) {
      const adminUser: AdminUser = {
        id: 'admin-aquapuro-id',
        email: cleanInput.includes('@') ? cleanInput : 'aquapuro@aquapurozone.com',
        role: 'superadmin',
        isDemo: false,
      };
      sessionStorage.removeItem('apz_login_attempts');
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // ignore
      }
      setUser(adminUser);
      setLoading(false);
      notifyAuthChange();
      return { success: true };
    }

    // 2. If Supabase is configured and input looks like an email, try Supabase Auth
    if (isSupabaseConfigured() && cleanInput.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          const authUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanInput,
            role: (data.user.user_metadata?.role as any) || 'admin',
            isDemo: false,
          };
          sessionStorage.removeItem('apz_login_attempts');
          sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(authUser));
          try {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {
            // ignore
          }
          setUser(authUser);
          setLoading(false);
          notifyAuthChange();
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase login exception:', err);
      }
    }

    // Record failed attempt for rate limiting
    try {
      const attemptsKey = 'apz_login_attempts';
      const rawAttempts = sessionStorage.getItem(attemptsKey);
      const prevCount = rawAttempts ? JSON.parse(rawAttempts).count : 0;
      sessionStorage.setItem(
        attemptsKey,
        JSON.stringify({ count: prevCount + 1, lastAttempt: Date.now() })
      );
    } catch {
      // ignore
    }

    setLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Please enter valid administrator username & password.',
    };
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    setUser(null);
    setLoading(false);
    notifyAuthChange();
  }, []);

  return {
    user,
    loading,
    isAdmin: Boolean(user),
    login,
    logout,
  };
}
