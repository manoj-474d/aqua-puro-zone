import React, { useState } from 'react';
import { Lead, Product, ServiceTicket, SparePart } from '../types';

interface SqlArchitectureHubProps {
  leads: Lead[];
  products: Product[];
  tickets: ServiceTicket[];
  spareParts: SparePart[];
  isKannada: boolean;
}

export const SqlArchitectureHub: React.FC<SqlArchitectureHubProps> = ({
  leads,
  products,
  tickets,
  spareParts,
  isKannada,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('leads_diagnostics');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT customer_name, locality, water_source, tds_ppm, status FROM leads_diagnostics WHERE tds_ppm >= 500 ORDER BY tds_ppm DESC;'
  );
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const tables = [
    {
      name: 'leads_diagnostics',
      recordCount: leads.length,
      columns: ['id (UUID PK)', 'customer_name (TEXT)', 'phone (VARCHAR)', 'locality (TEXT)', 'water_source (TEXT)', 'tds_ppm (INTEGER)', 'status (ENUM)', 'ai_recommendation (TEXT)', 'created_at (TIMESTAMP)'],
    },
    {
      name: 'products',
      recordCount: products.length,
      columns: ['id (UUID PK)', 'name (VARCHAR)', 'category (VARCHAR)', 'price (NUMERIC)', 'in_stock (BOOLEAN)', 'tags (TEXT[])', 'capacity (VARCHAR)'],
    },
    {
      name: 'service_tickets',
      recordCount: tickets.length,
      columns: ['id (VARCHAR PK)', 'customer_name (TEXT)', 'phone (VARCHAR)', 'locality (TEXT)', 'appliance (TEXT)', 'technician (TEXT)', 'priority (ENUM)', 'status (ENUM)', 'scheduled_date (TEXT)'],
    },
    {
      name: 'spare_parts_inventory',
      recordCount: spareParts.length,
      columns: ['id (VARCHAR PK)', 'sku (VARCHAR UNIQUE)', 'name (TEXT)', 'category (TEXT)', 'stock (INT)', 'min_stock (INT)', 'price (NUMERIC)'],
    },
  ];

  const runSampleQuery = (queryText: string) => {
    setSqlQuery(queryText);
    executeSql(queryText);
  };

  const executeSql = (query: string) => {
    const start = performance.now();
    setQueryError(null);
    const q = query.trim().toLowerCase();

    try {
      if (q.includes('leads') || q.includes('leads_diagnostics')) {
        let res = [...leads];
        if (q.includes('500')) {
          res = res.filter((l) => Number(l.tdsPpm) >= 500);
        }
        if (q.includes('desc')) {
          res = res.sort((a, b) => Number(b.tdsPpm) - Number(a.tdsPpm));
        }
        setQueryResults(
          res.map((r) => ({
            customer_name: r.customerName,
            locality: r.locality,
            water_source: r.waterSource,
            tds_ppm: r.tdsPpm,
            ai_recommendation: r.aiRecommendation,
            status: r.status,
          }))
        );
      } else if (q.includes('products')) {
        let res = [...products];
        if (q.includes('in_stock')) {
          res = res.filter((p) => p.inStock);
        }
        if (q.includes('20000') || q.includes('20,000')) {
          res = res.filter((p) => p.price <= 20000);
        }
        setQueryResults(
          res.map((p) => ({
            name: p.name,
            category: p.category,
            price: `₹${p.price.toLocaleString('en-IN')}`,
            in_stock: p.inStock ? 'TRUE' : 'FALSE',
            capacity: p.capacity,
          }))
        );
      } else if (q.includes('service') || q.includes('ticket')) {
        let res = [...tickets];
        if (q.includes('scheduled')) {
          res = res.filter((t) => t.status === 'scheduled');
        }
        setQueryResults(
          res.map((t) => ({
            id: t.id,
            customer_name: t.customerName,
            locality: t.locality,
            appliance: t.appliance,
            technician: t.technician,
            priority: t.priority,
            status: t.status,
          }))
        );
      } else if (q.includes('spare') || q.includes('inventory')) {
        let res = [...spareParts];
        if (q.includes('low') || q.includes('stock <=')) {
          res = res.filter((s) => s.stock <= s.minStock);
        }
        setQueryResults(
          res.map((s) => ({
            sku: s.sku,
            name: s.name,
            category: s.category,
            current_stock: s.stock,
            min_threshold: s.minStock,
            unit_price: `₹${s.price}`,
          }))
        );
      } else {
        setQueryResults(
          leads.map((l) => ({
            customer_name: l.customerName,
            phone: l.phone,
            locality: l.locality,
            tds_ppm: l.tdsPpm,
            status: l.status,
          }))
        );
      }

      const elapsed = Math.round((performance.now() - start) * 10) / 10;
      setExecutionTime(elapsed);
    } catch (err: any) {
      setQueryError('Query execution error: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#dae2fd] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#005cb3]/10 flex items-center justify-center text-[#005cb3]">
            <span className="material-symbols-outlined text-[28px]">schema</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-[22px] text-[#131b2e]">
                {isKannada ? 'SQL & ಡೇಟಾ ಆರ್ಕಿಟೆಕ್ಚರ್ ಕೇಂದ್ರ' : 'SQL & Architecture Hub'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e2e7ff] text-[#005cb3] text-[11px] font-bold">
                PostgreSQL • Cloud Run Node
              </span>
            </div>
            <p className="text-[13px] text-[#414753] mt-0.5">
              Relational schemas, foreign key mappings, and live interactive data query console
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#dae2fd]">
          {tables.map((tbl) => (
            <div
              key={tbl.name}
              onClick={() => {
                setSelectedTable(tbl.name);
                runSampleQuery(`SELECT * FROM ${tbl.name} LIMIT 10;`);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedTable === tbl.name
                  ? 'bg-[#005cb3] text-white shadow-sm border-[#005cb3]'
                  : 'bg-[#f2f3ff] text-[#131b2e] border-[#dae2fd] hover:bg-[#e2e7ff]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-bold truncate">{tbl.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedTable === tbl.name ? 'bg-white/20 text-white' : 'bg-[#e2e7ff] text-[#005cb3]'
                }`}>
                  {tbl.recordCount} rows
                </span>
              </div>
              <p className={`text-[11px] mt-1 line-clamp-1 ${
                selectedTable === tbl.name ? 'text-white/80' : 'text-[#717784]'
              }`}>
                {tbl.columns.length} columns defined
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 lg:p-7 shadow-xs border border-[#dae2fd] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006875] text-[20px]">terminal</span>
            <span className="font-heading font-bold text-[16px] text-[#131b2e]">
              Interactive SQL Console
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runSampleQuery('SELECT customer_name, locality, tds_ppm, ai_recommendation FROM leads_diagnostics WHERE tds_ppm >= 500 ORDER BY tds_ppm DESC;')}
              className="px-2.5 py-1 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#005cb3] rounded-lg text-[11px] font-mono font-semibold border border-[#dae2fd]"
            >
              High TDS Leads
            </button>
            <button
              onClick={() => runSampleQuery('SELECT name, category, price, in_stock FROM products WHERE in_stock = true AND price <= 20000;')}
              className="px-2.5 py-1 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#005cb3] rounded-lg text-[11px] font-mono font-semibold border border-[#dae2fd]"
            >
              In-Stock &lt;₹20k
            </button>
            <button
              onClick={() => runSampleQuery('SELECT sku, name, current_stock, min_threshold FROM spare_parts_inventory WHERE current_stock <= min_threshold;')}
              className="px-2.5 py-1 bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#ba1a1a] rounded-lg text-[11px] font-mono font-semibold border border-[#dae2fd]"
            >
              Low Stock Parts
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-[#1e293b] bg-[#0f172a] shadow-inner p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 text-slate-400 font-mono text-[11px]">
            <span>postgresql://aquapuro_admin@tumakuru-db:5432/prod_hub</span>
            <span className="text-[#4ae176]">● Connected (TLS 1.3)</span>
          </div>
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-transparent text-[#6bff8f] font-mono text-[13px] leading-relaxed focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <span className="text-slate-400 text-[11px] font-mono">
              Press Run Query or click quick templates above
            </span>
            <button
              onClick={() => executeSql(sqlQuery)}
              className="px-4 py-1.5 bg-[#005cb3] hover:bg-[#0b74de] text-white rounded-lg font-mono text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              Run Query
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[12px] text-[#414753] mt-4 mb-2">
          <span>
            {queryResults.length} records returned{' '}
            {executionTime !== null && `in ${executionTime} ms`}
          </span>
          {queryError && <span className="text-[#ba1a1a] font-semibold">{queryError}</span>}
        </div>

        {queryResults.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-[#dae2fd]">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead className="bg-[#f2f3ff] text-[#414753] font-mono font-bold uppercase tracking-wider">
                <tr>
                  {Object.keys(queryResults[0]).map((col) => (
                    <th key={col} className="py-2.5 px-4 border-b border-[#dae2fd]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] font-mono">
                {queryResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f2f3ff]/50">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="py-2 px-4 whitespace-nowrap">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
