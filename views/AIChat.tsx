
import React, { useState, useRef, useEffect } from 'react';
import { Sale, Product } from '../types';
import { chatWithPOS } from '../geminiService';
import { Send, Bot, User, Sparkles, Loader2, ArrowRightCircle } from 'lucide-react';

interface AIChatProps {
  sales: Sale[];
  products: Product[];
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ sales, products }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your Gemini AI Business Advisor. You can ask me about your sales trends, inventory status, or for advice on how to improve your store's performance." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithPOS(userMsg, sales, products);
      setMessages(prev => [...prev, { role: 'bot', content: response || "I'm sorry, I couldn't process that request." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to AI advisor. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What are my best selling products?",
    "Identify items that might run out of stock soon.",
    "Give me a summary of today's performance.",
    "How can I increase my beverage sales?"
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white ring-4 ring-indigo-500/10">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">AI Advisor</h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
              Powered by Gemini 3 Flash
              <Sparkles size={14} className="text-amber-400" />
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-3 items-center text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium italic">Gemini is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length < 5 && (
          <div className="p-4 bg-indigo-50/50 border-t border-indigo-100/50">
            <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest mb-3 ml-1">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInput(s)}
                  className="bg-white hover:bg-indigo-600 hover:text-white border border-indigo-100 text-indigo-600 text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
              !input.trim() || loading 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20 hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
