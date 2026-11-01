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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
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
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-heading">
            Aqua Puro Zone
          </h2>
          <p className="text-xs text-[#27c4d9] mt-0.5 font-medium">
            Authorized Administrator Portal • Tumakuru
          </p>
        </div>

        {onReturnToStorefront && (
          <button
            type="button"
            onClick={onReturnToStorefront}
            className="w-full mb-5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#27c4d9] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>← Back to Public Website (Home)</span>
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Username or Admin Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                account_circle
              </span>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#27c4d9]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#27c4d9]/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0b74de] to-[#27c4d9] hover:from-[#06284b] hover:to-[#0b74de] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
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

        {onReturnToStorefront && (
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <button
              onClick={onReturnToStorefront}
              className="text-xs text-[#27c4d9] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Return to Public Customer Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

