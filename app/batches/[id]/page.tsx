'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import AdvancedPlayer from '@/components/AdvancedPlayer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Play, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  BookOpen,
  Clock,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';

import PageLoader from '@/components/PageLoader';

export default function BatchDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [openSubjects, setOpenSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/batches/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBatch(data);
          // Open first subject by default
          if (data.subjects.length > 0) {
            setOpenSubjects([data.subjects[0].name]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        // Small delay for "perfectly loaded" feel
        setTimeout(() => setLoading(false), 800);
      }
    };

    if (!authLoading && user) {
      fetchBatch();
    }
  }, [id, authLoading, user]);

  const toggleSubject = (name: string) => {
    setOpenSubjects(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  if (!authLoading && !loading && !batch) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Batch not found</div>;

  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AnimatePresence>
        {(authLoading || loading) && <PageLoader />}
      </AnimatePresence>
      
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {activeItem ? (
          <div className="flex-1 overflow-hidden">
            <AdvancedPlayer 
              batchId={batch.id}
              item={activeItem} 
              initialPosition={batch.progress?.[activeItem.url] || 0}
              onBack={() => setActiveItem(null)}
              onNext={() => {
                setActiveItem(null);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-12 custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-10 h-10 flex items-center justify-center bg-slate-900/40 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <span className="px-2.5 py-0.5 bg-blue-600/10 text-blue-500 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-blue-500/10">
                    Batch Active
                  </span>
                  <div className="h-px w-6 bg-slate-800" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {batch?.id}</span>
                </motion.div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{batch?.title}</h1>
                <div className="flex items-center gap-6 mt-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><BookOpen size={14} className="text-blue-500" /> {batch?.subjects.length} Subjects</span>
                  <span className="flex items-center gap-2"><Clock size={14} className="text-violet-500" /> Created {batch && new Date(batch.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-4 max-w-5xl mx-auto">
              {batch?.subjects.map((subject: any, sIdx: number) => (
                <motion.div 
                  key={subject.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.05 }}
                  className="glass rounded-3xl overflow-hidden border border-white/5 shadow-xl"
                >
                  <button 
                    onClick={() => toggleSubject(subject.name)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{subject.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subject.chapters.length} Chapters • {subject.chapters.reduce((acc: number, c: any) => acc + c.items.length, 0)} Materials</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 transition-all",
                      openSubjects.includes(subject.name) ? "rotate-180 bg-blue-600/10 text-blue-400" : "group-hover:bg-white/10"
                    )}>
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {openSubjects.includes(subject.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-slate-950/20"
                      >
                        <div className="p-6 space-y-8">
                          {subject.chapters.map((chapter: any) => (
                            <div key={chapter.name} className="space-y-4">
                              <div className="flex items-center gap-4 px-2">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{chapter.name}</h4>
                                <div className="h-px flex-1 bg-white/5" />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {chapter.items.map((item: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveItem(item)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group text-left relative overflow-hidden"
                                  >
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                                      item.type === 'video' ? "bg-blue-600/10 text-blue-500" : "bg-emerald-600/10 text-emerald-500"
                                    )}>
                                      {item.type === 'video' ? <Play size={20} fill="currentColor" /> : <FileText size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                          "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                                          item.type === 'video' ? "bg-blue-600/10 text-blue-400" : "bg-emerald-600/10 text-emerald-400"
                                        )}>
                                          {item.type}
                                        </span>
                                        {batch.progress?.[item.url] > 0 && (
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                            {Math.round(batch.progress[item.url])}%
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ChevronRight size={16} className="text-blue-400" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <BottomNav />
      </main>
    </div>
  );
}
