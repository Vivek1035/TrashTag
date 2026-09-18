'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, DashboardResponse } from '@/services/api';
import {
  Award,
  FileText,
  Users,
  Recycle,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  CheckCircle2,
  Sparkles,
  Eye,
  PlusCircle,
  Layers,
  Activity,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardData(token || undefined);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-lg font-medium">Calculating TrashTag statistics from backend database...</p>
      </div>
    );
  }

  const { userStats, lifecycleBreakdown, impactOverview, upcomingMissions, monitoringPipeline, recentTimeline } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.name || 'Eco Champion'}</span>
            </h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              {user?.role || 'VOLUNTEER'}
            </span>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Authenticated TrashTag command center. All statistics calculated live from verified backend records.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/explore"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/40"
          >
            <PlusCircle className="w-4 h-4" />
            Report TrashTag
          </Link>
          <Link
            href="/missions"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-sm flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4 text-blue-400" />
            Missions
          </Link>
          <Link
            href="/leaderboard"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-sm flex items-center gap-2 transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            Leaderboard
          </Link>
        </div>
      </div>

      {/* 1. PERSONAL METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Environmental Score */}
        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Environmental Score</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{userStats.environmentalScore}</div>
          <div className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Derived from server ScoreEvents
          </div>
        </div>

        {/* My Reports */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Reports</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{userStats.myReportsCount}</div>
          <div className="text-xs text-slate-400 mt-1">Hotspots logged by you</div>
        </div>

        {/* My Missions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Missions</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{userStats.myMissionsCount}</div>
          <div className="text-xs text-slate-400 mt-1">Cleanups joined / led</div>
        </div>

        {/* Waste Recovered */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Waste Recovered</span>
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
              <Recycle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{userStats.myWasteRecoveredKg.toFixed(0)} <span className="text-lg text-purple-400">kg</span></div>
          <div className="text-xs text-slate-400 mt-1">Verified cleanup yield</div>
        </div>

        {/* Sites Recovered */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sites Recovered</span>
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{userStats.mySitesRecoveredCount}</div>
          <div className="text-xs text-slate-400 mt-1">Verified restored locations</div>
        </div>
      </div>

      {/* 2. RECOVERY LIFECYCLE VISUALIZATION */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> Live Recovery Lifecycle System
            </div>
            <h2 className="text-2xl font-bold text-white">
              {lifecycleBreakdown.totalActiveTrashTagsCount} Active TrashTags Across Lifecycle Stages
            </h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Calculated from backend status
          </span>
        </div>

        {/* Stage Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 text-center">
          {/* Awaiting Verification */}
          <Link
            href="/explore?status=REPORTED"
            className="p-3 bg-slate-950/70 border border-red-500/40 hover:border-red-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-red-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.awaitingVerificationCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Awaiting Verification
            </div>
            <div className="text-[10px] text-red-400/80 mt-1 uppercase font-mono">REPORTED</div>
          </Link>

          {/* Verified */}
          <Link
            href="/explore?status=VERIFIED"
            className="p-3 bg-slate-950/70 border border-amber-500/40 hover:border-amber-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-amber-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.verifiedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Verified
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 uppercase font-mono">VERIFIED</div>
          </Link>

          {/* Active Missions */}
          <Link
            href="/missions"
            className="p-3 bg-slate-950/70 border border-blue-500/40 hover:border-blue-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-blue-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.activeMissionsCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Active Missions
            </div>
            <div className="text-[10px] text-blue-400/80 mt-1 uppercase font-mono">IN PROGRESS</div>
          </Link>

          {/* Awaiting Recovery Verification */}
          <Link
            href="/explore?status=CLEANUP_COMPLETED"
            className="p-3 bg-slate-950/70 border border-indigo-500/40 hover:border-indigo-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-indigo-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.awaitingRecoveryVerificationCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Awaiting Recovery Verification
            </div>
            <div className="text-[10px] text-indigo-400/80 mt-1 uppercase font-mono">CLEANUP DONE</div>
          </Link>

          {/* Transformation Planned */}
          <Link
            href="/explore?status=TRANSFORMATION_PLANNED"
            className="p-3 bg-slate-950/70 border border-purple-500/40 hover:border-purple-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-purple-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.transformationPlannedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Transformation Planned
            </div>
            <div className="text-[10px] text-purple-400/80 mt-1 uppercase font-mono">PLANNING</div>
          </Link>

          {/* Transformed */}
          <Link
            href="/explore?status=TRANSFORMED"
            className="p-3 bg-slate-950/70 border border-teal-500/40 hover:border-teal-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-teal-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.transformedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Transformed
            </div>
            <div className="text-[10px] text-teal-400/80 mt-1 uppercase font-mono">TRANSFORMED</div>
          </Link>

          {/* In Monitoring */}
          <Link
            href="/monitoring"
            className="p-3 bg-slate-950/70 border border-emerald-500/40 hover:border-emerald-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-emerald-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.inMonitoringCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              In Monitoring
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 uppercase font-mono">AUDITING</div>
          </Link>

          {/* Reopened */}
          <Link
            href="/explore?status=REOPENED"
            className="p-3 bg-slate-950/70 border border-rose-500/40 hover:border-rose-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-rose-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.reopenedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Reopened
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1 uppercase font-mono">REOPENED</div>
          </Link>

          {/* Sustained */}
          <Link
            href="/explore?status=SUSTAINED"
            className="p-3 bg-slate-950/70 border border-cyan-500/40 hover:border-cyan-500 rounded-xl transition-all group"
          >
            <div className="text-2xl font-extrabold text-cyan-400 group-hover:scale-110 transition-transform">
              {lifecycleBreakdown.sustainedCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 mt-1 leading-tight">
              Sustained
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-1 uppercase font-mono">SUSTAINED</div>
          </Link>
        </div>
      </div>

      {/* 3. IMPACT OVERVIEW (COMMUNITY IMPACT vs DEMO DATA) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Verification Ledger</span>
            <h2 className="text-2xl font-bold text-white">Impact Overview</h2>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Strict isolation between verified community recovery and seeded demo data
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verified Community Environmental Impact */}
          <div className="lg:col-span-2 bg-slate-950/70 border border-emerald-500/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Verified Community Environmental Impact
              </h3>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                COMMUNITY DATA
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-black text-white">{impactOverview.userReportedCount}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">User Reported</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-black text-amber-300">{impactOverview.estimatedWasteKg.toFixed(0)} <span className="text-xs">kg</span></div>
                <div className="text-xs font-medium text-slate-400 mt-1">Estimated Waste</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">{impactOverview.verifiedWasteKg.toFixed(0)} <span className="text-xs">kg</span></div>
                <div className="text-xs font-medium text-slate-400 mt-1">Verified Recovered</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-center">
                <div className="text-2xl font-black text-cyan-400">{impactOverview.sitesRecoveredCount}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Sites Recovered</div>
              </div>
            </div>
          </div>

          {/* Seeded Demo Data Container */}
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                Seeded Demo Data
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md">
                EXCLUDED FROM REAL IMPACT
              </span>
            </div>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              Demonstration & mock test records are maintained separately for system testing and evaluation. Demo figures are strictly excluded from actual environmental impact.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
                <div className="text-lg font-bold text-amber-200">{impactOverview.demoData.demoReportsCount}</div>
                <div className="text-[10px] text-slate-400">Demo Reports</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
                <div className="text-lg font-bold text-amber-200">{impactOverview.demoData.demoEstimatedWasteKg} kg</div>
                <div className="text-[10px] text-slate-400">Demo Est. Waste</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
                <div className="text-lg font-bold text-amber-200">{impactOverview.demoData.demoVerifiedWasteKg} kg</div>
                <div className="text-[10px] text-slate-400">Demo Verified</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20">
                <div className="text-lg font-bold text-amber-200">{impactOverview.demoData.demoSitesRecoveredCount}</div>
                <div className="text-[10px] text-slate-400">Demo Sites</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOWER TWO-COLUMN GRID: UPCOMING MISSIONS & MONITORING PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Missions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Upcoming Cleanup Missions
            </h2>
            <Link href="/missions" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMissions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm bg-slate-950/50 rounded-xl border border-slate-800">
                No upcoming missions scheduled at present.
              </div>
            ) : (
              upcomingMissions.map((m) => (
                <div
                  key={m.id}
                  className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{m.trashTagCode || 'MISSION'}</span>
                      <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {m.meetingPoint || 'Site Meeting Location'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" /> {m.currentParticipantsCount} / {m.maxParticipants} Volunteers
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/field/${m.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      Field Mode
                    </Link>
                    <Link
                      href={`/missions/${m.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monitoring Pipeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Monitoring & Surveillance Pipeline
            </h2>
            <Link href="/monitoring" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
              View Audits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl">
              <div className="text-2xl font-bold text-amber-400">{monitoringPipeline.dueCheckpoints}</div>
              <div className="text-xs text-slate-400 mt-1">Due Audits</div>
            </div>
            <div className="p-3 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
              <div className="text-2xl font-bold text-emerald-400">{monitoringPipeline.completedCheckpoints}</div>
              <div className="text-xs text-slate-400 mt-1">Completed</div>
            </div>
            <div className="p-3 bg-slate-950/70 border border-rose-500/30 rounded-xl">
              <div className="text-2xl font-bold text-rose-400">{monitoringPipeline.overdueCheckpoints}</div>
              <div className="text-xs text-slate-400 mt-1">Overdue</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-white">Sustained vs. Reopened Sites</div>
              <div className="text-slate-400">
                {monitoringPipeline.sustainedSitesCount} sites clean after 90 days • {monitoringPipeline.reopenedSitesCount} sites reopened for cleanup
              </div>
            </div>
            <Link
              href="/monitoring"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-all"
            >
              Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Recent Global Activity Feed
          </h2>
          <Link href="/timeline" className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
            Full Timeline <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentTimeline.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm bg-slate-950/50 rounded-xl border border-slate-800">
              No recent timeline events recorded.
            </div>
          ) : (
            recentTimeline.slice(0, 5).map((ev) => (
              <div key={ev.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-emerald-400">{ev.eventType}</span>
                    <span className="text-[11px] text-slate-500">{new Date(ev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mt-0.5">{ev.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
