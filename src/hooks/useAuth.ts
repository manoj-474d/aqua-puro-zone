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

const DEMO_ADMIN_SESSION_KEY = 'apz_demo_admin_user';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check initial session
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      setLoading(true);

      // 1. Check local demo session first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(DEMO_ADMIN_SESSION_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (isMounted) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
          }
        }
      }

      // 2. If Supabase configured, check Supabase Auth session
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user && isMounted) {
            const authUser = data.session.user;
            setUser({
              id: authUser.id,
              email: authUser.email || 'admin@aquapurozone.com',
              role: (authUser.user_metadata?.role as any) || 'admin',
              isDemo: false,
            });
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    checkSession();

    // Listen to Supabase auth state changes if configured
    let subscription: any = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'admin@aquapurozone.com',
            role: (session.user.user_metadata?.role as any) || 'admin',
            isDemo: false,
          });
        } else if (!localStorage.getItem(DEMO_ADMIN_SESSION_KEY)) {
          setUser(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, attempt real Supabase Auth
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          // If Supabase fails, allow fallback demo login for admin@aquapurozone.com
          if (
            (cleanEmail === 'admin@aquapurozone.com' || cleanEmail === 'owner@aquapurozone.com') &&
            (password === 'admin123' || password === 'admin@123' || password === 'tumakuru123')
          ) {
            const demoUser: AdminUser = {
              id: 'demo-admin-id',
              email: cleanEmail,
              role: 'admin',
              isDemo: true,
            };
            localStorage.setItem(DEMO_ADMIN_SESSION_KEY, JSON.stringify(demoUser));
            setUser(demoUser);
            setLoading(false);
            return { success: true };
          }

          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data?.user) {
          const authUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role: (data.user.user_metadata?.role as any) || 'admin',
            isDemo: false,
          };
          localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
          setUser(authUser);
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase login exception:', err);
      }
    }

    // 2. Demo fallback authentication for testing without configuring Supabase immediately
    if (
      (cleanEmail === 'admin@aquapurozone.com' || cleanEmail === 'owner@aquapurozone.com') &&
      (password === 'admin123' || password === 'admin@123' || password === 'tumakuru123')
    ) {
      const demoUser: AdminUser = {
        id: 'demo-admin-id',
        email: cleanEmail,
        role: 'admin',
        isDemo: true,
      };
      localStorage.setItem(DEMO_ADMIN_SESSION_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Demo credentials: admin@aquapurozone.com / admin123',
    };
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    setUser(null);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAdmin: Boolean(user),
    login,
    logout,
  };
}
