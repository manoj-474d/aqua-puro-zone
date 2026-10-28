/**
 * Aqua Puro Zone - Supabase Client & Realtime Client Orders API
 * Connects to Supabase Postgres, Realtime, and Auth with offline/demo resilience.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types';

export function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/^['"]+|['"]+$/g, '').replace(/\/+$/, '');
}

export function sanitizeSupabaseKey(key: string): string {
  if (!key) return '';
  return key.trim().replace(/^['"]+|['"]+$/g, '').replace(/\s+/g, '');
}

// Read environment variables (supports Vite import.meta.env or window fallback)
const envUrl = sanitizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
const envKey = sanitizeSupabaseKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '');

// Optional user-stored keys in localStorage for live testing in preview
const storedUrl = typeof window !== 'undefined' ? sanitizeSupabaseUrl(localStorage.getItem('apz_supabase_url') || '') : '';
const storedKey = typeof window !== 'undefined' ? sanitizeSupabaseKey(localStorage.getItem('apz_supabase_anon_key') || '') : '';

export const DEFAULT_SUPABASE_URL = 'https://nvhtlhfqgewrbpibbpzz.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GF9AgbIIuxYjZ-0h2R6g6Q_JC31TkTF';

export const SUPABASE_URL = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Returns true if real, valid-looking Supabase credentials have been provided.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('your-project-id') &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY.length > 20
  );
}

// Fallback dummy URL/key so createClient doesn't throw on startup if unconfigured
const safeUrl = isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Update Supabase credentials dynamically (e.g. from Admin settings or modal)
 */
export function setSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);
    localStorage.setItem('apz_supabase_url', cleanUrl);
    localStorage.setItem('apz_supabase_anon_key', cleanKey);
    window.location.reload();
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apz_supabase_url');
    localStorage.removeItem('apz_supabase_anon_key');
    window.location.reload();
  }
}

/**
 * Live diagnostic check for Supabase connectivity and schema existence
 */
export interface SupabaseHealthCheck {
  ok: boolean;
  status: 'connected' | 'not_configured' | 'missing_tables' | 'auth_error' | 'network_error';
  url: string;
  orderCount?: number;
  message: string;
  details?: string;
}

export async function checkSupabaseConnection(customUrl?: string, customKey?: string): Promise<SupabaseHealthCheck> {
  const urlToTest = sanitizeSupabaseUrl(customUrl ?? SUPABASE_URL);
  const keyToTest = sanitizeSupabaseKey(customKey ?? SUPABASE_ANON_KEY);

  if (!urlToTest || !keyToTest || urlToTest.includes('your-project-id') || !urlToTest.startsWith('http') || keyToTest.length < 20) {
    return {
      ok: false,
      status: 'not_configured',
      url: urlToTest,
      message: 'Supabase URL or Anon API Key is missing or invalid.',
    };
  }

  try {
    const testClient = (customUrl || customKey) ? createClient(urlToTest, keyToTest) : supabase;

    // Check if `orders` table exists by running a lightweight head count query
    const { data, count, error } = await testClient
      .from('orders')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.warn('Supabase health check returned error:', error);
      if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
        return {
          ok: false,
          status: 'missing_tables',
          url: urlToTest,
          message: 'Connected to Supabase, but the "orders" table does not exist in your database!',
          details: 'Please open your Supabase SQL Editor and run /supabase/schema.sql to create the tables and policies.',
        };
      }
      if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('apikey')) {
        return {
          ok: false,
          status: 'auth_error',
          url: urlToTest,
          message: 'Supabase Anon Key is invalid or expired.',
          details: error.message,
        };
      }
      return {
        ok: false,
        status: 'network_error',
        url: urlToTest,
        message: `Supabase query error: ${error.message}`,
        details: error.details || error.hint || error.code,
      };
    }

    return {
      ok: true,
      status: 'connected',
      url: urlToTest,
      orderCount: count ?? data?.length ?? 0,
      message: `Successfully connected to Supabase! Orders table active (${count ?? 0} orders found).`,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 'network_error',
      url: urlToTest,
      message: `Failed to connect to ${urlToTest}: ${err.message || 'Network error'}`,
      details: err.toString(),
    };
  }
}

// ==============================================================================
// INITIAL DEMO MOCK DATA (Used if Supabase is not yet configured)
// ==============================================================================
const LOCAL_STORAGE_ORDERS_KEY = 'apz_local_orders_v1';

export const INITIAL_ORDERS: Order[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    order_number: 'APZ-0001',
    customer_name: 'Ramesh Gowda',
    phone: '+91 98451 22390',
    email: 'ramesh.gowda@example.com',
    address: 'Near Old Shanimatma Temple, Satyamangala Road',
    area: 'Sira Gate, Tumakuru',
    order_type: 'purchase',
    notes: 'High borewell TDS (750 PPM). Requested demo visit after 4:00 PM.',
    status: 'new',
    total_amount: 16499,
    payment_status: 'pending',
    source: 'website_form',
    admin_notes: 'Customer interested in Copper Max Pro. Assigned technician Manjunath.',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    order_items: [
      {
        id: 'item-01',
        order_id: '00000000-0000-0000-0000-000000000001',
        product_id: 'prod-01',
        product_name: 'AquaPure Copper Max Pro RO+UV',
        quantity: 1,
        price: 16499,
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    order_number: 'APZ-0002',
    customer_name: 'Dr. Ananya Rao',
    phone: '+91 97410 88712',
    email: 'ananya.rao@hospital.org',
    address: 'Near Siddaganga Mutt Entrance Road, 2nd Cross',
    area: 'Kyatsandra, Tumakuru',
    order_type: 'installation',
    notes: 'Kaveri water line installed. Granite wall mounting provision ready.',
    status: 'contacted',
    total_amount: 7999,
    payment_status: 'pending',
    source: 'snap_suggest',
    admin_notes: 'Callback scheduled for tomorrow 11 AM to finalize installation time.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    order_items: [
      {
        id: 'item-02',
        order_id: '00000000-0000-0000-0000-000000000002',
        product_id: 'prod-04',
        product_name: 'AquaPure Gravity UV+UF Safe',
        quantity: 1,
        price: 7999,
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    order_number: 'APZ-0003',
    customer_name: 'Shivaraj Patel',
    phone: '+91 99014 55321',
    email: null,
    address: 'Opposite BSNL Exchange, 4th Main',
    area: 'Batwadi, Tumakuru',
    order_type: 'purchase',
    notes: 'Purchased chimney + whole bungalow water softener package.',
    status: 'confirmed',
    total_amount: 42700,
    payment_status: 'partial',
    source: 'whatsapp',
    admin_notes: 'Advance of ₹5,000 received via UPI. Delivery booked for Saturday morning.',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    order_items: [
      {
        id: 'item-03',
        order_id: '00000000-0000-0000-0000-000000000003',
        product_id: 'prod-02',
        product_name: 'Auto-Soft 2000L Resin Plant',
        quantity: 1,
        price: 28500,
      },
      {
        id: 'item-04',
        order_id: '00000000-0000-0000-0000-000000000003',
        product_id: 'prod-03',
        product_name: 'Vortex 1400 Suction Hood',
        quantity: 1,
        price: 14200,
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    order_number: 'APZ-0004',
    customer_name: 'Kavitha Hegde',
    phone: '+91 94801 67210',
    email: 'kavitha.h@gmail.com',
    address: 'Near SIT College Campus, 1st Stage',
    area: 'SS Puram, Tumakuru',
    order_type: 'service',
    notes: 'Annual filter replacement and TDS health audit needed.',
    status: 'delivered',
    total_amount: 1850,
    payment_status: 'paid',
    source: 'website_form',
    admin_notes: 'Completed by Chethan. TDS reduced from 680 to 48 PPM. AMC renewed.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    order_items: [
      {
        id: 'item-05',
        order_id: '00000000-0000-0000-0000-000000000004',
        product_id: null,
        product_name: 'Comprehensive 12-Month RO AMC & Filter Service',
        quantity: 1,
        price: 1850,
      },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    order_number: 'APZ-0005',
    customer_name: 'Girish Kumar',
    phone: '+91 96112 34980',
    email: null,
    address: 'Near Gandhi Nagar Circle, Ward 12',
    area: 'Gubbi Gate, Tumakuru',
    order_type: 'enquiry',
    notes: 'Wants doorstep water testing report before choosing purifier.',
    status: 'new',
    total_amount: 0,
    payment_status: 'pending',
    source: 'website_form',
    admin_notes: 'Morning visit assigned. Digital TDS kit #02 sent with technician.',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    order_items: [],
  },
];

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading stored orders:', err);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Error saving orders:', err);
  }
}

// ==============================================================================
// PUBLIC ORDER / ENQUIRY CREATION API
// ==============================================================================

export interface CreateOrderPayload {
  customer_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  area: string;
  order_type: Order['order_type'];
  notes?: string | null;
  source?: Order['source'];
  items?: Array<{
    product_id?: string | null;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Creates a new customer order or enquiry.
 * Direct insert to Supabase Postgres with exact error reporting, and local fallback if unconfigured.
 */
export async function submitClientOrder(
  payload: CreateOrderPayload
): Promise<{ success: boolean; orderNumber?: string; order?: Order; error?: string; savedToSupabase?: boolean }> {
  // 1. Spam Honeypot & basic validation
  if (!payload.customer_name || payload.customer_name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }

  const cleanPhone = payload.phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
  }

  const totalAmount = (payload.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  // Generate unique UUID for order
  const orderId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;

  // Generate unique order number e.g. APZ-4829
  const orderNumber = `APZ-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  // If live Supabase is configured, use real Supabase insert!
  if (isSupabaseConfigured()) {
    try {
      // 1. Insert order record without .select() to prevent RLS SELECT permission issues!
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_name: payload.customer_name.trim(),
          phone: payload.phone.trim(),
          email: payload.email?.trim() || null,
          address: payload.address?.trim() || null,
          area: payload.area || 'Sira Gate, Tumakuru',
          order_type: payload.order_type || 'purchase',
          notes: payload.notes?.trim() || null,
          status: 'new',
          total_amount: totalAmount,
          payment_status: 'pending',
          source: payload.source || 'website_form',
        });

      if (orderError) {
        console.error('Supabase order insert error:', orderError);
        return {
          success: false,
          error: `Supabase database error: ${orderError.message} (code: ${orderError.code || 'RLS/Schema error'}). Please verify your database schema and RLS policies in Supabase SQL Editor.`,
        };
      }

      // 2. Insert associated order items if any
      if (payload.items && payload.items.length > 0) {
        const itemRows = payload.items.map((item, idx) => ({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : undefined,
          order_id: orderId,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
        if (itemsError) {
          console.warn('Supabase items insert warning:', itemsError);
        }
      }

      const createdOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: payload.customer_name.trim(),
        phone: payload.phone.trim(),
        email: payload.email?.trim() || null,
        address: payload.address?.trim() || null,
        area: payload.area || 'Sira Gate, Tumakuru',
        order_type: payload.order_type || 'purchase',
        notes: payload.notes?.trim() || null,
        status: 'new',
        total_amount: totalAmount,
        payment_status: 'pending',
        source: payload.source || 'website_form',
        admin_notes: null,
        created_at: now,
        updated_at: now,
        order_items: (payload.items || []).map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          order_id: orderId,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        })),
      };

      // Keep local cache updated
      const existing = getStoredOrders();
      saveStoredOrders([createdOrder, ...existing.filter((o) => o.id !== orderId)]);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apz_new_order', { detail: createdOrder }));
      }

      return {
        success: true,
        orderNumber: orderNumber,
        order: createdOrder,
        savedToSupabase: true,
      };
    } catch (err: any) {
      console.error('Supabase submission exception:', err);
      return {
        success: false,
        error: `Supabase network/connection error: ${err.message || 'Failed to reach Supabase project'}.`,
      };
    }
  }

  // Local persistence fallback if Supabase credentials are not configured yet
  const existingOrders = getStoredOrders();
  const nextSeq = existingOrders.length + 1;
  const localOrderNumber = `APZ-${String(nextSeq).padStart(4, '0')}`;
  const localOrderId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `order-local-${Date.now()}`;

  const orderItems: OrderItem[] = (payload.items || []).map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: localOrderId,
    product_id: item.product_id || null,
    product_name: item.product_name,
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
  }));

  const newOrder: Order = {
    id: localOrderId,
    order_number: localOrderNumber,
    customer_name: payload.customer_name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || null,
    address: payload.address?.trim() || null,
    area: payload.area || 'Sira Gate, Tumakuru',
    order_type: payload.order_type || 'purchase',
    notes: payload.notes?.trim() || null,
    status: 'new',
    total_amount: totalAmount,
    payment_status: 'pending',
    source: payload.source || 'website_form',
    admin_notes: null,
    created_at: now,
    updated_at: now,
    order_items: orderItems,
  };

  const updatedList = [newOrder, ...existingOrders];
  saveStoredOrders(updatedList);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apz_new_order', { detail: newOrder }));
  }

  return {
    success: true,
    orderNumber: newOrder.order_number,
    order: newOrder,
    savedToSupabase: false,
  };
}

// ==============================================================================
// ADMIN ORDERS MANAGEMENT APIS
// ==============================================================================

/**
 * Fetch all orders with associated items.
 */
export async function fetchAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetchAllOrders error:', error);
        return getStoredOrders();
      }

      if (data) {
        // Real data from Supabase (can be empty array if fresh database)
        saveStoredOrders(data as Order[]);
        return data as Order[];
      }
    } catch (err) {
      console.warn('Supabase fetch error, returning local fallback:', err);
    }
  }

  return getStoredOrders();
}

/**
 * Update order status (new, contacted, confirmed, delivered, cancelled)
 */
export async function updateOrderStatusApi(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  let supabaseOk = false;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (!error) {
        supabaseOk = true;
      } else {
        console.warn('Supabase update status error:', error);
      }
    } catch (err) {
      console.warn('Supabase update status failed:', err);
    }
  }

  // Local fallback / synchronization
  const current = getStoredOrders();
  const updated = current.map((o) =>
    o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
  );
  saveStoredOrders(updated);
  return isSupabaseConfigured() ? supabaseOk : true;
}

/**
 * Update payment status & admin notes
 */
export async function updateOrderDetailsApi(
  orderId: string,
  updates: Partial<Order>
): Promise<boolean> {
  let supabaseOk = false;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (!error) {
        supabaseOk = true;
      } else {
        console.warn('Supabase update details error:', error);
      }
    } catch (err) {
      console.warn('Supabase update details failed:', err);
    }
  }

  // Local fallback / synchronization
  const current = getStoredOrders();
  const updated = current.map((o) =>
    o.id === orderId ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
  );
  saveStoredOrders(updated);
  return isSupabaseConfigured() ? supabaseOk : true;
}

/**
 * Delete an order
 */
export async function deleteOrderApi(orderId: string): Promise<boolean> {
  let supabaseOk = false;
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) {
        supabaseOk = true;
      } else {
        console.warn('Supabase delete error:', error);
      }
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  // Local fallback
  const current = getStoredOrders();
  const updated = current.filter((o) => o.id !== orderId);
  saveStoredOrders(updated);
  return isSupabaseConfigured() ? supabaseOk : true;
}
