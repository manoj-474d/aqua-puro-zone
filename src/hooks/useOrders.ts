import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  fetchAllOrders,
  updateOrderStatusApi,
  updateOrderDetailsApi,
  deleteOrderApi,
} from '../lib/supabaseClient';

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateDetails: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  newOrderToast: Order | null;
  dismissToast: () => void;
  isRealtimeConnected: boolean;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Play subtle bell chime notification
  const playNotificationSound = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Realtime Supabase Subscription & Custom Event Listener
  useEffect(() => {
    let channel: any = null;

    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('orders_realtime_channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'orders' },
            (payload) => {
              const newRecord = payload.new as Order;
              setOrders((prev) => [newRecord, ...prev.filter((o) => o.id !== newRecord.id)]);
              setNewOrderToast(newRecord);
              playNotificationSound();
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders' },
            (payload) => {
              const updatedRecord = payload.new as Order;
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedRecord.id ? { ...o, ...updatedRecord } : o))
              );
            }
          )
          .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'orders' },
            (payload) => {
              const deletedId = (payload.old as any)?.id;
              if (deletedId) {
                setOrders((prev) => prev.filter((o) => o.id !== deletedId));
              }
            }
          )
          .subscribe((status) => {
            setIsRealtimeConnected(status === 'SUBSCRIBED');
          });
      } catch (err) {
        console.warn('Realtime subscription failed:', err);
      }
    }

    // Local custom event listener for offline/instant mode
    const handleLocalOrder = (e: any) => {
      const order = e.detail as Order;
      if (order) {
        setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
        setNewOrderToast(order);
        playNotificationSound();
      }
    };

    window.addEventListener('apz_new_order', handleLocalOrder);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('apz_new_order', handleLocalOrder);
    };
  }, [playNotificationSound]);

  const updateStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const success = await updateOrderStatusApi(orderId, status);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o))
      );
    }
    return success;
  };

  const updateDetails = async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    const success = await updateOrderDetailsApi(orderId, updates);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates, updated_at: new Date().toISOString() } : o))
      );
    }
    return success;
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    const success = await deleteOrderApi(orderId);
    if (success) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
    return success;
  };

  const dismissToast = () => setNewOrderToast(null);

  return {
    orders,
    loading,
    error,
    refreshOrders: loadOrders,
    updateStatus,
    updateDetails,
    deleteOrder,
    newOrderToast,
    dismissToast,
    isRealtimeConnected,
  };
}
