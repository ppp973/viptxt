'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { UserPlus, LogIn, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PageLoader from '@/components/PageLoader';
import { AnimatePresence } from 'motion/react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setRedirecting(true);
        // Small delay for "perfectly loaded" feel
        setTimeout(() => {
          login(data.user);
        }, 1000);
      } else {
        setError(data.message || 'Registration failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      <AnimatePresence>
        {redirecting && <PageLoader />}
      </AnimatePresence>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 rounded-[2rem] relative z-10 border border-white/5 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20"
          >
            <UserPlus className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Join Lumina</h1>
          <p className="text-slate-500 mt-2 text-center text-sm font-medium">Start your learning experience today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all placeholder:text-slate-700"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all placeholder:text-slate-700"
              placeholder="e.g. johndoe123"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all placeholder:text-slate-700"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-bold transition-colors inline-flex items-center gap-1 group">
              Sign In <LogIn className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
