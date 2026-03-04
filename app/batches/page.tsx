'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageLoader from '@/components/PageLoader';
import Link from 'next/link';

export default function MyBatches() {
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Small delay for "perfectly loaded" feel
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchBatches();
    }
  }, [authLoading, user]);

  const deleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBatches(batches.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBatches = batches.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AnimatePresence>
        {(authLoading || loading) && <PageLoader />}
      </AnimatePresence>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-12 custom-scrollbar">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="px-2.5 py-0.5 bg-blue-600/10 text-blue-500 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-blue-500/10">
                Library
              </span>
              <div className="h-px w-6 bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Your Study Materials</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Batches</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage all your study materials in one place.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search library..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass h-64 rounded-[2.5rem] animate-pulse border border-white/5" />
              ))
            ) : filteredBatches.length > 0 ? (
              filteredBatches.map((batch, i) => (
                <motion.div
                  key={batch.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all border border-white/5 shadow-xl relative"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={32} />
                      </div>
                      <button 
                        onClick={() => deleteBatch(batch.id)}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">{batch.title}</h3>
                    <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-2">
                        <Filter size={16} className="text-blue-400" /> {batch.subjects.length} Subjects
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={16} className="text-violet-400" /> {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/batches/${batch.id}`}>
                    <div className="px-8 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-blue-600/10 transition-all">
                      <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Open Batch</span>
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:translate-x-1 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-slate-900/50 border border-white/5 rounded-[2rem] flex items-center justify-center mb-6"
                >
                  <BookOpen size={48} className="text-slate-700" />
                </motion.div>
                <p className="text-2xl font-bold text-white mb-2">No batches found</p>
                <p className="text-slate-500 mb-8">Your library is currently empty.</p>
                <Link 
                  href="/dashboard" 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  Upload Your First Batch
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}
