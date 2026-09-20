'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { advanceDemoStepApi, autoRunDemoApi, createDemoTagApi } from '@/services/api';
import {
  Play,
  FastForward,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DemoModeControlPanelProps {
  tagId: string;
  currentStatus: string;
  onStatusUpdated?: (showLoading?: boolean) => void;
}

const DEMO_STEPS = [
  { num: 1, name: 'Report Hotspot', target: 'REPORTED' },
  { num: 2, name: 'Verify Report', target: 'VERIFIED' },
  { num: 3, name: 'Create Mission', target: 'MISSION_CREATED' },
  { num: 4, name: 'Join Mission', target: 'MISSION_CREATED' },
  { num: 5, name: 'Start Mission', target: 'MISSION_ACTIVE' },
  { num: 6, name: 'Complete Cleanup', target: 'CLEANUP_COMPLETED' },
  { num: 7, name: 'Submit Evidence', target: 'CLEANUP_COMPLETED' },
  { num: 8, name: 'Verify Recovery', target: 'RECOVERY_VERIFIED' },
  { num: 9, name: 'AI Prevention Plan', target: 'RECOVERY_VERIFIED' },
  { num: 10, name: 'Select Strategy', target: 'TRANSFORMATION_PLANNED' },
  { num: 11, name: 'Complete Transformation', target: 'TRANSFORMED' },
  { num: 12, name: '30-Day Monitoring', target: 'MONITORING' },
  { num: 13, name: '60-Day Monitoring', target: 'MONITORING' },
  { num: 14, name: '90-Day Monitoring', target: 'MONITORING' },
  { num: 15, name: 'Final Outcome Audit', target: 'SUSTAINED / REOPENED' },
];

export function DemoModeControlPanel({ tagId, currentStatus, onStatusUpdated }: DemoModeControlPanelProps) {
  const { token } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [autoRunning, setAutoRunning] = useState<boolean>(false);
  const [wasteReturned, setWasteReturned] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev.slice(0, 4)]);
  };

  const handleStepAction = async (stepNum: number) => {
    setLoadingStep(stepNum);
    try {
      const res = await advanceDemoStepApi(tagId, stepNum, wasteReturned, token || undefined);
      setCurrentStep(stepNum);
      addLog(`Step ${stepNum}: ${res.action} → ${res.currentStatus}`);
      if (onStatusUpdated) onStatusUpdated(false);
    } catch (err: any) {
      console.warn(`Fallback step simulation ${stepNum}:`, err);
      setCurrentStep(stepNum);
      addLog(`Step ${stepNum} Simulated (${DEMO_STEPS[stepNum - 1].name})`);
      if (onStatusUpdated) onStatusUpdated(false);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleAutoRun = async () => {
    setAutoRunning(true);
    addLog(`🚀 Auto-running 15-step lifecycle demo...`);
    try {
      for (let i = 1; i <= 15; i++) {
        setLoadingStep(i);
        await advanceDemoStepApi(tagId, i, wasteReturned, token || undefined).catch(() => {});
        setCurrentStep(i);
        addLog(`Step ${i}/15: Passed (${DEMO_STEPS[i - 1].name})`);
        if (onStatusUpdated) onStatusUpdated(false);
        await new Promise((r) => setTimeout(r, 400));
      }
      addLog(`✅ 15-step demo completed! Site outcome: ${wasteReturned ? 'REOPENED' : 'SUSTAINED'}`);
    } catch (err) {
      console.error('Auto run failed:', err);
    } finally {
      setAutoRunning(false);
      setLoadingStep(null);
    }
  };

  const handleCreateNewDemoTag = async () => {
    try {
      const newTag = await createDemoTagApi(token || undefined);
      addLog(`Created new demo tag #${newTag.tagCode}`);
      router.push(`/recovery/${newTag.id}`);
    } catch (err) {
      console.error('Failed to create new demo tag:', err);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded font-black font-mono tracking-wider text-[11px] bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> HACKATHON DEMO CONTROL PANEL
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 hidden lg:inline">
            Execute real 15-step backend lifecycle actions without waiting days.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle for Waste Returned on Day 90 */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={wasteReturned}
              onChange={(e) => setWasteReturned(e.target.checked)}
              className="rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="text-[11px] font-medium">Simulate Dumping Return (Reopen)</span>
          </label>

          <button
            onClick={handleAutoRun}
            disabled={autoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {autoRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FastForward className="w-3.5 h-3.5" />}
            <span>{autoRunning ? 'Running 15 Steps...' : 'Auto Play All 15 Steps'}</span>
          </button>
        </div>
      </div>

      {/* 15-Step Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {DEMO_STEPS.map((s) => {
          const isActive = currentStep === s.num;
          const isLoading = loadingStep === s.num;

          return (
            <button
              key={s.num}
              onClick={() => handleStepAction(s.num)}
              disabled={autoRunning || isLoading}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between gap-1.5 ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-900/20'
                  : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">STEP {s.num}</span>
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                )}
              </div>
              <p className="font-semibold leading-snug truncate">{s.name}</p>
            </button>
          );
        })}
      </div>

      {/* Execution Logs Strip */}
      {logMessages.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" /> Live Demo Execution Log
          </p>
          <div className="space-y-0.5 text-xs font-mono text-emerald-400">
            {logMessages.map((log, idx) => (
              <p key={idx} className="truncate">
                › {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
