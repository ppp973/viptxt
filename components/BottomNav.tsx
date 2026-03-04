'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Batches', icon: BookOpen, href: '/batches' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-2">
      <div className="glass rounded-2xl flex items-center justify-around p-2 shadow-2xl shadow-black/80 border border-white/5 backdrop-blur-2xl">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center py-2 rounded-xl transition-all relative group",
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              )}>
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={cn(
                    "mb-1 transition-all",
                    isActive && "scale-110 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                  )}
                >
                  <item.icon size={20} />
                </motion.div>
                <span className="text-[8px] font-bold uppercase tracking-widest">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute -bottom-1 w-8 h-0.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
