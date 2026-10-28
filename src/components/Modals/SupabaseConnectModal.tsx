import React, { useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  setSupabaseCredentials,
  clearSupabaseCredentials,
  checkSupabaseConnection,
  SupabaseHealthCheck,
} from '../../lib/supabaseClient';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState(SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(SUPABASE_ANON_KEY || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseHealthCheck | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen) {
      setUrl(SUPABASE_URL || '');
      setAnonKey(SUPABASE_ANON_KEY || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await checkSupabaseConnection(url, anonKey);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        ok: false,
        status: 'network_error',
        url: url,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;
    setSupabaseCredentials(url.trim(), anonKey.trim());
    if (onConnected) onConnected();
    onClose();
  };

  const handleReset = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
  };

  const handleCopySql = async () => {
    try {
      // Fetch or copy the schema content
      const schemaSql = `-- AQUA PURO ZONE TUMAKURU - SUPABASE DATABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ORDERS TABLE
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 2),
  phone TEXT NOT NULL CHECK (length(regexp_replace(phone, '\\D', '', 'g')) >= 10),
  email TEXT,
  address TEXT,
  area TEXT NOT NULL DEFAULT 'Sira Gate, Tumakuru',
  order_type TEXT NOT NULL DEFAULT 'purchase' CHECK (order_type IN ('purchase', 'service', 'installation', 'enquiry')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'delivered', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'website_form',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Allow storefront orders & dashboard management)
DROP POLICY IF EXISTS "Allow public order creation" ON public.orders;
CREATE POLICY "Allow public order creation" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access to orders" ON public.orders;
CREATE POLICY "Allow read access to orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update access to orders" ON public.orders;
CREATE POLICY "Allow update access to orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete access to orders" ON public.orders;
CREATE POLICY "Allow delete access to orders" ON public.orders FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow full access to order items" ON public.order_items;
CREATE POLICY "Allow full access to order items" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. REALTIME PUBLICATION
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'order_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
END $$;
ALTER TABLE public.orders REPLICA IDENTITY FULL;`;

      await navigator.clipboard.writeText(schemaSql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-[#27c4d9]/50 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-[#131b2e]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06284b] via-[#0b74de] to-[#06284b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#27c4d9]/20 flex items-center justify-center text-[#27c4d9]">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Supabase Database Setup &amp; Status
              </h3>
              <p className="text-xs text-[#27c4d9] font-medium">
                Connect your central PostgreSQL database for live orders &amp; realtime sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5 text-emerald-600">
              {isConfigured ? 'check_circle' : 'warning'}
            </span>
            <div className="text-xs flex-1">
              <strong className="block text-sm font-bold">
                {isConfigured ? 'Live Supabase Cloud Connected' : 'Running in Local Demo Mode'}
              </strong>
              <p className="mt-1 leading-relaxed text-[12px]">
                {isConfigured ? (
                  <>
                    Orders placed on the website are being sent directly to your Supabase PostgreSQL table (<code className="bg-white/60 px-1 py-0.5 rounded font-mono">public.orders</code>) at <span className="font-mono font-bold break-all">{SUPABASE_URL}</span>.
                  </>
                ) : (
                  <>
                    Supabase is not configured yet. Orders placed now are saved only in your local browser storage. To receive orders in your real Supabase dashboard, paste your Project URL and Anon Key below.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-[#f0f9ff] border border-[#27c4d9]/40 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-[#06284b] flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#0b74de]">help</span>
              How to connect in 2 minutes:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[#414753] text-[11px] leading-relaxed">
              <li>
                Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#0b74de] font-bold underline inline-flex items-center gap-0.5">supabase.com <span className="material-symbols-outlined text-[12px]">open_in_new</span></a> and create or open your project.
              </li>
              <li>
                Open <strong>SQL Editor</strong>, click <strong>"New Query"</strong>, paste the schema, and click <strong>Run</strong>.
              </li>
              <li>
                In <strong>Project Settings &gt; API</strong>, copy the <strong>Project URL</strong> and <strong>anon (public)</strong> key, and paste them below.
              </li>
            </ol>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#06284b] font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <span className="material-symbols-outlined text-[15px] text-[#0b74de]">
                  {copiedSql ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSql ? 'Schema Copied!' : 'Copy Required SQL Schema'}</span>
              </button>
              <a
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#06284b] hover:bg-[#0b74de] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <span>Open Supabase SQL Editor</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#06284b] mb-1">
                Supabase Project URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#06284b]">
                  Supabase Project API Anon Key (public) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] text-[#0b74de] hover:underline font-medium"
                >
                  {showKey ? 'Hide Key' : 'Show Key'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Always use the public <code className="font-mono font-semibold">anon</code> key from Supabase Project Settings &gt; API.
              </p>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url.trim() || !anonKey.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#06284b] font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    <span>Testing Connection to Supabase...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#0b74de]">speed</span>
                    <span>Test Connection &amp; Check "orders" Table</span>
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`mt-2.5 p-3 rounded-xl border text-xs animate-in fade-in duration-150 ${
                    testResult.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : testResult.status === 'missing_tables'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[18px]">
                      {testResult.ok ? 'check_circle' : testResult.status === 'missing_tables' ? 'table_chart' : 'error'}
                    </span>
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.details && (
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-700 font-mono">
                      {testResult.details}
                    </p>
                  )}
                  {testResult.status === 'missing_tables' && (
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      <span>Copy SQL to create "orders" table</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Disconnect / Demo Mode
                </button>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06284b] to-[#0b74de] hover:from-[#06284b] hover:to-[#27c4d9] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                Save &amp; Connect Live
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
