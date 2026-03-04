'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Shield,
  Trash2,
  Loader2,
  Layout,
  Upload,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import PageLoader from '@/components/PageLoader';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_secret');
    if (savedPassword) {
      setAdminPassword(savedPassword);
      setIsAdminAuthenticated(true);
    }
  }, []);

  const fetchAdminData = React.useCallback(async () => {
    try {
      const secret = sessionStorage.getItem('admin_secret') || adminPassword;
      const [usersRes, batchesRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'x-admin-secret': secret }
        }),
        fetch('/api/admin/batches', {
          headers: { 'x-admin-secret': secret }
        })
      ]);
      
      if (usersRes.status === 401 || batchesRes.status === 401) {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('admin_secret');
        return;
      }

      if (usersRes.ok && batchesRes.ok) {
        setUsers(await usersRes.json());
        setBatches(await batchesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [adminPassword]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.isAdmin) {
        router.push('/dashboard');
      } else if (isAdminAuthenticated) {
        fetchAdminData();
      }
    }
  }, [authLoading, user, router, isAdminAuthenticated, fetchAdminData]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem('admin_secret', adminPassword);
    setIsAdminAuthenticated(true);
    setLoading(true);
    fetchAdminData();
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-8">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Admin Verification</h1>
          <p className="text-slate-500 text-sm mb-8">This area is restricted. Please enter the master security key.</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative group">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter Security Key"
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-center tracking-[0.5em] font-bold"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-500/20 group"
            >
              Unlock Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-8 text-slate-600 hover:text-slate-400 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const downloadJson = (batch: any) => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(batch, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${batch.title}_API_Structure.json`;
    document.body.appendChild(element);
    element.click();
  };

  const downloadTxt = (batch: any) => {
    const element = document.createElement("a");
    const file = new Blob([batch.rawContent || ''], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${batch.title}_${batch.studentId}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AnimatePresence>
        {(authLoading || loading) && <PageLoader />}
      </AnimatePresence>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-12 custom-scrollbar">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="px-2.5 py-0.5 bg-blue-600/10 text-blue-400 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-blue-500/10">
                System Control
              </span>
              <div className="h-px w-6 bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrator Panel</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Platform-wide oversight and data management systems.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Active Users', value: users.length, color: 'from-blue-600/10 to-blue-400/5', border: 'border-blue-500/10', text: 'text-blue-400' },
              { label: 'Total BSTs', value: batches.length, color: 'from-emerald-600/10 to-emerald-400/5', border: 'border-emerald-500/10', text: 'text-emerald-400' },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className={cn(
                  "glass px-6 py-4 rounded-2xl border text-center bg-gradient-to-b shadow-xl",
                  stat.color, stat.border
                )}
              >
                <p className={cn("text-[10px] uppercase font-bold tracking-[0.2em] mb-1", stat.text)}>{stat.label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Users Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users size={24} className="text-blue-400" /> Users 
                <span className="text-sm font-medium text-slate-500 ml-2 bg-slate-800 px-3 py-1 rounded-full">{users.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {users.map((u, idx) => (
                <motion.div 
                  key={u.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold text-xl border border-white/5 group-hover:scale-110 transition-transform">
                      {u.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white flex items-center gap-3">
                        {u.name} 
                        {u.isAdmin && <span className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg font-bold tracking-widest uppercase">ADMIN</span>}
                      </p>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        ID: <span className="text-blue-400 font-mono">{u.studentId}</span> • Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {batches.some(b => b.userId === u.id) && (
                    <div className="px-3 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">
                      Active Data
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Batches Section */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen size={24} className="text-emerald-400" /> Global BSTs
                <span className="text-sm font-medium text-slate-500 ml-2 bg-slate-800 px-3 py-1 rounded-full">{batches.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {batches.map((b, idx) => (
                <motion.div 
                  key={b.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{b.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-slate-500 font-medium">
                        Student: <span className="text-blue-400 font-mono">{b.studentId || 'N/A'}</span>
                      </p>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <p className="text-sm text-slate-500 font-medium">{b.subjects.length} Subjects</p>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase tracking-widest">ID: {b.id}</p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => setSelectedBatch(b)}
                      className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 text-white rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
                    >
                      VIEW
                    </button>
                    <button 
                      onClick={() => downloadJson(b)}
                      className="p-3 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl transition-all border border-violet-500/20"
                      title="Download API JSON"
                    >
                      <Layout size={18} />
                    </button>
                    <button 
                      onClick={() => downloadTxt(b)}
                      className="p-3 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-500/20"
                      title="Download Original BST"
                    >
                      <Upload size={18} className="rotate-180" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* BST Viewer Modal */}
        <AnimatePresence>
          {selectedBatch && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBatch(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="w-full max-w-5xl glass rounded-[3rem] overflow-hidden relative z-10 max-h-[85vh] flex flex-col shadow-2xl border border-white/10"
              >
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedBatch.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-slate-400 font-medium">Original BST Content</p>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <p className="text-sm text-blue-400 font-bold uppercase tracking-widest">Student: {selectedBatch.studentId}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBatch(null)} 
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
                  >
                    <X size={28} />
                  </button>
                </div>
                <div className="p-10 overflow-y-auto flex-1 bg-slate-950/30 custom-scrollbar">
                  <div className="p-8 rounded-[2rem] bg-slate-950/50 border border-white/5">
                    <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedBatch.rawContent || 'No raw content available for this BST.'}
                    </pre>
                  </div>
                </div>
                <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end gap-4">
                  <button 
                    onClick={() => downloadJson(selectedBatch)}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 border border-white/5"
                  >
                    <Layout size={20} /> API JSON
                  </button>
                  <button 
                    onClick={() => downloadTxt(selectedBatch)}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                  >
                    <Upload size={20} className="rotate-180" /> Original BST
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
