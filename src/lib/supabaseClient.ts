/**
 * Aqua Puro Zone - Supabase Client & Realtime Client Orders API
 * Connects to Supabase Postgres, Realtime, and Auth.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem, OrderStatus, PaymentStatus, Product, generateProductSlug, AiLibraryImage } from '../types';
import { analyzeProductPhoto } from './productImageAnalyzer';

export const CANONICAL_SUPABASE_URL = 'https://nvhtlhfqgewrbpibbpzz.supabase.co';
export const CANONICAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aHRsaGZxZ2V3cmJwaWJicHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTg5NTMsImV4cCI6MjEwODY5NDk1M30.I3dEwxS3SvIudpU09IswdLsuYm_hlVqfAtWWz9K3_ak';

export function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/^['"]+|['"]+$/g, '').replace(/\/+$/, '');
}

export function sanitizeSupabaseKey(key: string): string {
  if (!key) return '';
  return key.trim().replace(/^['"]+|['"]+$/g, '').replace(/\s+/g, '');
}

// Ensure localStorage in browser is up to date with canonical project keys
if (typeof window !== 'undefined') {
  try {
    const rawStoredUrl = localStorage.getItem('apz_supabase_url');
    const rawStoredKey = localStorage.getItem('apz_supabase_anon_key');
    if (
      !rawStoredUrl ||
      rawStoredUrl.includes('placeholder') ||
      rawStoredUrl.includes('your-project-id') ||
      !rawStoredKey ||
      rawStoredKey.length < 20 ||
      rawStoredKey.includes('placeholder') ||
      rawStoredKey.startsWith('sb_publishable_') // migrate away from obsolete publishable key
    ) {
      localStorage.setItem('apz_supabase_url', CANONICAL_SUPABASE_URL);
      localStorage.setItem('apz_supabase_anon_key', CANONICAL_SUPABASE_ANON_KEY);
    }
  } catch {
    // Ignore restricted iframe storage
  }
}

// Read environment variables or fallback to canonical keys
const envUrl = sanitizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL || '');
const envKey = sanitizeSupabaseKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '');

const storedUrl = typeof window !== 'undefined' ? sanitizeSupabaseUrl(localStorage.getItem('apz_supabase_url') || '') : '';
const storedKey = typeof window !== 'undefined' ? sanitizeSupabaseKey(localStorage.getItem('apz_supabase_anon_key') || '') : '';

const validStoredUrl = storedUrl && !storedUrl.includes('placeholder') && !storedUrl.includes('your-project-id') ? storedUrl : '';
const validStoredKey = storedKey && !storedKey.includes('placeholder') && !storedKey.startsWith('sb_publishable_') && storedKey.length > 20 ? storedKey : '';

export const SUPABASE_URL = envUrl || validStoredUrl || CANONICAL_SUPABASE_URL;
export const SUPABASE_ANON_KEY = envKey || validStoredKey || CANONICAL_SUPABASE_ANON_KEY;

/**
 * Returns true if real, valid-looking Supabase credentials have been provided.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('your-project-id') &&
    !SUPABASE_URL.includes('placeholder') &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_ANON_KEY.length > 20
  );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
 * Safe RFC4122 v4 UUID generator (browser, iframe, and node compatible)
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    localStorage.setItem('apz_supabase_url', CANONICAL_SUPABASE_URL);
    localStorage.setItem('apz_supabase_anon_key', CANONICAL_SUPABASE_ANON_KEY);
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
// INITIAL DEMO MOCK DATA (Used as offline cache)
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
 * Direct insert to Supabase Postgres with exact error reporting and foreign-key safe items.
 */
export async function submitClientOrder(
  payload: CreateOrderPayload
): Promise<{ success: boolean; orderNumber?: string; order?: Order; error?: string; savedToSupabase?: boolean }> {
  // 1. Validation
  const trimmedName = (payload.customer_name || '').trim();
  if (trimmedName.length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }

  const cleanDigits = (payload.phone || '').replace(/\D/g, '');
  if (cleanDigits.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
  }

  // Format phone to standard representation
  const formattedPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : payload.phone.trim();

  // Validate email if provided (null if not valid standard format)
  const trimmedEmail = (payload.email || '').trim();
  const validEmail =
    trimmedEmail && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmedEmail)
      ? trimmedEmail
      : null;

  const totalAmount = (payload.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  // Generate unique UUID for order
  const orderId = generateUUID();

  // Generate unique order number e.g. APZ-4829
  const orderNumber = `APZ-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  // Ensure source matches enum constraints in schema: ('website_form', 'whatsapp', 'snap_suggest', 'storefront_walkin')
  let safeSource: Order['source'] = 'website_form';
  if (payload.source === 'whatsapp' || payload.source === 'snap_suggest' || payload.source === 'storefront_walkin') {
    safeSource = payload.source;
  }

  // If live Supabase is configured, use real Supabase insert!
  if (isSupabaseConfigured()) {
    try {
      // 1. Insert order record without .select() to prevent RLS RETURNING issues!
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_name: trimmedName,
          phone: formattedPhone,
          email: validEmail,
          address: payload.address?.trim() || null,
          area: payload.area || 'Sira Gate, Tumakuru',
          order_type: payload.order_type || 'purchase',
          notes: payload.notes?.trim() || null,
          status: 'new',
          total_amount: totalAmount,
          payment_status: 'pending',
          source: safeSource,
        });

      if (orderError) {
        console.error('Supabase order insert error:', orderError);
        return {
          success: false,
          error: `Supabase database error: ${orderError.message} (code: ${orderError.code || 'RLS/Schema error'}). Please verify your database schema in Supabase SQL Editor.`,
        };
      }

      // 2. Insert associated order items if any
      if (payload.items && payload.items.length > 0) {
        // Only link product_id if it matches a seeded product to prevent foreign key errors
        const knownProductIds = ['prod-01', 'prod-02', 'prod-03', 'prod-04'];
        const itemRows = payload.items.map((item) => ({
          id: generateUUID(),
          order_id: orderId,
          product_id: item.product_id && knownProductIds.includes(item.product_id) ? item.product_id : null,
          product_name: item.product_name,
          quantity: Math.max(1, Number(item.quantity) || 1),
          price: Math.max(0, Number(item.price) || 0),
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
        if (itemsError) {
          console.warn('Supabase items insert warning:', itemsError);
        }
      }

      const createdOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: trimmedName,
        phone: formattedPhone,
        email: validEmail,
        address: payload.address?.trim() || null,
        area: payload.area || 'Sira Gate, Tumakuru',
        order_type: payload.order_type || 'purchase',
        notes: payload.notes?.trim() || null,
        status: 'new',
        total_amount: totalAmount,
        payment_status: 'pending',
        source: safeSource,
        admin_notes: null,
        created_at: now,
        updated_at: now,
        order_items: (payload.items || []).map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          order_id: orderId,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: Math.max(1, Number(item.quantity) || 1),
          price: Math.max(0, Number(item.price) || 0),
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

  // Local persistence fallback if Supabase credentials are not configured
  const existingOrders = getStoredOrders();
  const nextSeq = existingOrders.length + 1;
  const localOrderNumber = `APZ-${String(nextSeq).padStart(4, '0')}`;
  const localOrderId = generateUUID();

  const orderItems: OrderItem[] = (payload.items || []).map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: localOrderId,
    product_id: item.product_id || null,
    product_name: item.product_name,
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Math.max(0, Number(item.price) || 0),
  }));

  const newOrder: Order = {
    id: localOrderId,
    order_number: localOrderNumber,
    customer_name: trimmedName,
    phone: formattedPhone,
    email: validEmail,
    address: payload.address?.trim() || null,
    area: payload.area || 'Sira Gate, Tumakuru',
    order_type: payload.order_type || 'purchase',
    notes: payload.notes?.trim() || null,
    status: 'new',
    total_amount: totalAmount,
    payment_status: 'pending',
    source: safeSource,
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

// ==============================================================================
// PRODUCTS SUPABASE CRUD APIS
// ==============================================================================

export const LOCAL_STORAGE_PRODUCTS_KEY = 'apz_products_v2';

export function mapSupabaseRowToProduct(row: any): Product {
  const features = Array.isArray(row.features)
    ? row.features
    : typeof row.features === 'string'
    ? row.features.split(',').map((f: string) => f.trim()).filter(Boolean)
    : [];

  const galleryImages = Array.isArray(row.gallery_images)
    ? row.gallery_images
    : typeof row.gallery_images === 'string'
    ? JSON.parse(row.gallery_images || '[]')
    : [];

  const tags = Array.isArray(row.tags)
    ? row.tags
    : [
        `#${(row.category || 'water_purifier').toLowerCase().replace(/\s+/g, '_')}`,
        row.in_stock ? '#in_stock' : '#out_of_stock',
      ];

  const inStock = Boolean(row.in_stock);
  const stockQuantity = typeof row.stock_quantity === 'number' ? row.stock_quantity : (inStock ? 5 : 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || generateProductSlug(row.name, row.id),
    category: row.category || 'Water Purifier',
    brand: row.brand || 'Aqua Puro Zone',
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discountPrice: row.original_price ? Number(row.original_price) : undefined,
    capacity: row.capacity || '10 Litres',
    mountType: row.mount_type || 'Wall-Mounted / Countertop',
    tags: tags,
    image: row.image_url || row.image || '',
    galleryImages: galleryImages,
    inStock: inStock && stockQuantity > 0,
    visibleOnStorefront: row.visible_on_storefront !== undefined ? Boolean(row.visible_on_storefront) : true,
    isPublished: row.visible_on_storefront !== undefined ? Boolean(row.visible_on_storefront) : true,
    stockQuantity: stockQuantity,
    featured: Boolean(row.featured),
    description: row.description || '',
    features: features,
    targetWaterType: row.target_water_type || 'Borewell',
    purificationStages: row.purification_stages || '',
    warranty: row.warranty || '1 Year Comprehensive + Free Installation',
    maxTds: row.max_tds || 'Up to 2000 PPM',
    flowRate: row.flow_rate || '15 LPH',
    storageCapacity: row.storage_capacity || row.capacity || '10 Litres',
    is_user_uploaded:
      row.is_user_uploaded !== undefined
        ? Boolean(row.is_user_uploaded)
        : Boolean(
            (row.image_url || row.image) &&
              !(row.image_url || row.image).includes('unsplash.com') &&
              !(row.image_url || row.image).includes('lh3.googleusercontent.com')
          ),
    productColor: row.product_color || row.productColor,
    productFinish: row.product_finish || row.productFinish,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapProductToSupabaseRow(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug || generateProductSlug(product.name, product.id),
    category: product.category || 'Water Purifier',
    brand: product.brand || 'Aqua Puro Zone',
    price: Number(product.price) || 0,
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
    capacity: product.capacity || null,
    mount_type: product.mountType || null,
    in_stock: Boolean(product.inStock && (product.stockQuantity ?? 1) > 0),
    visible_on_storefront: product.visibleOnStorefront !== undefined ? Boolean(product.visibleOnStorefront) : true,
    stock_quantity: Math.max(0, Number(product.stockQuantity) || 0),
    featured: Boolean(product.featured),
    image_url: product.image || null,
    gallery_images: product.galleryImages || [],
    description: product.description || '',
    features: product.features || [],
    target_water_type: product.targetWaterType || 'Borewell',
    purification_stages: product.purificationStages || null,
    warranty: product.warranty || null,
    max_tds: product.maxTds ? String(product.maxTds) : null,
    flow_rate: product.flowRate || null,
    storage_capacity: product.storageCapacity || null,
    is_user_uploaded: Boolean(product.is_user_uploaded),
    product_color: product.productColor || null,
    product_finish: product.productFinish || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Upload a product photo file to Supabase Storage, with fallback to high-quality base64 Data URL.
 * Automatically saves to the storage bucket.
 */
export async function uploadProductPhotoFile(
  file: File,
  folder = 'products'
): Promise<{ url: string; storagePath?: string }> {
  const photoId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let finalUrl = '';
  let storagePath: string | undefined;

  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const path = `${folder}/${photoId}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('ai-product-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('ai-product-images')
          .getPublicUrl(path);
        if (publicUrlData?.publicUrl) {
          finalUrl = publicUrlData.publicUrl;
          storagePath = path;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload skipped or failed, using data URL fallback:', storageErr);
    }
  }

  if (!finalUrl) {
    finalUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return { url: finalUrl, storagePath };
}

/**
 * Fetch all products from Supabase (or fallback to cached/initial products)
 */
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedProducts = data.map(mapSupabaseRowToProduct);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(mappedProducts));
          } catch {
            // ignore
          }
        }
        return mappedProducts;
      }
      if (error) {
        console.warn('Supabase fetch products error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase products fetch failed:', err);
    }
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
  }

  return [];
}

/**
 * Create or Update a product in Supabase & local cache
 */
export async function upsertProductToSupabase(
  product: Product
): Promise<{ success: boolean; product?: Product; error?: string; savedToSupabase?: boolean }> {
  const row = mapProductToSupabaseRow(product);
  let savedToSupabase = false;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsert error:', error);
      } else {
        savedToSupabase = true;
      }
    } catch (err: any) {
      console.warn('Supabase upsert exception:', err);
    }
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      const existing: Product[] = raw ? JSON.parse(raw) : [];
      const updated = existing.some((p) => p.id === product.id)
        ? existing.map((p) => (p.id === product.id ? product : p))
        : [product, ...existing];
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    product,
    savedToSupabase,
  };
}

/**
 * Delete a product from Supabase & local cache
 */
export async function deleteProductFromSupabase(
  productId: string
): Promise<{ success: boolean; error?: string; deletedFromSupabase?: boolean }> {
  let deletedFromSupabase = false;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.warn('Supabase delete product error:', error);
      } else {
        deletedFromSupabase = true;
      }
    } catch (err: any) {
      console.warn('Supabase delete product exception:', err);
    }
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (raw) {
        const existing: Product[] = JSON.parse(raw);
        const updated = existing.filter((p) => p.id !== productId);
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    deletedFromSupabase,
  };
}

/**
 * Toggle product publication visibility
 */
export async function toggleProductVisibilityInSupabase(
  productId: string,
  visible: boolean
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('products')
        .update({ visible_on_storefront: visible, updated_at: new Date().toISOString() })
        .eq('id', productId);
    } catch (err) {
      console.warn('Failed to update visibility in Supabase:', err);
    }
  }
  return true;
}

/**
 * Toggle product stock status
 */
export async function toggleProductStockInSupabase(
  productId: string,
  inStock: boolean,
  quantity?: number
): Promise<boolean> {
  const stockQty = quantity !== undefined ? quantity : (inStock ? 5 : 0);
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('products')
        .update({
          in_stock: inStock && stockQty > 0,
          stock_quantity: stockQty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
    } catch (err) {
      console.warn('Failed to update stock in Supabase:', err);
    }
  }
  return true;
}

// ==============================================================================
// AI RECOMMENDATION IMAGE LIBRARY (Visual Product Matching)
// ==============================================================================
export const LOCAL_STORAGE_AI_IMAGES_KEY = 'apz_ai_image_library_v1';

export const INITIAL_AI_LIBRARY_IMAGES: AiLibraryImage[] = [];

/**
 * Fetch all AI recommendation product images from Supabase or local cache
 * Filters out any generic Unsplash mock links to guarantee ONLY real owner-uploaded images
 */
export async function fetchAiLibraryImages(): Promise<AiLibraryImage[]> {
  let cached: AiLibraryImage[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AI_IMAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Strictly keep only user-uploaded images or images not from random external stock sites
          cached = parsed.filter(
            (img) =>
              img.is_user_uploaded === true ||
              (img.image_url && !img.image_url.includes('images.unsplash.com') && !img.id.startsWith('ai-img-'))
          );
        }
      }
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('ai_product_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Exclude any legacy mock images
        const realData = data.filter(
          (img) => !img.image_url?.includes('images.unsplash.com') && !img.id?.startsWith('ai-img-')
        );
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_AI_IMAGES_KEY, JSON.stringify(realData));
          } catch {
            // ignore
          }
        }
        return realData;
      }
    } catch (err) {
      console.warn('Could not query ai_product_images table in Supabase, using local store:', err);
    }
  }

  return cached;
}

/**
 * Upload an image file to Supabase Storage, analyze visual characteristics, and register in database
 */
export async function uploadAiLibraryImageFile(
  file: File,
  category?: string
): Promise<AiLibraryImage> {
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let finalUrl = '';
  let storagePath: string | undefined;

  // 1. Try uploading to Supabase Storage if configured
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const path = `products/${imageId}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('ai-product-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('ai-product-images')
          .getPublicUrl(path);
        if (publicUrlData?.publicUrl) {
          finalUrl = publicUrlData.publicUrl;
          storagePath = path;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload skipped or failed, using data URL fallback:', storageErr);
    }
  }

  // 2. Fallback to base64 Data URL if storage was not accessible
  if (!finalUrl) {
    finalUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 3. Extract real visual characteristics (color, finish, category, proportions, mounting style)
  let visualInfo = {
    productColor: 'Pristine White',
    productFinish: 'Glossy Finish',
    productType: category || 'Water Purifier',
    mountingStyle: 'Wall-Mounted',
    proportions: 'Vertical Slim Box',
  };

  try {
    visualInfo = await analyzeProductPhoto(finalUrl, { category });
  } catch {
    // Keep fallback
  }

  const newRecord: AiLibraryImage = {
    id: imageId,
    image_url: finalUrl,
    category: category || visualInfo.productType || 'Water Purifier',
    created_at: new Date().toISOString(),
    storage_path: storagePath,
    is_user_uploaded: true,
    productColor: visualInfo.productColor,
    productFinish: visualInfo.productFinish,
    productType: visualInfo.productType,
    mountingStyle: visualInfo.mountingStyle,
    proportions: visualInfo.proportions,
  };

  // 4. Persist into Supabase database table if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('ai_product_images').insert([
        {
          id: newRecord.id,
          image_url: newRecord.image_url,
          category: newRecord.category || null,
          created_at: newRecord.created_at,
          storage_path: newRecord.storage_path || null,
        },
      ]);
    } catch (dbErr) {
      console.warn('Could not insert to ai_product_images table in Supabase:', dbErr);
    }
  }

  // 5. Update local storage cache
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AI_IMAGES_KEY);
      const existing: AiLibraryImage[] = raw ? JSON.parse(raw) : [];
      const updated = [newRecord, ...existing.filter((img) => img.id !== newRecord.id)];
      localStorage.setItem(LOCAL_STORAGE_AI_IMAGES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newRecord;
}

/**
 * Upload multiple images at once
 */
export async function uploadMultipleAiLibraryImages(
  files: File[],
  category?: string
): Promise<AiLibraryImage[]> {
  const results: AiLibraryImage[] = [];
  for (const file of files) {
    try {
      const record = await uploadAiLibraryImageFile(file, category);
      results.push(record);
    } catch (err) {
      console.warn('Failed to upload image file:', file.name, err);
    }
  }
  return results;
}

/**
 * Delete an image from the AI Recommendation Image Library
 */
export async function deleteAiLibraryImage(id: string, storagePath?: string): Promise<boolean> {
  // 1. Delete from Supabase Database
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('ai_product_images').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting from ai_product_images table in Supabase:', err);
    }

    // Delete from Supabase Storage if path exists
    if (storagePath) {
      try {
        await supabase.storage.from('ai-product-images').remove([storagePath]);
      } catch (storageErr) {
        console.warn('Error removing from Supabase storage:', storageErr);
      }
    }
  }

  // 2. Delete from localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AI_IMAGES_KEY);
      if (raw) {
        const existing: AiLibraryImage[] = JSON.parse(raw);
        const updated = existing.filter((img) => img.id !== id);
        localStorage.setItem(LOCAL_STORAGE_AI_IMAGES_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Update an image's category
 */
export async function updateAiLibraryImageCategory(
  id: string,
  category: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('ai_product_images')
        .update({ category: category || null })
        .eq('id', id);
    } catch (err) {
      console.warn('Error updating category in Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AI_IMAGES_KEY);
      if (raw) {
        const existing: AiLibraryImage[] = JSON.parse(raw);
        const updated = existing.map((img) => (img.id === id ? { ...img, category } : img));
        localStorage.setItem(LOCAL_STORAGE_AI_IMAGES_KEY, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  return true;
}

