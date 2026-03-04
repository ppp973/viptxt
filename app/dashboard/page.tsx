'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Trash2, 
  Loader2,
  X,
  Upload,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import WhatsAppPopup from '@/components/WhatsAppPopup';
import PageLoader from '@/components/PageLoader';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      // Small delay to ensure "perfectly loaded" feel
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchBatches();
    }
  }, [authLoading, user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !selectedFile) {
      alert('Please provide both title and a .txt file');
      return;
    }

    setUploading(true);
    try {
      const content = await selectedFile.text();
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: uploadTitle, content }),
      });
      if (res.ok) {
        await fetchBatches();
        setIsUploadOpen(false);
        setUploadTitle('');
        setSelectedFile(null);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create batch');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

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
      <WhatsAppPopup />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-500/10">
                {user?.studentId || 'STUDENT'}
              </span>
              <div className="h-px w-8 bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Session</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              Dashboard
            </motion.h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Manage your study batches and resources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all backdrop-blur-md"
              />
            </div>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Batches', value: batches.length, icon: BookOpen, color: 'blue' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={cn(
                  "p-3 rounded-2xl transition-transform group-hover:scale-110",
                  stat.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
                  stat.color === 'violet' ? "bg-violet-500/10 text-violet-400" :
                  stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                  "bg-amber-500/10 text-amber-400"
                )}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass h-64 rounded-3xl animate-pulse" />
              ))
            ) : filteredBatches.length > 0 ? (
              filteredBatches.map((batch, i) => (
                <motion.div
                  key={batch.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 + 0.4 }}
                  className="glass rounded-[2rem] overflow-hidden group hover:neon-blue transition-all border border-white/5 flex flex-col h-full"
                >
                  <div className="p-8 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={28} />
                      </div>
                      <button 
                        onClick={() => deleteBatch(batch.id)}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">{batch.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <Filter size={14} className="text-blue-400" /> {batch.subjects.length} Subjects
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                        <Clock size={14} className="text-violet-400" /> {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/batches/${batch.id}`}>
                    <div className="px-8 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-blue-600/10 transition-all">
                      <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Open Batch</span>
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500 glass rounded-[3rem] border-dashed border-white/10"
              >
                <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <BookOpen size={48} className="text-slate-700" />
                </div>
                <p className="text-2xl font-bold text-white mb-2">No batches found</p>
                <p className="text-slate-400 mb-8">Start by uploading your first study material.</p>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Upload size={20} /> Upload BST
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUploadOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg glass rounded-[2.5rem] overflow-hidden relative z-10 border border-white/10 shadow-2xl shadow-blue-500/10"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Upload New Batch</h2>
                    <p className="text-sm text-slate-400 mt-1">Paste your BST content or upload a .txt file</p>
                  </div>
                  <button onClick={() => setIsUploadOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleUpload} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Batch Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Physics Crash Course 2026"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">BST File (.txt)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".txt"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className={cn(
                        "w-full border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all",
                        selectedFile ? "border-blue-500/50 bg-blue-500/5" : "border-white/5 bg-slate-950 group-hover:border-white/10"
                      )}>
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                          selectedFile ? "bg-blue-600 text-white" : "bg-white/5 text-slate-600"
                        )}>
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">{selectedFile ? selectedFile.name : 'Click or Drag to Upload'}</p>
                          <p className="text-xs text-slate-500 mt-1">Only .txt files are supported</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Processing Batch...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Generate Study Batch</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <BottomNav />
      </main>
    </div>
  );
}
