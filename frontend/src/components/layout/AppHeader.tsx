'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLayout } from '@/context/LayoutContext';
import { useTheme } from '@/context/ThemeContext';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Recycle,
} from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useLayout();
  const { theme, toggleTheme } = useTheme();

  if (pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#060d0f]/95 backdrop-blur-md px-3 lg:px-4 flex items-center justify-between sticky top-0 z-40 shrink-0 transition-colors">
      {/* Left: 3-Line Menu Button (No text) & TrashTag Brand Logo */}
      <div className={`flex items-center gap-2.5 transition-all duration-300 ${sidebarOpen ? 'md:w-56' : 'w-auto'}`}>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700/60 transition-all flex items-center justify-center shadow-sm group"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>

        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight group">
          <div className="w-8 h-8 rounded-xl bg-[#062319] border border-emerald-500/50 flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Recycle className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl">
            Trash<span className="text-emerald-500 dark:text-emerald-400">Tag</span>
          </span>
        </Link>
      </div>

      {/* Right Controls: Theme Toggle, DemoRoleSwitcher, Auth / Logout */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700/60 transition-all shadow-sm flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        <DemoRoleSwitcher />

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-emerald-500/50 px-2.5 py-1.5 rounded-xl text-xs transition-colors group cursor-pointer shadow-sm"
              title="View Profile"
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
                <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {user.role}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-50/80 dark:bg-red-950/60 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 border border-slate-300 dark:border-slate-700/80 hover:border-red-400 dark:hover:border-red-500/40 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              title="Log Out and return to Sign In page"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-900/30"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In / Sign Up</span>
          </Link>
        )}
      </div>
    </header>
  );
}
