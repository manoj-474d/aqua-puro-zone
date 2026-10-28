import React from 'react';
import { Order } from '../../types';

interface StatsCardsProps {
  orders: Order[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ orders }) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Metric Computations
  const ordersToday = orders.filter((o) => new Date(o.created_at).getTime() >= startOfToday);
  const newPending = orders.filter((o) => o.status === 'new');
  const confirmed = orders.filter((o) => o.status === 'confirmed');
  const delivered = orders.filter((o) => o.status === 'delivered');

  // Revenue this month (delivered or confirmed orders with payment)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const revenueThisMonth = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        (o.payment_status === 'paid' || o.payment_status === 'partial' || o.status === 'delivered')
      );
    })
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // Simple 7-day bar activity data
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 3600 * 1000;
    const count = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: count,
    };
  });

  const maxDayCount = Math.max(1, ...last7Days.map((d) => d.count));

  return (
    <div className="space-y-4 mb-6">
      {/* 5 KPI Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Orders Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0b74de] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">today</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#06284b] font-mono tabular-nums">
              {ordersToday.length}
            </div>
            <p className="text-[11px] text-[#414753] mt-0.5">Live store enquiries</p>
          </div>
        </div>

        {/* New / Action Required */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">New Action</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 font-mono tabular-nums">
              {newPending.length}
            </div>
            <p className="text-[11px] text-amber-800 mt-0.5">Pending first contact</p>
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#006875] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#06284b] font-mono tabular-nums">
              {confirmed.length}
            </div>
            <p className="text-[11px] text-[#414753] mt-0.5">Scheduled installation</p>
          </div>
        </div>

        {/* Delivered / Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
              {delivered.length}
            </div>
            <p className="text-[11px] text-[#414753] mt-0.5">Fitted &amp; active AMC</p>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#06284b] to-[#08294e] text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#27c4d9] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Month Revenue</span>
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono tabular-nums">
              ₹{revenueThisMonth.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-[#27c4d9] mt-0.5">Tumakuru Store Total</p>
          </div>
        </div>
      </div>

      {/* 7-Day Order Volume Trend Mini Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0b74de]/10 flex items-center justify-center text-[#0b74de]">
            <span className="material-symbols-outlined text-[20px]">show_chart</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#06284b]">7-Day Client Order Inflow</h4>
            <p className="text-[11px] text-[#414753]">Realtime intake across website forms &amp; live photo AI</p>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end gap-2.5 h-12 w-full sm:w-auto justify-between sm:justify-end">
          {last7Days.map((d, idx) => {
            const heightPercent = Math.max(15, (d.count / maxDayCount) * 100);
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className="w-7 bg-gradient-to-t from-[#0b74de] to-[#27c4d9] rounded-t-md transition-all hover:brightness-110"
                  style={{ height: `${heightPercent}%` }}
                  title={`${d.day}: ${d.count} orders`}
                />
                <span className="text-[9px] font-mono text-slate-500">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
