
import React, { useState, useMemo } from 'react';
import { Product, Sale, SaleItem, User, PaymentMethod } from '../types';
import { db } from '../db';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingCart, User as UserIcon, Tag, AlertCircle, Smartphone } from 'lucide-react';

interface CheckoutProps {
  products: Product[];
  onSaleComplete: () => void;
  user: User;
}

const Checkout: React.FC<CheckoutProps> = ({ products, onSaleComplete, user }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        price: product.price, 
        total: product.price 
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        const product = products.find(p => p.id === productId);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((acc, item) => acc + item.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      items: cart,
      totalAmount: total,
      timestamp: new Date().toISOString(),
      cashierId: user.id,
      cashierName: user.username,
      paymentMethod: paymentMethod
    };

    db.recordSale(newSale);
    setCart([]);
    onSaleComplete();
    alert(`Sale completed successfully with ${paymentMethod}!`);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-11 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  product.stock <= 0 
                    ? 'bg-slate-50 border-slate-200 opacity-60 grayscale cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md active:scale-95'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-tight">
                    {product.category}
                  </span>
                  {product.stock <= product.minStock && product.stock > 0 && (
                    <AlertCircle className="text-amber-500" size={16} />
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-2 h-10">{product.name}</h4>
                <div className="mt-auto pt-3 flex items-end justify-between">
                  <span className="text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                  <span className={`text-[10px] font-bold ${product.stock <= product.minStock ? 'text-rose-500' : 'text-slate-400'}`}>
                    STOCK: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart / Sidebar */}
      <div className="w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <ShoppingCart className="text-indigo-600" size={24} />
          <h2 className="text-lg font-bold text-slate-800">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Tag size={32} className="opacity-20" />
              </div>
              <p className="text-sm">Scan products or select from the list to start an order.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-200">
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</h5>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 p-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-indigo-600 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:text-indigo-600 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-sm font-bold text-slate-900">${item.total.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-slate-600 text-sm">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 text-sm">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between items-center text-slate-900 font-bold text-xl pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${
                paymentMethod === 'CASH' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <Banknote size={16} />
              CASH
            </button>
            <button 
              onClick={() => setPaymentMethod('CARD')}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${
                paymentMethod === 'CARD' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <CreditCard size={16} />
              CARD
            </button>
            <button 
              onClick={() => setPaymentMethod('MOBILE')}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${
                paymentMethod === 'MOBILE' ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <Smartphone size={16} />
              MOBILE
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              cart.length === 0 ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95'
            }`}
          >
            Complete Order
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
