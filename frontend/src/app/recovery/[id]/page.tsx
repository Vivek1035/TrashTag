'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TrashTag } from '@/types/trashtag';
import { fetchTrashTagById, fetchTrashTagTimeline, TimelineEvent } from '@/services/api';
import { RecoveryLifecycleStepper } from '@/components/recovery/RecoveryLifecycleStepper';
import { NextActionCallout } from '@/components/recovery/NextActionCallout';
import { useAuth } from '@/context/AuthContext';
import { BeforeAfterViewer } from '@/components/recovery/BeforeAfterViewer';
import { TimelineStream } from '@/components/recovery/TimelineStream';
import { AIClassificationCard } from '@/components/ai/AIClassificationCard';
import { AIPreventionCard } from '@/components/ai/AIPreventionCard';
import { MapViewWrapper } from '@/components/map/MapViewWrapper';


import {
  MapPin,
  Tag,
  ArrowLeft,
  ShieldAlert,
  Weight,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  Share2,
  Check,
  PlayCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function RecoveryDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'tt-1001-uuid';
  const { token } = useAuth();

  const [tag, setTag] = useState<TrashTag | null>(null);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTrashTagById(id);
      setTag(data);
      const events = await fetchTrashTagTimeline(id);
      setTimeline(events);
    } catch (err) {
      console.error('Failed to load TrashTag recovery details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleCopyTagCode = () => {
    if (tag?.tagCode) {
      navigator.clipboard.writeText(tag.tagCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold animate-pulse text-emerald-400">
          Loading Recovery Lifecycle...
        </span>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4 p-4">
        <h2 className="text-xl font-bold text-red-400">TrashTag Hotspot Not Found</h2>
        <p className="text-xs text-slate-400">The requested TrashTag ID or code could not be located.</p>
        <Link
          href="/explore"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
        >
          Return to Explore Map
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Map</span>
          </Link>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
              #{tag.tagCode}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-xs">
              {tag.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTagCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code!' : 'Share Tag'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Metadata Hero Section */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                  #{tag.tagCode}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> Reported by {tag.reporterName || 'Anonymous'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(tag.reportedAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {tag.title}
              </h1>

              {tag.address && (
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{tag.address}</span>
                  <span className="text-slate-600">({tag.latitude.toFixed(4)}, {tag.longitude.toFixed(4)})</span>
                </p>
              )}
            </div>

            {/* Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {tag.severity} SEVERITY
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                {tag.wasteType}
              </span>
            </div>
          </div>

          {/* Description */}
          {tag.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              {tag.description}
            </p>
          )}

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-amber-400" /> Estimated Waste
              </span>
              <p className="text-lg font-bold font-mono text-slate-100">
                {tag.estimatedWeightKg ? `${tag.estimatedWeightKg} kg` : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Recovered Waste
              </span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {tag.status === 'RECOVERY_VERIFIED' || tag.status === 'TRANSFORMED' || tag.status === 'SUSTAINED'
                  ? `${tag.estimatedWeightKg || 0} kg`
                  : 'Pending'}
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Days Active
              </span>
              <p className="text-lg font-bold font-mono text-slate-100">
                {Math.max(1, Math.floor((Date.now() - new Date(tag.reportedAt).getTime()) / (1000 * 3600 * 24)))} d
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Status
              </span>
              <p className="text-sm font-bold font-mono text-purple-300 truncate">
                {tag.status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* 🌟 RECOVERY LIFECYCLE STEPPER (Strong Visual Component) */}
        <RecoveryLifecycleStepper currentStatus={tag.status} />

        {/* DYNAMIC NEXT ACTION CALLOUT */}
        <NextActionCallout tag={tag} onStatusUpdated={loadData} />

        {/* Two-Column Grid: Left (Before/After & Map) | Right (Timeline & Missions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Before / After Photo Comparison */}
            <BeforeAfterViewer
              beforeImageUrl={tag.primaryImageUrl}
              afterImageUrl={
                tag.status === 'TRANSFORMED' || tag.status === 'SUSTAINED'
                  ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
                  : undefined
              }
              title={tag.title}
            />

            {/* Hotspot Location Map Container */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden p-4 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Geospatial Coordinates</span>
              </h3>
              <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800">
                <MapViewWrapper tags={[tag]} selectedTag={tag} onSelectTag={() => {}} />
              </div>
            </div>

            {/* AI Analysis & Prevention Hub */}
            <AIClassificationCard tag={tag} token={token} onTagUpdated={setTag} />
            <AIPreventionCard tag={tag} token={token} />
          </div>


          {/* Right Column (1 Col): Mission Info & Timeline */}
          <div className="space-y-6">
            {/* Mission Information Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Cleanup Mission Status</span>
              </h3>

              {tag.status === 'REPORTED' || tag.status === 'VERIFIED' ? (
                <div className="text-center py-6 bg-slate-950/60 rounded-xl border border-slate-800 border-dashed space-y-2 p-4">
                  <PlayCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">No Active Mission Yet</p>
                  <p className="text-[11px] text-slate-500">
                    A cleanup mission will be scheduled once the hotspot is verified.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Mission #M-102</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Operation River Cleanup</h4>
                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <p>📅 Scheduled: Oct 14, 2026</p>
                    <p>👥 Volunteers: 14 / 25 Joined</p>
                    <p>📍 Meeting Point: Main River Dock</p>
                  </div>
                  <Link
                    href={`/missions/${tag.id}/field`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                  >
                    <span>View Mission Field Dashboard</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Timeline Stream */}
            <TimelineStream events={timeline} />
          </div>
        </div>
      </main>
    </div>
  );
}
