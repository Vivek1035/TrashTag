'use client';

import React from 'react';
import { ShieldAlert, AlertCircle, PlayCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const legendItems = [
    { label: 'Critical Severity', color: 'bg-red-500 border-red-300', icon: <ShieldAlert className="w-3.5 h-3.5 text-red-300" /> },
    { label: 'Reported Hotspot', color: 'bg-amber-500 border-amber-300', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-300" /> },
    { label: 'Mission Active', color: 'bg-blue-500 border-blue-300', icon: <PlayCircle className="w-3.5 h-3.5 text-blue-300" /> },
    { label: 'Recovery Verified', color: 'bg-emerald-500 border-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> },
    { label: 'Transformed', color: 'bg-purple-500 border-purple-300', icon: <Sparkles className="w-3.5 h-3.5 text-purple-300" /> },
    { label: 'Reopened Hotspot', color: 'bg-rose-500 border-rose-300', icon: <RefreshCw className="w-3.5 h-3.5 text-rose-300" /> },
  ];

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-lg text-xs space-y-2">
      <div className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
        Map Legend & Status Badges
      </div>
      <div className="grid grid-cols-2 gap-2">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className={`w-3 h-3 rounded-full ${item.color} border shadow-sm flex items-center justify-center`}></span>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

