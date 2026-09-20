'use client';

import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { UserNavHeader } from '@/components/layout/UserNavHeader';
import {
  Recycle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Eye,
  Users,
  Trophy,
  Activity,
  Layers,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-16">
        
        {/* Top Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-wider uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>ENVIRONMENTAL RECOVERY MOVEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            THE PROBLEM WAS NEVER <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              JUST TRASH.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The real problem is the cycle. Trash appears. People clean it. And eventually, it returns.
          </p>

          {/* Centered Pill Banner matching Image 1 */}
          <div className="pt-2">
            <span className="inline-block px-6 py-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20 border border-emerald-400/40">
              TRASHTAG EXISTS TO BREAK THAT CYCLE.
            </span>
          </div>
        </section>

        {/* Side-by-Side Comparison Cards (Image 1 Implementation) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Left Card: Traditional Broken Loop */}
          <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:border-red-300 dark:hover:border-red-800">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/60 pb-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-sm uppercase tracking-wide">
                  <RotateCcw className="w-5 h-5 text-red-500" />
                  <span>TRADITIONAL BROKEN LOOP</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-[10px] font-mono font-bold uppercase border border-red-300 dark:border-red-800">
                  NEVER STOPS
                </span>
              </div>

              {/* 3 Step Boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-red-200 dark:border-red-900/60 p-3.5 rounded-2xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-red-500">01</span>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-1">DUMPING</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-red-200 dark:border-red-900/60 p-3.5 rounded-2xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-red-500">02</span>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-1">CLEANUP</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-red-200 dark:border-red-900/60 p-3.5 rounded-2xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-red-500">03</span>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-1">REPEAT</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Treats symptoms instead of root causes. Without ongoing protection and surveillance, volunteer effort is lost.</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Cleaned locations frequently revert back into illegal dumping grounds within 30 to 60 days due to lack of verification and accountability.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-red-200/60 dark:border-red-900/40 text-[11px] text-red-700 dark:text-red-400 font-mono font-semibold">
              ⚠️ Result: Infinite volunteer burnout and recurring waste hotspots.
            </div>
          </div>

          {/* Right Card: The TrashTag Solution */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:border-emerald-300 dark:hover:border-emerald-800">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/60 pb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>THE TRASHTAG SOLUTION</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-300 dark:border-emerald-800">
                  VERIFIED RECOVERY
                </span>
              </div>

              {/* 6 Step Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">01</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">REPORT</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">02</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">CONNECT</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">03</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">CLEAN</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">04</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">MONITOR</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">05</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">RECOVER</span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] font-mono font-bold text-emerald-500">06</span>
                  <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 uppercase tracking-wider block mt-0.5">TRANSFORM</span>
                </div>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Combines AI reporting, community missions, 90-day biweekly surveillance, and physical transformation into an unbroken loop.</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Guarantees that once a site is cleaned, field verifiers and community stewards audit it regularly until it achieves permanent zero-dumping recovery.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
              ✅ Result: Sustained recovery, community gardens, and permanent waste prevention.
            </div>
          </div>

        </section>

        {/* 4 Pillars Section */}
        <section className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The Four Pillars of TrashTag Recovery
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
              How our platform turns reported waste into verified green community transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">1. Tag & AI Severity</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Citizens capture waste photos with exact GPS tags. AI models instantly analyze severity, volume, and contamination risks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">2. Mobilize Missions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                NSS volunteers, community groups, and local municipal teams team up to launch organized cleanup missions with designated equipment.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">3. 90-Day Surveillance</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Field verifiers perform mandatory biweekly audits at 30, 60, and 90-day intervals to verify that dumping does not return.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">4. Gamified Impact</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every verified contribution earns impact points, community rank, badges, and verified proof-of-recovery chain links.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Break the Cycle in Your Community?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Join hundreds of volunteers, students, and environmental stewards converting waste hotspots into thriving recovered green spaces.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/report"
                className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Tag a Trash Hotspot</span>
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3 bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-extrabold rounded-2xl text-sm border border-emerald-400/40 transition-all flex items-center gap-2"
              >
                <span>Explore Recovery Map</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

