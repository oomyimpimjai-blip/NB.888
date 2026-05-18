/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trash2, Calendar, MapPin } from 'lucide-react';
import { RubberSale } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface SaleHistoryProps {
  sales: RubberSale[];
  onDelete: (id: string) => void;
}

export default function SaleHistory({ sales, onDelete }: SaleHistoryProps) {
  if (sales.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-stone-400 space-y-2">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 opacity-30" />
        </div>
        <p className="text-sm">ไม่มีข้อมูลการขาย</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
      {sales.map((sale) => (
        <div 
          key={sale.id}
          className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center group relative hover:border-emerald-200 transition-all shadow-sm"
        >
          <button
            onClick={() => onDelete(sale.id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-10"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          <div>
            <p className="text-sm font-bold text-slate-800">{sale.yardName}</p>
            <p className="text-[10px] text-slate-400 italic font-mono">
              {format(new Date(sale.dateTime), 'dd MMM yyyy | HH:mm', { locale: th })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600">
              ฿{sale.totalAmount.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {sale.totalWeight.toLocaleString()} กก. @ {sale.pricePerKg.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
