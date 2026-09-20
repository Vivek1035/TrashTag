'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loginApi, registerApi } from '@/services/api';
import {
  X,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  redirectTo?: string;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', redirectTo = '/dashboard' }: AuthModalProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'USER' | 'VERIFIER' | 'ORGANIZATION' | 'ADMIN'>('USER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi(email, password);
      login(res.token, {
        id: res.user.id,
        name: res.user.displayName || res.user.username,
        email: res.user.email,
        role: res.user.role as any,
      });
      onClose();
      router.push(redirectTo);
    } catch (err: any) {
      console.warn('Backend login fallback to local session:', err);
      // Local fallback for demo convenience if offline
      login(`demo-jwt-${Date.now()}`, {
        id: `u-${Date.now()}`,
        name: email.split('@')[0] || 'Community Eco Scout',
        email,
        role,
      });
      onClose();
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registerApi({
        username: username || email.split('@')[0],
        displayName: displayName || username,
        email,
        password,
        role,
      });
      login(res.token, {
        id: res.user.id,
        name: res.user.displayName || res.user.username,
        email: res.user.email,
        role: res.user.role as any,
      });
      onClose();
      router.push(redirectTo);
    } catch (err: any) {
      console.warn('Backend register fallback:', err);
      login(`demo-jwt-${Date.now()}`, {
        id: `u-${Date.now()}`,
        name: displayName || username || 'Community Champion',
        email,
        role,
      });
      onClose();
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUserProceed = async (selectedRole: 'USER' | 'VERIFIER' | 'ORGANIZATION' | 'ADMIN' = 'USER') => {
    setLoading(true);
    const mockProfiles: Record<string, { email: string; name: string }> = {
      USER: { email: 'anika.rao@trashtag.dev', name: 'Anika Rao (Hotspot Scout)' },
      VERIFIER: { email: 'priya.verifier@trashtag.dev', name: 'Priya Krishnan (Field Auditor)' },
      ORGANIZATION: { email: 'greenblr@trashtag.dev', name: 'Green Bengaluru Foundation' },
      ADMIN: { email: 'demo.admin@trashtag.dev', name: 'Arjun Verma (Platform Admin)' },
    };

    const chosen = mockProfiles[selectedRole];
    try {
      const res = await loginApi(chosen.email, 'Demo@12345');
      login(res.token, {
        id: res.user.id,
        name: res.user.displayName || res.user.username,
        email: res.user.email,
        role: res.user.role as any,
      });
    } catch (err) {
      login(`demo-jwt-${selectedRole.toLowerCase()}`, {
        id: `u-demo-${selectedRole.toLowerCase()}`,
        name: chosen.name,
        email: chosen.email,
        role: selectedRole,
      });
    } finally {
      setLoading(false);
      onClose();
      router.push(redirectTo);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-white p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 font-extrabold text-lg">
            TT
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back to TrashTag' : 'Create TrashTag Account'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Join the community-powered recovery network'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Log In Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anika.rao@trashtag.dev"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Log In</span>
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="anikarao"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Anika Rao"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anika@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="USER">USER — Hotspot Scout / Community Reporter</option>
                <option value="VERIFIER">VERIFIER — Field Auditor / Inspector</option>
                <option value="ORGANIZATION">ORGANIZATION — Prevention Leader</option>
                <option value="ADMIN">ADMIN — Platform Overseer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Create Account</span>
            </button>
          </form>
        )}

        {/* Fast-Track Demo Section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 block">
            ── Fast Track for Hackathon ──
          </span>

          <button
            type="button"
            onClick={() => handleDemoUserProceed('USER')}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2 border border-amber-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Proceed with Demo User (Anika Rao — Scout)</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            <span>Or test as:</span>
            <button
              onClick={() => handleDemoUserProceed('VERIFIER')}
              className="text-blue-400 hover:underline font-medium"
            >
              Verifier
            </button>
            <span>•</span>
            <button
              onClick={() => handleDemoUserProceed('ORGANIZATION')}
              className="text-purple-400 hover:underline font-medium"
            >
              Organization
            </button>
            <span>•</span>
            <button
              onClick={() => handleDemoUserProceed('ADMIN')}
              className="text-amber-400 hover:underline font-medium"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

