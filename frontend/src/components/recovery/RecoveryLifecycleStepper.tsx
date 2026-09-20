'use client';

import React from 'react';
import { RecoveryStatus } from '@/types/trashtag';
import { CheckCircle2, Circle, AlertCircle, PlayCircle, ShieldCheck, Sparkles, Eye, RefreshCw, ChevronRight } from 'lucide-react';

interface RecoveryLifecycleStepperProps {
  currentStatus: RecoveryStatus;
}

interface StepItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  stepNumber: number;
}

const STEPS: StepItem[] = [
  { id: 'REPORTED', name: 'Reported', description: 'Hotspot tagged & logged', icon: <AlertCircle className="w-4 h-4" />, stepNumber: 1 },
  { id: 'VERIFIED', name: 'Verified', description: 'Verifier confirmed site', icon: <ShieldCheck className="w-4 h-4" />, stepNumber: 2 },
  { id: 'MISSION_ACTIVE', name: 'Mission Active', description: 'Cleanup team deployed', icon: <PlayCircle className="w-4 h-4" />, stepNumber: 3 },
  { id: 'CLEANUP_COMPLETED', name: 'Cleanup Completed', description: 'Waste collected & logged', icon: <CheckCircle2 className="w-4 h-4" />, stepNumber: 4 },
  { id: 'RECOVERY_VERIFIED', name: 'Recovery Verified', description: 'Before/after weight verified', icon: <ShieldCheck className="w-4 h-4" />, stepNumber: 5 },
  { id: 'TRANSFORMATION_PLANNED', name: 'Prevention Plan', description: 'Strategy & garden planned', icon: <Sparkles className="w-4 h-4" />, stepNumber: 6 },
  { id: 'TRANSFORMED', name: 'Transformed', description: 'Site repurposed into garden', icon: <Sparkles className="w-4 h-4" />, stepNumber: 7 },
  { id: 'MONITORING', name: 'Monitoring', description: '30/60/90-day surveillance', icon: <Eye className="w-4 h-4" />, stepNumber: 8 },
];

export const getStepNumberFromStatus = (status: RecoveryStatus): number => {
  switch (status) {
    case 'REPORTED': return 1;
    case 'VERIFIED': return 2;
    case 'MISSION_CREATED':
    case 'MISSION_ACTIVE': return 3;
    case 'CLEANUP_COMPLETED': return 4;
    case 'RECOVERY_VERIFIED': return 5;
    case 'TRANSFORMATION_PLANNED': return 6;
    case 'TRANSFORMED': return 7;
    case 'MONITORING':
    case 'SUSTAINED':
    case 'REOPENED': return 8;
    default: return 1;
  }
};

export const RecoveryLifecycleStepper: React.FC<RecoveryLifecycleStepperProps> = ({ currentStatus }) => {
  const activeStepNumber = getStepNumberFromStatus(currentStatus);
  const isReopened = currentStatus === 'REOPENED';
  const isSustained = currentStatus === 'SUSTAINED';

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Environmental Recovery Lifecycle</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
              Stage {activeStepNumber} of 8
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Dynamic end-to-end recovery tracking derived from live backend state
          </p>
        </div>

        {/* Current State Highlight Badge */}
        <div className="self-start sm:self-auto">
          {isReopened ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse shadow-lg shadow-rose-500/10">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>HOTSPOT REOPENED</span>
            </div>
          ) : isSustained ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>90-DAY SUSTAINED RECOVERY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-lg shadow-emerald-500/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>CURRENT STATE: {currentStatus.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Stepper (Desktop) */}
      <div className="hidden lg:block relative py-4">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
        {/* Progress Fill Line */}
        <div
          className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
          style={{ width: `${((activeStepNumber - 1) / (STEPS.length - 1)) * 95}%` }}
        ></div>

        <div className="grid grid-cols-8 relative z-10 text-center">
          {STEPS.map((step) => {
            const isPassed = step.stepNumber < activeStepNumber;
            const isCurrent = step.stepNumber === activeStepNumber;
            const isFuture = step.stepNumber > activeStepNumber;

            return (
              <div key={step.id} className="flex flex-col items-center group cursor-default">
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isPassed
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-900 text-emerald-400 border-2 border-emerald-400 ring-8 ring-emerald-500/20 scale-110 shadow-xl shadow-emerald-500/40'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : step.stepNumber}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-3 text-xs font-semibold tracking-wide transition-colors ${
                    isCurrent
                      ? 'text-emerald-400 font-bold scale-105'
                      : isPassed
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>

                {/* Status pill under step */}
                {isCurrent && (
                  <span className="mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Stepper (Mobile & Tablet) */}
      <div className="lg:hidden space-y-3">
        {STEPS.map((step) => {
          const isPassed = step.stepNumber < activeStepNumber;
          const isCurrent = step.stepNumber === activeStepNumber;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : isPassed
                  ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isPassed
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/40 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isPassed ? '✓' : step.stepNumber}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{step.name}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>
              </div>

              {isCurrent && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

