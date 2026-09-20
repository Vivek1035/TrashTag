'use client';

import React, { useState } from 'react';
import { TrashTag } from '@/types/trashtag';
import { getPreventionRecommendationsApi, PreventionResponse, PreventionStrategy } from '@/services/api';
import {
  ShieldCheck,
  Sparkles,
  Bot,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Wrench,
  CheckCircle2,
  Lock,
  LogIn,
} from 'lucide-react';

interface AIPreventionCardProps {
  tag: TrashTag;
  token: string | null;
}

export const AIPreventionCard: React.FC<AIPreventionCardProps> = ({ tag, token }) => {
  const [prevention, setPrevention] = useState<PreventionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isVerifiedOrLater =
    tag.status === 'RECOVERY_VERIFIED' ||
    tag.status === 'TRANSFORMATION_PLANNED' ||
    tag.status === 'TRANSFORMED' ||
    tag.status === 'MONITORING' ||
    tag.status === 'SUSTAINED';

  const handleFetchPrevention = async () => {
    let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('trashtag_token') : null);
    if (!activeToken) {
      activeToken = 'demo-jwt-token-user';
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPreventionRecommendationsApi(tag.id, activeToken);
      setPrevention(data);
    } catch (err: any) {
      console.error('Prevention strategy error:', err);
      if (err.message && err.message.includes('Authentication required')) {
        setError('Authentication Required: Please log in or select a Demo Role from the top menu.');
      } else {
        setError(err.message || 'Failed to generate AI prevention strategies');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              AI Prevention Recommendations
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Post-Recovery Strategy
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Contextual anti-dumping intervention strategies</p>
          </div>
        </div>

        {isVerifiedOrLater && (
          <button
            onClick={handleFetchPrevention}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            {prevention ? 'Refresh Strategies' : 'Generate Strategies'}
          </button>
        )}
      </div>

      {/* Required Disclaimer Pill */}
      <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">
            {prevention?.disclaimer || 'AI-generated recommendation'}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-bold">Protocol</span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>{error}</span>
          {!token && (
            <button
              onClick={() => {
                const demoUser = {
                  id: 'demo-uuid-user',
                  name: 'Anika Rao',
                  email: 'anika.rao@trashtag.dev',
                  role: 'USER' as const,
                };
                localStorage.setItem('trashtag_token', 'demo-jwt-token-user');
                localStorage.setItem('trashtag_user', JSON.stringify(demoUser));
                window.location.reload();
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs whitespace-nowrap shadow-md flex items-center gap-1 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Use Demo Scout Session</span>
            </button>
          )}
        </div>
      )}

      {/* Main Body */}
      {!isVerifiedOrLater ? (
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed p-6 text-center text-slate-600 dark:text-slate-400 text-xs space-y-2">
          <Lock className="w-8 h-8 text-amber-400/60 mx-auto" />
          <p className="font-bold text-slate-800 dark:text-slate-200">Locked: Requires RECOVERY_VERIFIED Status</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            AI prevention strategies unlock after the site has been cleaned and recovery verification is approved by a verifier or admin.
          </p>
        </div>
      ) : prevention ? (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 gap-3.5">
            {prevention.strategies.map((strategy: PreventionStrategy, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 hover:border-slate-300 dark:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    {strategy.name}
                  </h4>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Cost: {strategy.costCategory}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-purple-400" /> Impact: {strategy.expectedImpact}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{strategy.reason}</p>

                <div className="bg-slate-100/80 dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-emerald-300 block mb-0.5">Implementation Notes:</span>
                  {strategy.implementationNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed p-6 text-center text-slate-600 dark:text-slate-400 text-xs space-y-2">
          <Bot className="w-8 h-8 text-emerald-400/60 mx-auto animate-pulse" />
          <p className="font-medium text-slate-700 dark:text-slate-300">Click "Generate Strategies" to run AI site analysis</p>
          <p className="text-[11px] text-slate-500">Evaluates waste type, location history, and site context to recommend 3 prevention plans</p>
        </div>
      )}
    </div>
  );
};
