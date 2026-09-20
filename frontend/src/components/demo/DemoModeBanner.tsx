'use client';

import React from 'react';
import { Sparkles, Zap, ShieldAlert, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export function DemoModeBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-600/90 via-emerald-600/90 to-blue-600/90 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-lg border-b border-amber-500/30 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="bg-black/30 border border-white/20 px-2 py-0.5 rounded font-black font-mono tracking-wider text-[11px] text-amber-300 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> DEMO MODE
        </span>
        <span className="hidden md:inline text-slate-900 dark:text-slate-100">
          Development-only hackathon simulator active. Real state machine & event logging enabled.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/recovery/TT-D01"
          className="bg-black/40 hover:bg-black/60 text-white font-bold px-3 py-1 rounded-lg border border-white/30 text-[11px] flex items-center gap-1.5 transition-colors"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />
          <span>Launch 15-Step Simulator</span>
        </Link>
      </div>
    </div>
  );
}

