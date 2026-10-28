import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import { Order, OrderStatus } from '../../types';
import { StatsCards } from './StatsCards';
import { OrderTable } from './OrderTable';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  setSupabaseCredentials,
  clearSupabaseCredentials,
  checkSupabaseConnection,
  SupabaseHealthCheck,
} from '../../lib/supabaseClient';

interface OrdersDashboardProps {
  onReturnToStorefront: () => void;
  whatsappNumber: string;
}

export const OrdersDashboard: React.FC<OrdersDashboardProps> = ({
  onReturnToStorefront,
  whatsappNumber,
}) => {
  const { user, logout } = useAuth();
  const {
    orders,
    loading,
    error,
    refreshOrders,
    updateStatus,
    updateDetails,
    deleteOrder,
    newOrderToast,
    dismissToast,
    isRealtimeConnected,
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'config' | 'sql'>('orders');

  // Supabase connection settings form state
  const [customUrl, setCustomUrl] = useState(SUPABASE_URL || '');
  const [customKey, setCustomKey] = useState(SUPABASE_ANON_KEY || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseHealthCheck | null>(null);

  const isConfigured = isSupabaseConfigured();

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Email',
      'Area',
      'Address',
      'Order Type',
      'Status',
      'Total Amount',
      'Payment Status',
      'Created At',
      'Notes',
    ];

    const rows = orders.map((o) => [
      `"${o.order_number}"`,
      `"${o.customer_name.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.email || ''}"`,
      `"${o.area}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${o.order_type}"`,
      `"${o.status}"`,
      o.total_amount,
      `"${o.payment_status}"`,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aqua_puro_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) return;
    setSupabaseCredentials(customUrl.trim(), customKey.trim());
  };

  const handleClearCredentials = () => {
    clearSupabaseCredentials();
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await checkSupabaseConnection(customUrl, customKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        ok: false,
        status: 'network_error',
        url: customUrl,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingConn(false);
    }
  };

  const handleCopySql = async () => {
    const fullSql = `-- AQUA PURO ZONE TUMAKURU - SUPABASE DATABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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

    await navigator.clipboard.writeText(fullSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col antialiased">
      {/* Realtime New Order Audio & Visual Toast Alert */}
      {newOrderToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#06284b] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#27c4d9] flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#27c4d9]">
                Live Supabase Alert
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">
                {newOrderToast.order_number}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white truncate">
              New order from {newOrderToast.customer_name}
            </h4>
            <p className="text-xs text-slate-300 truncate">
              {newOrderToast.area} • ₹{Number(newOrderToast.total_amount).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedOrder(newOrderToast);
                dismissToast();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#0b74de] text-white text-xs font-bold hover:bg-[#27c4d9] hover:text-[#06284b]"
            >
              View
            </button>
            <button
              onClick={dismissToast}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#06284b] text-[#27c4d9] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">water_drop</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-base text-[#06284b]">
                Client Orders &amp; Enquiries
              </h2>
              {/* Realtime Pulse Indicator */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isRealtimeConnected || !isConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={
                  isConfigured
                    ? 'Connected to live Supabase Postgres realtime channel'
                    : 'Demo local mode with instant order dispatch'
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isConfigured ? 'Supabase Realtime Live' : 'Demo Realtime'}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#414753] font-medium hidden sm:block">
              Centralized order dispatch for Sira Gate showroom &amp; Tumakuru service engineers
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={refreshOrders}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Orders"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#06284b] transition-colors border border-slate-200"
            title="Download CSV Spreadsheet"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={onReturnToStorefront}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#06284b] hover:bg-[#0b74de] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span className="hidden md:inline">Customer Storefront</span>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
            title={`Log out (${user?.email})`}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#0b74de] text-white shadow-xs'
                : 'text-[#414753] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            <span>All Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-[#0b74de] text-white shadow-xs'
                : 'text-[#414753] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>Supabase Connection</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-[#0b74de] text-white shadow-xs'
                : 'text-[#414753] hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>SQL Schema &amp; Setup Guide</span>
          </button>
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div>
            {/* KPI Stat Cards */}
            <StatsCards orders={orders} />

            {/* Orders Table & Cards */}
            <OrderTable
              orders={orders}
              loading={loading}
              onSelectOrder={(order) => setSelectedOrder(order)}
              onQuickUpdateStatus={(orderId, status) => updateStatus(orderId, status)}
            />
          </div>
        )}

        {/* Tab 2: Supabase Credentials & Live Status */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0b74de]/10 text-[#0b74de] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">cable</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#06284b]">
                  Supabase Live Connection Settings
                </h3>
                <p className="text-xs text-[#414753]">
                  Configure your project keys to connect to real Supabase Postgres &amp; Realtime.
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] shrink-0">
                {isConfigured ? 'check_circle' : 'info'}
              </span>
              <div>
                <strong className="block font-bold">
                  {isConfigured
                    ? 'Connected to Live Supabase Project'
                    : 'Running in Local / Demo Mode'}
                </strong>
                <p className="mt-0.5 leading-relaxed">
                  {isConfigured
                    ? `Public website orders are saved directly to your Supabase Postgres database at ${SUPABASE_URL}. Realtime websocket changes are active.`
                    : 'All orders are currently preserved in browser local persistence with live notification simulation. To connect your live Supabase project, enter your Project URL and Anon Key below.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#06284b] mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#06284b] mb-1">
                  Supabase Project API Anon Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  required
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-[#f8faff] rounded-xl text-xs font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b74de]/30"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  ⚠️ Never enter your <code className="font-mono">service_role</code> key. Use only the public <code className="font-mono">anon</code> key.
                </p>
              </div>

              {/* Test Connection Button & Result */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConn || !customUrl.trim() || !customKey.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#06284b] font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors disabled:opacity-50"
                >
                  {testingConn ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Testing Connection to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-[#0b74de]">speed</span>
                      <span>Test Live Connection &amp; Check "orders" Table</span>
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

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0b74de] hover:bg-[#06284b] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save &amp; Connect Live
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Reset to Demo Mode
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: SQL Schema & Setup Guide */}
        {activeTab === 'sql' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#06284b]">
                  Supabase Database Setup Guide
                </h3>
                <p className="text-xs text-[#414753]">
                  Run this SQL in your Supabase SQL Editor to initialize orders, triggers, RLS, and seed data.
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#06284b] text-[#27c4d9] text-xs font-bold flex items-center gap-1.5 hover:bg-[#0b74de] hover:text-white transition-colors"
              >
                <span>Open Supabase Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>

            {/* Quick Step by Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#0b74de] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                  1
                </div>
                <h5 className="font-bold text-[#06284b]">Create Project</h5>
                <p className="text-[#414753] mt-1 text-[11px]">
                  Go to supabase.com and create a free project in Asia (Mumbai / Singapore).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#0b74de] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                  2
                </div>
                <h5 className="font-bold text-[#06284b]">Run SQL Schema</h5>
                <p className="text-[#414753] mt-1 text-[11px]">
                  Open SQL Editor, paste the contents of <code className="font-mono">supabase/schema.sql</code> and click Run.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#0b74de] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                  3
                </div>
                <h5 className="font-bold text-[#06284b]">Enable Realtime</h5>
                <p className="text-[#414753] mt-1 text-[11px]">
                  Database &gt; Publications &gt; supabase_realtime &gt; enable "orders" and "order_items".
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faff] border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-[#0b74de] text-white font-bold flex items-center justify-center text-[11px] mb-2">
                  4
                </div>
                <h5 className="font-bold text-[#06284b]">Copy API Keys</h5>
                <p className="text-[#414753] mt-1 text-[11px]">
                  Under Settings &gt; API, copy the URL and Anon Key into <code className="font-mono">.env</code> or the Connection tab.
                </p>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative rounded-2xl bg-[#06284b] text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-96">
              <div className="sticky top-0 right-0 flex justify-end pb-2">
                <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                  File: /supabase/schema.sql
                </span>
              </div>
              <pre className="text-[11px] leading-relaxed text-cyan-200">
{`-- Orders table with sequence and RLS
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1;

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  area TEXT NOT NULL DEFAULT 'Sira Gate, Tumakuru',
  order_type TEXT NOT NULL DEFAULT 'purchase',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'website_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can create orders (public storefront checkout)
CREATE POLICY "Allow public order creation"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow read access to orders (enables dashboard & realtime)
CREATE POLICY "Allow read access to orders"
ON public.orders FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Allow update access (for status and admin notes)
CREATE POLICY "Allow update access to orders"
ON public.orders FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Order items policies
CREATE POLICY "Allow full access to order items"
ON public.order_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={updateStatus}
        onUpdateDetails={updateDetails}
        onDeleteOrder={deleteOrder}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
};
