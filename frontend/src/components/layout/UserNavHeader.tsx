'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  LogOut,
  LogIn,
  Menu,
  X,
  MapPin,
  PlusCircle,
  LayoutDashboard,
  Trophy,
  Users,
  Eye,
  Activity,
  Home,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Recycle,
} from 'lucide-react';

interface UserNavHeaderProps {
  className?: string;
  redirectTo?: string;
}

const MENU_ITEMS = [
  { href: '/', label: 'Home Landing Page', icon: Home, color: 'text-emerald-400', badge: 'Overview' },
  { href: '/dashboard', label: 'Impact Dashboard', icon: LayoutDashboard, color: 'text-blue-400', badge: 'Live Metrics' },
  { href: '/explore', label: 'Explore Map & Hotspots', icon: MapPin, color: 'text-cyan-400', badge: 'GIS Map' },
  { href: '/report', label: 'Tag New Hotspot', icon: PlusCircle, color: 'text-emerald-400', badge: 'Report' },
  { href: '/leaderboard', label: 'Leaderboard & Badges', icon: Trophy, color: 'text-amber-400', badge: 'Rankings' },
  { href: '/missions', label: 'Community Missions', icon: Users, color: 'text-purple-400', badge: 'Volunteers' },
  { href: '/monitoring', label: '30/60/90 Monitoring', icon: Eye, color: 'text-teal-400', badge: 'Audits' },
  { href: '/timeline', label: 'Global Audit Timeline', icon: Activity, color: 'text-indigo-400', badge: 'Feed' },
  { href: '/about', label: 'About Movement', icon: Sparkles, color: 'text-emerald-400', badge: 'Story' },
  { href: '/profile', label: 'User Profile', icon: Trophy, color: 'text-amber-400', badge: 'Account' },
];

export function UserNavHeader({ className = '', redirectTo = '/dashboard' }: UserNavHeaderProps) {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 3-Line Hamburger Menu Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all flex items-center gap-1.5 shadow-sm group"
        title="Open Page Navigation Menu"
      >
        <Menu className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold hidden md:inline">Menu</span>
      </button>

      <DemoRoleSwitcher />

      {user ? (
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 px-2.5 py-1.5 rounded-xl text-xs transition-colors group cursor-pointer shadow-sm"
            title="View User Profile"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-500/20 flex items-center justify-center shrink-0">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 truncate max-w-[110px] transition-colors leading-tight">
                {user.name}
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block">
                {user.role}
              </span>
            </div>
          </Link>

          {/* Logout Button: Logs out and opens Log In / Sign In modal */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-red-50/80 dark:bg-red-950/60 text-slate-700 dark:text-slate-300 hover:text-red-300 border border-slate-300 dark:border-slate-700 hover:border-red-500/40 rounded-xl text-xs font-semibold transition-colors"
            title="Log Out and return to Sign In"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAuth('login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-900/30"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In / Sign Up</span>
          </button>
        </div>
      )}

      {/* ── Slide-Out Drawer Side Navigation ───────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[110] flex justify-start bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-80 max-w-[85vw] h-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl p-5 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#062319] border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">Trash<span className="text-emerald-500 dark:text-emerald-400">Tag</span> Navigation</h3>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Community Recovery Hub</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card inside Drawer */}
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="bg-white/90 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {user.role}
                  </span>
                </Link>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/30 text-center space-y-2">
                  <p className="text-xs font-semibold text-emerald-300">Join TrashTag Community</p>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      openAuth('login');
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
                  >
                    Log In / Sign Up
                  </button>
                </div>
              )}

              {/* Navigation Menu Links List */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 px-2 block mb-1">
                  App Directories & Pages
                </span>

                {MENU_ITEMS.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-900 group-hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 ${item.color}`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                          {item.badge}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {user && (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-red-50/80 dark:bg-red-950/60 text-red-400 hover:text-red-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500/40 flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out & Sign In</span>
                </button>
              )}
              <p className="text-[10px] text-slate-500 text-center font-mono">
                TrashTag Environmental v2.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        redirectTo={redirectTo}
      />
    </div>
  );
}
