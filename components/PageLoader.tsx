'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#020617] backdrop-blur-xl"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full border-2 border-white/5 border-t-blue-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h3 className="text-lg font-bold text-white tracking-tight">Lumina Study</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Preparing your study environment...</p>
      </motion.div>
    </motion.div>
  );
}
