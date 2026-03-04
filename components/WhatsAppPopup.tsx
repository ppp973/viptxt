'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, ArrowRight, Sparkles, Bell } from 'lucide-react';

interface WhatsAppPopupProps {
  onClose?: () => void;
}

export default function WhatsAppPopup({ onClose }: WhatsAppPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if it's been shown in this session
    const hasShown = sessionStorage.getItem('wa_popup_shown');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('wa_popup_shown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleJoin = () => {
    window.open('https://whatsapp.com/channel/0029VbAvDSX0QeahEg4kkE3U', '_blank');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-2xl"
          >
            <button 
              onClick={handleClose}
              className="absolute right-6 top-6 text-slate-500 transition-colors hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a] border border-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#075E54]/20">
                  <MessageCircle className="h-6 w-6 text-[#25D366]" fill="currentColor" />
                </div>
              </div>

              <h2 className="mb-1 text-2xl font-bold text-white">
                Join Study Group
              </h2>
              <p className="mb-8 text-sm font-medium text-slate-500">
                Get Instant Notes & Updates
              </p>

              <button
                onClick={handleJoin}
                className="w-full rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Join WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
