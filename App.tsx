
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Box, BarChart3, MessageSquare, LogOut, Search, Plus, Trash2, User as UserIcon, AlertCircle } from 'lucide-react';
import { User, UserRole, Product, Sale } from './types';
import { db } from './db';

// Views
import Dashboard from './views/Dashboard';
import Checkout from './views/Checkout';
import Inventory from './views/Inventory';
import Reports from './views/Reports';
import AIChat from './views/AIChat';
import Login from './views/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('pos_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    setProducts(db.getProducts());
    setSales(db.getSales());
  }, []);

  const refreshData = useCallback(() => {
    setProducts(db.getProducts());
    setSales(db.getSales());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pos_current_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 shadow-xl z-20">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">G</div>
            <span className="text-xl font-bold tracking-tight">Gemini<span className="text-indigo-400">POS</span></span>
          </div>
          
          <div className="flex-1 py-6 space-y-1 overflow-y-auto px-4">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/checkout" icon={<ShoppingCart size={20} />} label="Point of Sale" />
            {user.role === UserRole.ADMIN && (
              <>
                <SidebarLink to="/inventory" icon={<Box size={20} />} label="Inventory" />
                <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
              </>
            )}
            <SidebarLink to="/ai-chat" icon={<MessageSquare size={20} />} label="AI Advisor" className="text-indigo-400" />
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <UserIcon size={20} className="text-slate-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none">{user.username}</span>
                <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{user.role}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <LogOut size={18} className="group-hover:text-red-400" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard products={products} sales={sales} />} />
            <Route path="/checkout" element={<Checkout products={products} onSaleComplete={refreshData} user={user} />} />
            {user.role === UserRole.ADMIN && (
              <>
                <Route path="/inventory" element={<Inventory products={products} onUpdate={refreshData} />} />
                <Route path="/reports" element={<Reports sales={sales} products={products} />} />
              </>
            )}
            <Route path="/ai-chat" element={<AIChat sales={sales} products={products} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, className?: string }> = ({ to, icon, label, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      } ${className || ''}`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default App;
