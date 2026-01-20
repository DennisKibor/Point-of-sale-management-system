
import React, { useState } from 'react';
import { Product } from '../types';
import { db } from '../db';
import { Plus, Search, Edit2, Trash2, Filter, AlertTriangle, Check, X } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdate: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const startEdit = (p: Product) => {
    setIsEditing(p.id);
    setEditForm(p);
  };

  const handleSave = () => {
    if (isEditing && editForm.name) {
      db.updateProduct(editForm as Product);
      setIsEditing(null);
      onUpdate();
    }
  };

  const addNew = () => {
    const newId = `prod-${Date.now()}`;
    const newP: Product = { id: newId, name: 'New Product', category: 'General', price: 0, stock: 0, minStock: 5 };
    db.updateProduct(newP);
    onUpdate();
    startEdit(newP);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) {
      db.deleteProduct(id);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500">Track stock levels and manage product listings.</p>
        </div>
        <button 
          onClick={addNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Min Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    {isEditing === p.id ? (
                      <input 
                        className="w-full p-1 border rounded text-sm" 
                        value={editForm.name} 
                        onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === p.id ? (
                      <input 
                        className="w-full p-1 border rounded text-sm" 
                        value={editForm.category} 
                        onChange={e => setEditForm({...editForm, category: e.target.value})} 
                      />
                    ) : (
                      <span className="text-sm text-slate-500">{p.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === p.id ? (
                      <input 
                        type="number"
                        className="w-full p-1 border rounded text-sm" 
                        value={editForm.price} 
                        onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} 
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-800">${p.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === p.id ? (
                      <input 
                        type="number"
                        className="w-full p-1 border rounded text-sm" 
                        value={editForm.stock} 
                        onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value)})} 
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-rose-600' : 'text-slate-700'}`}>
                          {p.stock}
                        </span>
                        {p.stock <= p.minStock && <AlertTriangle size={14} className="text-amber-500" />}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing === p.id ? (
                      <input 
                        type="number"
                        className="w-full p-1 border rounded text-sm" 
                        value={editForm.minStock} 
                        onChange={e => setEditForm({...editForm, minStock: parseInt(e.target.value)})} 
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">{p.minStock}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing === p.id ? (
                        <>
                          <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <Check size={18} />
                          </button>
                          <button onClick={() => setIsEditing(null)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
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

export default Inventory;
