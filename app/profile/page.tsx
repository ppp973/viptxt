'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import PageLoader from '@/components/PageLoader';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Edit2,
  BookOpen
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AnimatePresence>
        {authLoading && <PageLoader />}
      </AnimatePresence>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-12 custom-scrollbar">
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <span className="px-2.5 py-0.5 bg-violet-600/10 text-violet-400 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-violet-500/10">
              Account Settings
            </span>
            <div className="h-px w-6 bg-slate-800" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Profile Overview</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Manage your digital identity and account details.</p>
        </header>

        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-2xl"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full" />
            
            <div className="absolute top-0 right-0 p-8">
              <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95">
                <Edit2 size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center md:items-start md:flex-row gap-8 relative z-10">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-32 h-32 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-500/20 border-2 border-white/10"
              >
                {user?.name?.[0] || 'U'}
              </motion.div>

              <div className="text-center md:text-left space-y-3 pt-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/10">
                    Student ID: {user?.studentId || 'N/A'}
                  </span>
                  {user?.isAdmin && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/10">
                      <Shield size={12} /> Administrator
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-8 border-t border-white/5 relative z-10">
              <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                  <Mail size={12} className="text-violet-400" /> Username
                </p>
                <p className="text-lg text-white font-bold">{user?.username}</p>
              </div>
              <div className="space-y-2 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={12} className="text-emerald-400" /> Member Since
                </p>
                <p className="text-lg text-white font-bold">March 2026</p>
              </div>
            </div>
          </motion.div>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}
