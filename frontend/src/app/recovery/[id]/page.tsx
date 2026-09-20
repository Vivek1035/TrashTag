'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrashTag } from '@/types/trashtag';
import {
  fetchTrashTagById,
  fetchTrashTagTimeline,
  fetchMissions,
  fetchMonitoringDashboardApi,
  TimelineEvent,
  Mission,
  MonitoringCheckpointDTO,
} from '@/services/api';
import { RecoveryLifecycleStepper } from '@/components/recovery/RecoveryLifecycleStepper';
import { NextActionCallout } from '@/components/recovery/NextActionCallout';
import { useAuth } from '@/context/AuthContext';
import { BeforeAfterViewer } from '@/components/recovery/BeforeAfterViewer';
import { TimelineStream } from '@/components/recovery/TimelineStream';
import { AIClassificationCard } from '@/components/ai/AIClassificationCard';
import { AIPreventionCard } from '@/components/ai/AIPreventionCard';
import { MapViewWrapper } from '@/components/map/MapViewWrapper';
import { DemoModeControlPanel } from '@/components/demo/DemoModeControlPanel';

import {
  MapPin,
  ArrowLeft,
  ShieldAlert,
  Weight,
  User,
  Calendar,
  Sparkles,
  Share2,
  Check,
  PlayCircle,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function RecoveryDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'TT-D01';
  const { token } = useAuth();

  const [tag, setTag] = useState<TrashTag | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [checkpoints, setCheckpoints] = useState<MonitoringCheckpointDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = async (showLoading: boolean = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchTrashTagById(id);
      setTag(data);

      const events = await fetchTrashTagTimeline(id);
      setTimeline(events);

      const allMissions = await fetchMissions();
      const tagMissions = allMissions.filter(
        (m) => m.trashTagId === data.id || m.trashTagCode === data.tagCode
      );
      setMissions(tagMissions);

      const monitoringData = await fetchMonitoringDashboardApi({}, token || undefined);
      if (monitoringData && monitoringData.checkpoints) {
        const tagCps = monitoringData.checkpoints.filter((cp) => cp.trashTagId === data.id);
        setCheckpoints(tagCps);
      }
    } catch (err) {
      console.error('Failed to load TrashTag recovery details:', err);
    } finally {
      if (showLoading) setLoading(false);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 gap-3">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-sm font-semibold animate-pulse text-emerald-400">
          Loading Hotspot Lifecycle...
        </span>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 gap-4 p-4">
        <h2 className="text-xl font-bold text-red-400">TrashTag Hotspot Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">The requested TrashTag ID or code could not be located.</p>
        <Link
          href="/explore"
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold"
        >
          Return to Explore Map
        </Link>
      </div>
    );
  }

  const activeMission = missions.length > 0 ? missions[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Metadata Hero Section */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                  #{tag.tagCode}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
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
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
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
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {tag.description}
            </p>
          )}

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-amber-400" /> Estimated Waste
              </span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {tag.estimatedWeightKg ? `${tag.estimatedWeightKg} kg` : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Recovered Waste
              </span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {tag.recoveredWeightKg
                  ? `${tag.recoveredWeightKg} kg`
                  : tag.status === 'RECOVERY_VERIFIED' || tag.status === 'TRANSFORMED' || tag.status === 'SUSTAINED'
                  ? `${tag.estimatedWeightKg || 0} kg`
                  : 'Pending'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Days Active
              </span>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {Math.max(1, Math.floor((Date.now() - new Date(tag.reportedAt).getTime()) / (1000 * 3600 * 24)))} d
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Status
              </span>
              <p className="text-sm font-bold font-mono text-purple-300 truncate">
                {tag.status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* 🌟 RECOVERY LIFECYCLE STEPPER */}
        <RecoveryLifecycleStepper currentStatus={tag.status} />

        {/* 🎮 HACKATHON DEMO MODE CONTROL PANEL */}
        <DemoModeControlPanel tagId={tag.id} currentStatus={tag.status} onStatusUpdated={loadData} />

        {/* DYNAMIC NEXT ACTION CALLOUT */}
        <NextActionCallout tag={tag} onStatusUpdated={loadData} />

        {/* Two-Column Grid Layout */}
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
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <MapPin className="w-4 h-4 text-emerald-400" /> Hotspot Coordinates & Location
              </h3>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                <MapViewWrapper
                  tags={[tag]}
                  selectedTag={tag}
                  onSelectTag={() => {}}
                />
              </div>
            </div>

            {/* AI Classification & Hazard Analysis Card */}
            <AIClassificationCard tag={tag} token={token} onTagUpdated={(updated) => setTag(updated)} />

            {/* AI Prevention & Long-term Strategy Card */}
            <AIPreventionCard tag={tag} token={token} />
          </div>

          {/* Right Column (1 Col) - Mission & Audit Status */}
          <div className="space-y-6">
            {/* Active Cleanup Mission widget */}
            {activeMission ? (
              <div className="bg-white dark:bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                    Linked Cleanup Mission
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    {activeMission.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {activeMission.title}
                </h4>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p>📅 {new Date(activeMission.scheduledDate).toLocaleDateString()}</p>
                  <p>👥 {activeMission.currentParticipantsCount || 0} / {activeMission.maxParticipants} Volunteers Joined</p>
                  {activeMission.meetingPoint && <p>📍 {activeMission.meetingPoint}</p>}
                </div>

                <Link
                  href={`/missions/${activeMission.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-950/30"
                >
                  <span>Open Mission Operations</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-center">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Mission Organized Yet</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Organize a community cleanup mission to mobilize volunteers for this hotspot.
                </p>
                <Link
                  href="/explore"
                  className="inline-block text-xs font-bold text-emerald-400 hover:underline"
                >
                  Launch Mission via Explore Map →
                </Link>
              </div>
            )}

            {/* 90-Day Monitoring Audits Widget */}
            {checkpoints.length > 0 && (
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> 90-Day Recurrence Inspector
                  </h4>
                </div>

                <div className="space-y-2">
                  {[30, 60, 90].map((days) => {
                    const cp = checkpoints.find((c) => c.checkpointDays === days);
                    const isCompleted = cp?.status === 'PASSED' || cp?.status === 'COMPLETED';

                    return (
                      <div
                        key={days}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : cp?.status === 'OVERDUE' ? (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-500" />
                          )}
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{days}-Day Monitoring Audit</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">
                              {cp?.scheduledDate ? new Date(cp.scheduledDate).toLocaleDateString() : 'Scheduled'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {cp ? cp.status : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/monitoring"
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 rounded-xl font-semibold transition-colors border border-emerald-500/20"
                >
                  <span>Open Monitoring Inspector</span>
                </Link>
              </div>
            )}

            {/* Timeline Stream */}
            <TimelineStream events={timeline} />
          </div>
        </div>
      </main>
    </div>
  );
}
