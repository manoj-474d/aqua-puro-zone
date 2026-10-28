import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabaseClient';

interface AdminLoginProps {
  onSuccess?: () => void;
  onReturnToStorefront?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onReturnToStorefront,
}) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@aquapurozone.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || 'Login failed. Please check credentials.');
    }
  };

  const handleUseDemo = async () => {
    setEmail('admin@aquapurozone.com');
    setPassword('admin123');
    setError(null);
    const result = await login('admin@aquapurozone.com', 'admin123');
    if (result.success) {
      onSuccess?.();
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#06284b] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient water glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#0b74de]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#27c4d9]/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#081f38] border-2 border-[#27c4d9]/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0b74de] to-[#27c4d9] flex items-center justify-center text-white shadow-lg mb-3">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-heading">
            Aqua Puro Zone
          </h2>
          <p className="text-xs text-[#27c4d9] mt-0.5 font-medium">
            Owner &amp; Client Orders Portal • Sira Gate Tumakuru
          </p>
        </div>

        {/* Supabase Connection Status Pill */}
        <div className="mb-5 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              Supabase Backend:{' '}
              <strong className={isConnected ? 'text-emerald-400' : 'text-amber-300'}>
                {isConnected ? 'Connected Live' : 'Demo / Local Mode'}
              </strong>
            </span>
          </div>
          {isConnected && (
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
              {SUPABASE_URL.replace('https://', '').split('.')[0]}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aquapurozone.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#27c4d9]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#27c4d9]/50 font-mono"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0b74de] to-[#27c4d9] hover:from-[#06284b] hover:to-[#0b74de] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                <span>Sign In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleUseDemo}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-[#27c4d9]">bolt</span>
            <span>1-Click Demo Admin Login (admin@aquapurozone.com)</span>
          </button>
        </div>

        {onReturnToStorefront && (
          <div className="mt-4 text-center">
            <button
              onClick={onReturnToStorefront}
              className="text-xs text-[#27c4d9] hover:underline"
            >
              ← Return to Public Customer Storefront
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
