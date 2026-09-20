'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout } from '@/context/LayoutContext';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Trophy,
  Users,
  Eye,
  Activity,
  ChevronRight,
  X,
  Recycle,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/', label: 'Home', icon: Home, color: 'text-emerald-500 dark:text-emerald-400', badge: 'Main' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500 dark:text-blue-400', badge: 'Metrics' },
  { href: '/explore', label: 'Explore', icon: MapPin, color: 'text-cyan-500 dark:text-cyan-400', badge: 'GIS' },
  { href: '/report', label: 'Tag Hotspot', icon: PlusCircle, color: 'text-emerald-500 dark:text-emerald-400', badge: 'Report' },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-amber-500 dark:text-amber-400', badge: 'Rank' },
  { href: '/missions', label: 'Missions', icon: Users, color: 'text-purple-500 dark:text-purple-400', badge: 'Field' },
  { href: '/monitoring', label: 'Monitoring', icon: Eye, color: 'text-teal-500 dark:text-teal-400', badge: 'Audit' },
  { href: '/timeline', label: 'Timeline', icon: Activity, color: 'text-indigo-500 dark:text-indigo-400', badge: 'Feed' },
  { href: '/about', label: 'About', icon: Recycle, color: 'text-emerald-500 dark:text-emerald-400', badge: 'Story' },
  { href: '/profile', label: 'Profile', icon: Trophy, color: 'text-amber-500 dark:text-amber-400', badge: 'Account' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { user } = useAuth();

  if (pathname === '/login') return null;

  return (
    <>
      <aside
        className={`hidden md:flex flex-col bg-slate-100 dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800/80 transition-all duration-300 shrink-0 z-30 select-none sticky top-16 h-[calc(100vh-4rem)] overflow-hidden ${
          sidebarOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className="pt-2 pb-3 px-2 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-3">
          <div className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-xl border transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900/60'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div
                    className={`p-1.5 rounded-lg bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800/80 group-hover:border-slate-400 dark:group-hover:border-slate-700 shrink-0 transition-colors ${item.color}`}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>

                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="font-semibold text-xs truncate">{item.label}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {sidebarOpen && user && (
            <div className="bg-slate-200 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800/80 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-500/20 flex items-center justify-center shrink-0">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between shadow-2xl p-5 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#062319] border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-none">Trash<span className="text-emerald-400">Tag</span> Navigation</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Environmental Recovery</p>
                  </div>
                </div>

                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleSidebar}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-slate-900 border-slate-700 text-white font-bold'
                          : 'border-transparent text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${item.color}`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-mono">TrashTag Environmental v2.0</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
