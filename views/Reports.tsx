
import React, { useState, useEffect } from 'react';
import { Sale, Product, StockPrediction } from '../types';
import { getStockPredictions } from '../geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Download, RefreshCw, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
}

const Reports: React.FC<ReportsProps> = ({ sales, products }) => {
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      const data = await getStockPredictions(products);
      setPredictions(data);
      setLoading(false);
    };
    fetchPredictions();
  }, [products]);

  // Data for Category distribution
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryData = categories.map(cat => {
    const amount = sales.reduce((acc, s) => {
      const catTotal = s.items
        .filter(item => {
          const p = products.find(prod => prod.id === item.productId);
          return p?.category === cat;
        })
        .reduce((sum, item) => sum + item.total, 0);
      return acc + catTotal;
    }, 0);
    return { name: cat, value: amount };
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500">Deep dive into your business metrics and predictions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <button className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            <Calendar size={18} />
            May 2024
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue by Category</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Inventory Forecast */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-indigo-600">
              <RefreshCw className={`shrink-0 ${loading ? 'animate-spin' : ''}`} size={20} />
              <h2 className="text-lg font-bold text-slate-800">AI Stock Forecasting</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Powered by Gemini</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            {loading ? (
              <div className="p-12 text-center text-slate-400 italic">Calculating predictions...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Days Left</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.map(pred => (
                    <tr key={pred.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {pred.status === 'critical' ? (
                            <ShieldAlert className="text-rose-500" size={16} />
                          ) : pred.status === 'warning' ? (
                            <AlertCircle className="text-amber-500" size={16} />
                          ) : (
                            <CheckCircle className="text-emerald-500" size={16} />
                          )}
                          <span className="text-sm font-semibold text-slate-700">{pred.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className={`px-2 py-0.5 rounded-full ${
                          pred.status === 'critical' ? 'bg-rose-50 text-rose-600' :
                          pred.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {pred.predictedDaysLeft} days
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-bold text-indigo-600 hover:underline">Reorder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.slice().reverse().map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{sale.id.slice(0, 12)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">{sale.cashierName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-600">
                      {sale.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(sale.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ${sale.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
