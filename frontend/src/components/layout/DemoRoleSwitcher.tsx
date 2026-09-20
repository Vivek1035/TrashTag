'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loginApi } from '@/services/api';
import { UserCheck, ShieldCheck, Building2, User, Sparkles, ChevronDown } from 'lucide-react';

interface DemoAccount {
  label: string;
  role: 'USER' | 'VERIFIER' | 'ORGANIZATION' | 'ADMIN';
  email: string;
  name: string;
  avatarUrl: string;
  icon: React.ElementType;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Scout User',
    role: 'USER',
    email: 'anika.rao@trashtag.dev',
    name: 'Anika Rao',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    icon: User,
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    label: 'Verifier',
    role: 'VERIFIER',
    email: 'priya.verifier@trashtag.dev',
    name: 'Priya Krishnan',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    icon: ShieldCheck,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    label: 'Organization',
    role: 'ORGANIZATION',
    email: 'greenblr@trashtag.dev',
    name: 'Green Bengaluru',
    avatarUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=250',
    icon: Building2,
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    label: 'Admin',
    role: 'ADMIN',
    email: 'demo.admin@trashtag.dev',
    name: 'Arjun Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    icon: UserCheck,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

export function DemoRoleSwitcher() {
  const { user, login } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSwitchRole = async (account: DemoAccount) => {
    setLoadingRole(account.role);
    try {
      const response = await loginApi(account.email, 'Demo@12345');
      login(response.token, {
        id: response.user.id,
        name: response.user.displayName || response.user.username,
        email: response.user.email,
        role: response.user.role as any,
        avatarUrl: account.avatarUrl,
      });
      setOpen(false);
    } catch (err) {
      console.warn('Backend login fallback to local session mock for demo:', err);
      login('demo-jwt-token-' + account.role.toLowerCase(), {
        id: 'demo-uuid-' + account.role.toLowerCase(),
        name: account.name,
        email: account.email,
        role: account.role,
        avatarUrl: account.avatarUrl,
      });
      setOpen(false);
    } finally {
      setLoadingRole(null);
    }
  };

  const activeAccount = DEMO_ACCOUNTS.find((a) => a.role === user?.role) || DEMO_ACCOUNTS[0];
  const IconComponent = activeAccount.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
        title="Hackathon Demo Role Switcher"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wide text-slate-700 dark:text-slate-300 hidden sm:inline">Demo Role:</span>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${activeAccount.badgeColor} flex items-center gap-1`}>
          <IconComponent className="w-3 h-3" />
          {user ? user.role : 'GUEST'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl space-y-1">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Hackathon Judge Role Switcher
            </p>
            <p className="text-[10px] text-slate-600 dark:text-slate-400">Switch roles instantly to test permissions.</p>
          </div>

          {DEMO_ACCOUNTS.map((acc) => {
            const AccIcon = acc.icon;
            const isSelected = user?.role === acc.role;
            const isLoading = loadingRole === acc.role;

            return (
              <button
                key={acc.role}
                onClick={() => handleSwitchRole(acc)}
                disabled={isLoading}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-white'
                    : 'hover:bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${acc.badgeColor}`}>
                    <AccIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{acc.label}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">{acc.name}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${acc.badgeColor}`}>
                  {isLoading ? '...' : acc.role}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

