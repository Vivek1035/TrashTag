'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserNavHeader } from '@/components/layout/UserNavHeader';
import {
  fetchMonitoringDashboardApi,
  completeMonitoringInspectionApi,
  MonitoringCheckpointDTO,
  MonitoringDashboardMetrics,
} from '@/services/api';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RotateCcw,
  Search,
  Filter,
  Camera,
  FileText,
  X,
  ExternalLink,
  Award,
  Sparkles,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

const DEMO_MONITORING_PRESETS = [
  {
    name: 'Pristine Clean Site',
    url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Restored Park Audit',
    url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Vegetation Growth',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dumping Returned',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  },
];

export default function MonitoringDashboardPage() {
  const { user, token } = useAuth();

  const evidenceFileInputRef = useRef<HTMLInputElement | null>(null);
  const evidenceCameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleEvidenceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [metrics, setMetrics] = useState<MonitoringDashboardMetrics>({
    dueCount: 0,
    completedCount: 0,
    overdueCount: 0,
    sustainedCount: 0,
    reopenedCount: 0,
  });
  const [checkpoints, setCheckpoints] = useState<MonitoringCheckpointDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(null); // null = ALL
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inspection Modal State
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<MonitoringCheckpointDTO | null>(null);
  const [wasteDetected, setWasteDetected] = useState<boolean>(false);
  const [evidenceImageUrl, setEvidenceImageUrl] = useState<string>('');
  const [inspectionNotes, setInspectionNotes] = useState<string>('');
  const [submittingInspection, setSubmittingInspection] = useState<boolean>(false);
  const [inspectionSuccess, setInspectionSuccess] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMonitoringDashboardApi(
        {
          checkpointDays: selectedDayFilter || undefined,
          status: selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined,
          search: searchQuery.trim() || undefined,
        },
        token || undefined
      );
      setMetrics(data.metrics);
      setCheckpoints(data.checkpoints);
    } catch (err: any) {
      console.error('Failed to load monitoring dashboard:', err);
      setError(err.message || 'Failed to load monitoring checkpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedDayFilter, selectedStatusFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDashboard();
  };

  const handleOpenInspectionModal = (cp: MonitoringCheckpointDTO) => {
    setSelectedCheckpoint(cp);
    setWasteDetected(false);
    setEvidenceImageUrl('');
    setInspectionNotes('');
    setInspectionSuccess(null);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckpoint || !token) {
      setError('Log in to submit inspection record.');
      return;
    }
    setSubmittingInspection(true);
    setError(null);
    setInspectionSuccess(null);
    try {
      const updated = await completeMonitoringInspectionApi(
        selectedCheckpoint.id,
        {
          wasteDetected,
          evidenceImageUrl: evidenceImageUrl.trim() || undefined,
          notes: inspectionNotes.trim() || (wasteDetected ? 'Dumping returned' : 'Clean inspection'),
        },
        token
      );

      if (wasteDetected) {
        setInspectionSuccess(`Inspection recorded: Waste dumping detected. Site status updated to REOPENED and eligible for a new recovery mission.`);
      } else if (selectedCheckpoint.checkpointDays === 90) {
        setInspectionSuccess(`Inspection recorded: 90-day clean audit passed! Site status advanced to SUSTAINED (+100 XP awarded).`);
      } else {
        setInspectionSuccess(`Inspection recorded: ${selectedCheckpoint.checkpointDays}-day clean audit saved.`);
      }

      setSelectedCheckpoint(null);
      await loadDashboard();
    } catch (err: any) {
      console.error('Inspection error:', err);
      setError(err.message || 'Failed to submit inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-16">

      <main className="max-w-7xl mx-auto px-4 mt-6 space-y-6">
        {/* Success Banner */}
        {inspectionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Inspection Saved</h4>
                <p className="text-xs text-emerald-300/80">{inspectionSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Monitoring Error</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* KPI METRICS SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Due</span>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">{metrics.dueCount}</p>
            <span className="text-[10px] text-slate-500">Scheduled pending audits</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Completed</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.completedCount}</p>
            <span className="text-[10px] text-slate-500">Clean inspections verified</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Overdue</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{metrics.overdueCount}</p>
            <span className="text-[10px] text-slate-500">Past scheduled date</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Sustained</span>
            <p className="text-2xl font-extrabold text-purple-400 font-mono">{metrics.sustainedCount}</p>
            <span className="text-[10px] text-slate-500">90-day clean certified</span>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Reopened</span>
            <p className="text-2xl font-extrabold text-rose-400 font-mono">{metrics.reopenedCount}</p>
            <span className="text-[10px] text-slate-500">Waste returned (New mission)</span>
          </div>
        </div>

        {/* FILTERS & SEARCH CONTROLS */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Checkpoint Day Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDayFilter(null)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDayFilter === null ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              ALL DAYS
            </button>
            <button
              onClick={() => setSelectedDayFilter(30)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDayFilter === 30 ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              30 DAYS
            </button>
            <button
              onClick={() => setSelectedDayFilter(60)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDayFilter === 60 ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              60 DAYS
            </button>
            <button
              onClick={() => setSelectedDayFilter(90)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedDayFilter === 90 ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
              }`}
            >
              90 DAYS
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="SUSTAINED">SUSTAINED</option>
              <option value="REOPENED">REOPENED</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tag code, site..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </form>
          </div>
        </div>

        {/* CHECKPOINTS GRID */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading monitoring checkpoints...</p>
          </div>
        ) : checkpoints.length === 0 ? (
          <div className="bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-600 dark:text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Monitoring Checkpoints Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Checkpoints are automatically created when TrashTags reach the transformation stage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between hover:border-slate-300 dark:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar: TagCode & Checkpoint Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        #{cp.tagCode || 'TT-1001'}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {cp.checkpointDays}-Day Audit
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                        cp.status === 'SUSTAINED'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : cp.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : cp.status === 'REOPENED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {cp.status}
                    </span>
                  </div>

                  {/* Title & Address */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{cp.trashTagTitle}</h3>
                    {cp.address && <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">{cp.address}</p>}
                  </div>

                  {/* Inspection Dates */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Scheduled Date:</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {new Date(cp.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>

                    {cp.completedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Completed Date:</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {new Date(cp.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {cp.wasteDetected !== undefined && cp.wasteDetected !== null && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Waste Return Status:</span>
                        <span
                          className={`font-bold ${
                            cp.wasteDetected ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {cp.wasteDetected ? '⚠️ Waste Detected (Reopened)' : '✓ Clean (Pristine)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence Thumbnail */}
                  {cp.image && (
                    <div className="relative rounded-xl overflow-hidden h-36 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <img
                        src={cp.image}
                        alt={`Inspection Evidence - ${cp.tagCode}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-mono">
                        Inspection Evidence
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {cp.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
                      "{cp.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/recovery/${cp.trashTagId}`}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                  >
                    View Site <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleOpenInspectionModal(cp)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {cp.status === 'PENDING' ? 'Record Inspection' : 'Update Inspection'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE INSPECTION MODAL */}
        {selectedCheckpoint && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    Record Inspection Audit
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    #{selectedCheckpoint.tagCode} — {selectedCheckpoint.checkpointDays}-Day Monitoring Checkpoint
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCheckpoint(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitInspection} className="space-y-4">
                {/* Waste Return Toggle */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Has dumping or waste returned to this site?
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setWasteDetected(false)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        !wasteDetected
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      No (Site Clean)
                    </button>

                    <button
                      type="button"
                      onClick={() => setWasteDetected(true)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        wasteDetected
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-white'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Yes (Waste Returned)
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    {wasteDetected
                      ? '⚠️ Selecting "Yes" will set status to REOPENED, log a SITE_REOPENED event, and make the site eligible for a new recovery mission.'
                      : '✓ Selecting "No" records a clean inspection. Passing 90 days clean advances status to SUSTAINED.'}
                  </p>
                </div>

                {/* Inspection Evidence Photo Picker Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Inspection Evidence Photo (Optional)</span>
                    </label>
                    {evidenceImageUrl && (
                      <button
                        type="button"
                        onClick={() => setEvidenceImageUrl('')}
                        className="text-[11px] text-rose-500 hover:text-rose-400 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {/* Hidden File / Camera Inputs */}
                  <input
                    type="file"
                    ref={evidenceFileInputRef}
                    accept="image/*"
                    onChange={handleEvidenceFileUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={evidenceCameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleEvidenceFileUpload}
                    className="hidden"
                  />

                  {/* Image Preview Box */}
                  {evidenceImageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group h-44 flex items-center justify-center">
                      <img
                        src={evidenceImageUrl}
                        alt="Inspection Evidence Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                        <span className="bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Evidence Ready
                        </span>
                        <button
                          type="button"
                          onClick={() => evidenceFileInputRef.current?.click()}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center space-y-1.5 bg-white dark:bg-slate-900/40">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">No Evidence Photo Selected</p>
                      <p className="text-[10px] text-slate-500">Upload device photo, snap with camera, or pick a demo preset.</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => evidenceFileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => evidenceCameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Click Photo</span>
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                      Or select Demo Preset Photo:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {DEMO_MONITORING_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEvidenceImageUrl(p.url)}
                          className={`rounded-lg overflow-hidden border p-1 transition-all flex flex-col items-center gap-0.5 group ${
                            evidenceImageUrl === p.url
                              ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-12 object-cover rounded group-hover:scale-105 transition-transform" />
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inspection Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Inspector Audit Notes
                  </label>
                  <textarea
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="Record site condition, garden maintenance status, or details of returned waste..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCheckpoint(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInspection}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 ${
                      wasteDetected ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-600 hover:bg-cyan-500'
                    }`}
                  >
                    {submittingInspection ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Submit Inspection Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

