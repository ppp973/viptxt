'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function TerminatedPage() {
  useEffect(() => {
    // Disable everything
    document.title = "SYSTEM TERMINATED";
    const interval = setInterval(() => {
      debugger;
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mb-8 border border-red-600/50"
      >
        <ShieldAlert className="text-red-600 w-12 h-12" />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4"
      >
        ACCESS <span className="text-red-600">TERMINATED</span>
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-md"
      >
        <p className="text-slate-500 font-mono text-sm leading-relaxed mb-8">
          Unauthorized developer tools detected. Your session has been permanently terminated for security reasons. 
          All temporary data has been purged.
        </p>
        
        <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl">
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest">
            Security Protocol: Alpha-9
          </p>
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600/20 animate-scan" />
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
