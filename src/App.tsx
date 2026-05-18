/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, PlusCircle, History, TrendingUp, Info } from 'lucide-react';
import { RubberSale, TabType } from './types';
import SaleForm from './components/SaleForm';
import Summary from './components/Summary';
import SaleHistory from './components/SaleHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('entry');
  const [sales, setSales] = useState<RubberSale[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nb888_sales');
    if (saved) {
      try {
        setSales(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sales history", e);
      }
    }
    setIsReady(true);
  }, []);

  // Sync back to localStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('nb888_sales', JSON.stringify(sales));
    }
  }, [sales, isReady]);

  const addSale = (sale: RubberSale) => {
    setSales(prev => [sale, ...prev]);
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-4 md:gap-8">
          <h1 className="app-header text-emerald-600 tracking-tight m-0">NB.888</h1>
          <div className="flex gap-4 md:gap-6 text-sm font-medium text-slate-500">
            <button 
              onClick={() => setActiveTab('entry')}
              className={`transition-all cursor-pointer h-16 border-b-2 flex items-center ${
                activeTab === 'entry' ? 'text-emerald-600 border-emerald-600' : 'border-transparent hover:text-slate-800'
              }`}
            >
              บันทึกการขาย
            </button>
            <button 
              onClick={() => setActiveTab('summary')}
              className={`transition-all cursor-pointer h-16 border-b-2 flex items-center ${
                activeTab === 'summary' ? 'text-emerald-600 border-emerald-600' : 'border-transparent hover:text-slate-800'
              }`}
            >
              รายงานสรุป
            </button>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">
            Terminal Ready
          </span>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden grid-bg">
        {/* Main Content Area */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'entry' ? (
                <motion.div
                  key="entry"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-1">บันทึกข้อมูลใหม่</h2>
                    <p className="text-slate-500 text-sm">กรอกน้ำหนักยางและราคาหน้าลานเพื่อบันทึกประวัติ</p>
                  </div>
                  <SaleForm onSave={addSale} />
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Summary sales={sales} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Column: History (Visible on large screens) */}
        <aside className="w-full lg:w-[400px] bg-slate-100/30 backdrop-blur-sm border-l border-slate-200 p-8 flex flex-col overflow-hidden">
          <div className="mb-6 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">ประวัติรายการ</h3>
            <span className="text-[10px] font-bold text-slate-400">{sales.length} ครั้ง</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <SaleHistory sales={sales} onDelete={deleteSale} />
          </div>
        </aside>
      </main>

      <footer className="h-8 bg-slate-900 text-white flex items-center px-4 md:px-8 justify-between text-[10px] uppercase tracking-widest shrink-0 font-medium">
        <span>© 2026 NB.888 Rubber Solution</span>
        <div className="hidden sm:flex gap-6">
          <span>Status: Online</span>
          <span>System: v4.2.0</span>
        </div>
      </footer>
    </div>
  );
}
