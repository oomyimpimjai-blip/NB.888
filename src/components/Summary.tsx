/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { RubberSale } from '../types';
import { TrendingUp, BarChart3, Database, CalendarDays } from 'lucide-react';

interface SummaryProps {
  sales: RubberSale[];
}

export default function Summary({ sales }: SummaryProps) {
  const stats = useMemo(() => {
    if (sales.length === 0) return { avgPrice: 0, totalAmount: 0, totalWeight: 0 };
    
    // Yearly average (from all sales in the list which is likely the current dataset)
    const sumPrice = sales.reduce((sum, s) => sum + s.pricePerKg, 0);
    const avgPrice = sumPrice / sales.length;
    
    const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalWeight = sales.reduce((sum, s) => sum + s.totalWeight, 0);
    
    return { avgPrice, totalAmount, totalWeight };
  }, [sales]);

  const chartData = useMemo(() => {
    return [...sales]
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(s => ({
        date: format(new Date(s.dateTime), 'd MMM', { locale: th }),
        price: s.pricePerKg,
        fullName: format(new Date(s.dateTime), 'd MMMM yyyy', { locale: th })
      }));
  }, [sales]);

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
        <Database className="w-16 h-16 text-stone-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-stone-800">ไม่มีข้อมูลการขายในรอบปี</h3>
        <p className="text-stone-500 mt-2">เริ่มบันทึกข้อมูลการขายเพื่อดูสถิติและแนวโน้มราคายาง</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 data-card p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ราคาเฉลี่ยรวม</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{stats.avgPrice.toFixed(2)}</span>
            <span className="text-sm text-emerald-500 font-bold mb-1 uppercase">บาท/กก.</span>
          </div>
        </div>
        <div className="flex-1 data-card p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">น้ำหนักรวมทั้งหมด</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{stats.totalWeight.toLocaleString()}</span>
            <span className="text-sm text-slate-400 mb-1 uppercase">กก.</span>
          </div>
        </div>
        <div className="flex-1 data-card p-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">รายได้รวมทั้งหมด</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-emerald-600">{stats.totalAmount.toLocaleString()}</span>
            <span className="text-sm text-emerald-500 font-bold mb-1 uppercase">฿</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="data-card p-6 flex flex-col bg-white">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
          <span>แนวโน้มราคายาง (ภาพรวมรายครั้ง)</span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">หน่วย: บาท/กก.</span>
        </h3>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  padding: '10px'
                }}
                labelStyle={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}
                itemStyle={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}
              />
              <Area 
                type="stepAfter" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)"
                animationDuration={1000}
                dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Table simplified */}
      <div className="data-card overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">รายการบันทึกการขาย</h3>
          <span className="text-[10px] font-mono text-slate-400">{sales.length} records</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">วันที่</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">รายการ</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">ราคา</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-700">
                      {format(new Date(sale.dateTime), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{sale.yardName}</div>
                    <div className="text-[9px] text-slate-400 font-medium">{sale.totalWeight.toLocaleString()} กก.</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right">
                    {sale.pricePerKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">
                    ฿{sale.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
