'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon,
  ChevronRight,
  LogOut
} from 'lucide-react';

import PageLoader from '@/components/PageLoader';
import { AnimatePresence } from 'motion/react';

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!authLoading) {
      setTimeout(() => setLoading(false), 800);
    }
  }, [authLoading]);

  const sections = [
    { name: 'Profile', icon: User, desc: 'Update personal information' },
    { name: 'Notifications', icon: Bell, desc: 'Manage study alerts' },
    { name: 'Security', icon: Shield, desc: 'Password and safety' },
    { name: 'Appearance', icon: Moon, desc: 'Theme settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AnimatePresence>
        {(authLoading || loading) && <PageLoader />}
      </AnimatePresence>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-12 custom-scrollbar">
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <span className="px-2.5 py-0.5 bg-emerald-600/10 text-emerald-500 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-emerald-500/10">
              Preferences
            </span>
            <div className="h-px w-6 bg-slate-800" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">App Configuration</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Customize your learning experience.</p>
        </header>

        <div className="max-w-2xl space-y-4">
          {sections.map((section, idx) => (
            <motion.button
              key={section.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="w-full glass p-6 rounded-3xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-600/5 transition-all flex items-center justify-between group relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-violet-400 group-hover:scale-110 transition-all">
                  <section.icon size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{section.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{section.desc}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-violet-600 transition-all group-hover:translate-x-1">
                <ChevronRight size={18} />
              </div>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={logout}
            className="w-full p-6 rounded-3xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center justify-between group mt-10 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <LogOut size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-red-500">Sign Out</h3>
                <p className="text-[10px] text-red-500/60 font-bold uppercase tracking-widest mt-1">End your session</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <ChevronRight size={18} />
            </div>
          </motion.button>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}
