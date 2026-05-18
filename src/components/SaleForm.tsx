/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Save, RotateCcw, Clock, Warehouse, Scale, CircleDollarSign } from 'lucide-react';
import axios from 'axios';
import { Basket, RubberSale } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface SaleFormProps {
  onSave: (sale: RubberSale) => void;
}

export default function SaleForm({ onSave }: SaleFormProps) {
  const [yardName, setYardName] = useState('');
  const [pricePerKg, setPricePerKg] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [baskets, setBaskets] = useState<Basket[]>([{ id: '1', weight: 0 }]);
  const [syncTime, setSyncTime] = useState<string>('');
  const [timeSource, setTimeSource] = useState<string>('กำลังโหลด...');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sync time
  const fetchTime = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await axios.get('/api/time');
      setSyncTime(response.data.datetime);
      setTimeSource(response.data.source);
    } catch (err) {
      console.error("Time sync failed client side", err);
      setSyncTime(new Date().toISOString());
      setTimeSource("System Time (Fallback)");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchTime();
    // Update local time every minute if sync fails or just to keep UX fresh
    const interval = setInterval(fetchTime, 60000);
    return () => clearInterval(interval);
  }, [fetchTime]);

  const totalWeight = baskets.reduce((sum, b) => sum + (Number(b.weight) || 0), 0);

  // Auto-calculation logic
  useEffect(() => {
    const price = parseFloat(pricePerKg);
    if (price > 0 && totalWeight > 0) {
      // Automatic total calculation unless we want to let user enter it manually
      // We only auto-fill if the amount is NOT already set to something that matches
      const expectedAmount = (price * totalWeight).toFixed(2);
      if (totalAmount !== expectedAmount && !document.activeElement?.className.includes('amount-input')) {
        // Only update if current amount is empty or we are in "price-focused" mode
        // But to keep it simple and fulfill "auto calculation":
        setTotalAmount(expectedAmount);
      }
    }
  }, [pricePerKg, totalWeight]);

  const handleAddBasket = () => {
    setBaskets(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), weight: 0 }]);
  };

  const handleRemoveBasket = (id: string) => {
    if (baskets.length > 1) {
      setBaskets(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleWeightChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setBaskets(prev => prev.map(b => b.id === id ? { ...b, weight: num } : b));
  };

  const calculateReversePrice = () => {
    const amount = parseFloat(totalAmount);
    if (totalWeight > 0 && amount > 0) {
      const price = amount / totalWeight;
      setPricePerKg(price.toFixed(2));
      setError(null);
    } else {
      setError("กรุณากรอกน้ำหนักและจำนวนเงินให้ครบถ้วน");
    }
  };

  const calculateTotalAmount = () => {
    const price = parseFloat(pricePerKg);
    if (totalWeight > 0 && price > 0) {
      setTotalAmount((totalWeight * price).toFixed(2));
      setError(null);
    } else {
      setError("กรุณากรอกน้ำหนักและราคาต่อกิโลกรัมให้ครบถ้วน");
    }
  };

  const handleSave = () => {
    if (!yardName) {
      setError("กรุณากรอกชื่อลาน");
      return;
    }
    if (totalWeight <= 0) {
      setError("กรุณากรอกน้ำหนักอย่างน้อย 1 เข่ง");
      return;
    }
    
    // Final check for values
    const finalPrice = parseFloat(pricePerKg);
    const finalAmount = parseFloat(totalAmount);

    if (!finalPrice && !finalAmount) {
      setError("กรุณากรอกราคายางหรือจำนวนเงินรวม");
      return;
    }

    // Attempt to fill missing value if one exists
    let actualPrice = finalPrice;
    let actualAmount = finalAmount;

    if (!actualPrice && actualAmount) actualPrice = actualAmount / totalWeight;
    if (!actualAmount && actualPrice) actualAmount = totalWeight * actualPrice;

    const sale: RubberSale = {
      id: Math.random().toString(36).substr(2, 9),
      yardName,
      pricePerKg: actualPrice,
      totalAmount: actualAmount,
      totalWeight,
      baskets: baskets.filter(b => b.weight > 0),
      dateTime: syncTime || new Date().toISOString(),
      createdAt: Date.now()
    };

    onSave(sale);
    
    // Reset form
    setYardName('');
    setPricePerKg('');
    setTotalAmount('');
    setBaskets([{ id: '1', weight: 0 }]);
    setError(null);
    fetchTime(); // Refresh time for next entry
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {syncTime ? format(new Date(syncTime), 'dd MMM yyyy | HH:mm:ss', { locale: th }) : 'Syncing Time...'}
            </div>
          </div>
          <button 
            onClick={fetchTime}
            disabled={isSyncing}
            className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Yard Name */}
              <div className="flex flex-col gap-1.5 focus-within:ring-2 ring-emerald-500 ring-offset-2 rounded-lg transition-all">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชื่อลาน</label>
                <input
                  type="text"
                  value={yardName}
                  onChange={(e) => setYardName(e.target.value)}
                  placeholder="เช่น ลานทวีคูณ"
                  className="w-full p-4 border border-slate-200 rounded-lg bg-white shadow-sm outline-none placeholder:text-slate-200 text-sm font-semibold"
                />
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ราคาหน้าลาน (บาท/กก.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 border border-slate-200 rounded-lg bg-white shadow-sm outline-none text-sm font-bold"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">จำนวนเงินรวม (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="amount-input w-full p-4 border border-slate-200 rounded-lg bg-white shadow-sm outline-none text-sm font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Utility Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={calculateReversePrice}
                  className="flex-1 text-[10px] font-bold py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded uppercase tracking-wider transition-colors border border-slate-200"
                >
                  Calc Price
                </button>
                <button
                  type="button"
                  onClick={calculateTotalAmount}
                  className="flex-1 text-[10px] font-bold py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded uppercase tracking-wider transition-colors border border-slate-200"
                >
                  Calc Amount
                </button>
              </div>
            </div>

            {/* Dynamic Weights */}
            <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">น้ำหนักยางแยกเข่ง</label>
                <button
                  onClick={handleAddBasket}
                  className="text-emerald-600 text-[10px] font-bold hover:underline"
                >
                  + เพิ่มเข่ง
                </button>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-2 pb-4 custom-scrollbar">
                {baskets.map((basket, index) => (
                  <div key={basket.id} className="p-3 border border-slate-200 rounded bg-white flex items-center justify-between group transition-all focus-within:ring-1 ring-emerald-400">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-300 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={basket.weight || ''}
                        onChange={(e) => handleWeightChange(basket.id, e.target.value)}
                        placeholder="0.0"
                        className="w-16 text-right font-bold outline-none text-sm"
                      />
                      <button 
                        onClick={() => handleRemoveBasket(basket.id)}
                        disabled={baskets.length === 1}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all ml-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-xs font-bold animate-shake text-center uppercase tracking-wider">
              {error}
            </div>
          )}

          {/* Footer Totals and Action */}
          <div className="border-t border-slate-100 pt-8 mt-4">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">น้ำหนักรวม</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{totalWeight.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase">กก.</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ยอดรวมสุทธิ</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-emerald-600 uppercase">฿</span>
                  <span className="text-4xl font-black text-emerald-600">{(parseFloat(totalAmount) || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={!yardName || (totalWeight <= 0) || (!pricePerKg && !totalAmount)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Save className="w-5 h-5" />
              บันทึกข้อมูลการขาย
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
