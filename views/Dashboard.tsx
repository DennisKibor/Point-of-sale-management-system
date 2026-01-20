
import React, { useState, useEffect } from 'react';
// Import Link for navigation
import { Link } from 'react-router-dom';
import { Product, Sale, AIInsight } from '../types';
import { getBusinessInsights } from '../geminiService';
import { TrendingUp, ShoppingBag, Box, Users, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingInsights(true);
      const data = await getBusinessInsights(sales, products);
      setInsights(data);
      setLoadingInsights(false);
    };
    fetchAI();
  }, [sales, products]);

  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  
  // Chart Data
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const daySales = sales
      .filter(s => new Date(s.timestamp).toDateString() === date.toDateString())
      .reduce((acc, s) => acc + s.totalAmount, 0);
    return { name: dayStr, value: daySales };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Overview</h1>
          <p className="text-slate-500">Real-time performance metrics and AI suggestions.</p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Active
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<TrendingUp className="text-emerald-500" />} color="emerald" change="+12.5%" />
        <StatCard title="Transactions" value={sales.length.toString()} icon={<ShoppingBag className="text-blue-500" />} color="blue" change="+5.2%" />
        <StatCard title="Low Stock Items" value={lowStockCount.toString()} icon={<Box className="text-orange-500" />} color="orange" change={lowStockCount > 5 ? 'Critical' : 'Stable'} />
        <StatCard title="Customer Base" value="482" icon={<Users className="text-indigo-500" />} color="indigo" change="+18" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800">Sales Trend (7 Days)</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-xs font-medium focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ fontWeight: 600, color: '#4f46e5' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={20} />
              <h2 className="text-lg font-bold text-white">Gemini Insights</h2>
            </div>
            {loadingInsights && <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {insight.impact === 'positive' ? (
                      <CheckCircle2 className="text-emerald-400 mt-1 shrink-0" size={18} />
                    ) : insight.impact === 'negative' ? (
                      <AlertTriangle className="text-rose-400 mt-1 shrink-0" size={18} />
                    ) : (
                      <Info className="text-sky-400 mt-1 shrink-0" size={18} />
                    )}
                    <div>
                      <h4 className="text-white font-semibold text-sm leading-tight mb-1">{insight.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-3">{insight.description}</p>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Recommendation</span>
                        <p className="text-indigo-300 text-[11px] font-medium leading-normal">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Sparkles className="text-slate-700" size={48} />
                <p className="text-slate-500 text-sm">Waiting for more data to generate insights...</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-800/20 border-t border-slate-800">
            <Link to="/ai-chat" className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
              Talk to AI Business Advisor <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string, change: string }> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-${color}-50 bg-opacity-50`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
        }`}>
          {change}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
