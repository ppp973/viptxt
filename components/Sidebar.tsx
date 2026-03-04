'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'My Batches', icon: BookOpen, href: '/batches' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  if (user?.isAdmin) {
    menuItems.push({ name: 'Admin Panel', icon: Sparkles, href: '/admin' });
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 100 : 300 }}
      className="hidden md:flex flex-col h-screen bg-[#020617] border-r border-white/5 sticky top-0 z-50 shadow-2xl"
    >
      {/* Logo */}
      <div className="p-8 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20 border border-white/5">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight block">Lumina</span>
                {user?.isAdmin && <span className="text-[8px] bg-violet-600/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-md font-bold tracking-widest uppercase">ADMIN</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white active:scale-90"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/10" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-blue-400" : "group-hover:text-slate-300 transition-colors")} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm tracking-tight"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/5">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/50 transition-all group",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-blue-500/10 border border-white/5 group-hover:scale-110 transition-transform">
            {user?.name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{user?.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5">
                {user?.studentId || 'STUDENT'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-slate-600 active:scale-90"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
