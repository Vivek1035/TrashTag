'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TrashTag } from '@/types/trashtag';
import { fetchTrashTagById, verifyRecoveryApi, VerifyRecoveryInput } from '@/services/api';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  Weight,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function RecoveryVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const trashTagId = (params?.trashTagId as string) || '';

  const [tag, setTag] = useState<TrashTag | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Evidence Checkbox Indicators
  const [gpsVerified, setGpsVerified] = useState<boolean>(true);
  const [timestampVerified, setTimestampVerified] = useState<boolean>(true);
  const [beforeImageVerified, setBeforeImageVerified] = useState<boolean>(true);
  const [afterImageVerified, setAfterImageVerified] = useState<boolean>(true);
  const [wasteRecordVerified, setWasteRecordVerified] = useState<boolean>(true);
  const [verifierNotes, setVerifierNotes] = useState<string>('');

  const isVerifierOrAdmin = user?.role === 'VERIFIER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!trashTagId) return;
    const loadTag = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTrashTagById(trashTagId);
        setTag(data);
      } catch (err: any) {
        console.error('Failed to load TrashTag for verification:', err);
        setError(err.message || 'Failed to load TrashTag details');
      } finally {
        setLoading(false);
      }
    };
    loadTag();
  }, [trashTagId]);

  const handleVerification = async (approved: boolean) => {
    if (!token) {
      setError('You must be logged in as a Verifier or Admin to submit verification.');
      return;
    }
    if (!isVerifierOrAdmin) {
      setError('Action forbidden: Only VERIFIER or ADMIN role accounts can perform recovery verification.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const payload: VerifyRecoveryInput = {
      approved,
      notes: verifierNotes.trim() || (approved ? 'Evidence verified successfully by audit.' : 'Recovery verification rejected. Requesting resubmission.'),
      evidenceGpsVerified: gpsVerified,
      evidenceTimestampVerified: timestampVerified,
      evidenceBeforeImageVerified: beforeImageVerified,
      evidenceAfterImageVerified: afterImageVerified,
      evidenceWasteRecordVerified: wasteRecordVerified,
    };

    try {
      const updatedTag = await verifyRecoveryApi(tag?.id || trashTagId, payload, token);
      setTag(updatedTag);
      if (approved) {
        setSuccessMessage('Recovery verified successfully! Lifecycle advanced to RECOVERY_VERIFIED (+50 XP awarded).');
      } else {
        setSuccessMessage('Recovery verification rejected. Status safely reverted to MISSION_ACTIVE for correction.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading evidence payload for verification...</p>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">TrashTag Not Found</h2>
        <p className="text-slate-400 text-sm">Could not retrieve tag data for ID: {trashTagId}</p>
        <Link
          href="/explore"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
        >
          Return to Explore Map
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/recovery/${tag.id}`}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {tag.tagCode}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {tag.status}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-0.5">{tag.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Role:</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : user?.role === 'VERIFIER'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {user?.role || 'GUEST / USER'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner Alert if NOT Verifier or Admin */}
        {!isVerifierOrAdmin && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Verifier Role Required</h4>
              <p className="text-xs text-amber-300/80 mt-1">
                You are currently logged in as a <strong>{user?.role || 'Volunteer'}</strong>. Only accounts with the <strong>VERIFIER</strong> or <strong>ADMIN</strong> role can execute recovery verification approvals.
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Verification Submitted</h4>
                <p className="text-xs text-emerald-300/80">{successMessage}</p>
              </div>
            </div>
            <Link
              href={`/recovery/${tag.id}`}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              View Lifecycle
            </Link>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Verification Error</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Split Evidence View: BEFORE vs AFTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE EVIDENCE PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Before Evidence</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Initial Report
              </span>
            </div>

            {/* Before Photo */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-56">
              {tag.primaryImageUrl ? (
                <img
                  src={tag.primaryImageUrl}
                  alt={`Before - ${tag.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Camera className="w-8 h-8" />
                  <span className="text-xs">No before image submitted</span>
                </div>
              )}
            </div>

            {/* Before Details */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> GPS Coordinates
                </span>
                <span className="font-mono text-slate-200">{tag.latitude.toFixed(4)}, {tag.longitude.toFixed(4)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Reported Timestamp
                </span>
                <span>{tag.reportedAt ? new Date(tag.reportedAt).toLocaleString() : 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-amber-400" /> Estimated Waste
                </span>
                <span className="font-semibold text-amber-300">{tag.estimatedWeightKg || 0} kg ({tag.wasteType})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Location Address
                </span>
                <span className="truncate max-w-[200px] text-slate-300">{tag.address}</span>
              </div>
            </div>
          </div>

          {/* AFTER EVIDENCE PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">After Evidence</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cleanup Execution
              </span>
            </div>

            {/* After Photo */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-56">
              {tag.afterImageUrl ? (
                <img
                  src={tag.afterImageUrl}
                  alt={`After - ${tag.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                  <Sparkles className="w-8 h-8 text-emerald-400/50" />
                  <span className="text-xs font-semibold">After photo uploaded upon mission completion</span>
                  <p className="text-[11px] text-slate-500">Field Mode record pending final verifier validation</p>
                </div>
              )}
            </div>

            {/* After Details */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-emerald-400" /> Recovered Waste
                </span>
                <span className="font-semibold text-emerald-400 text-sm">{tag.recoveredWeightKg || 0} kg</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Current Status
                </span>
                <span className="font-semibold text-emerald-300">{tag.status}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" /> Cleanup Participants
                </span>
                <span>Verified Field Volunteers</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Waste Record Audit
                </span>
                <span className="text-emerald-400 font-mono">Verified DB Record</span>
              </div>
            </div>
          </div>
        </div>

        {/* EVIDENCE VERIFICATION INDICATORS CHECKLIST & VERIFIER ACTION FORM */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Evidence Verification Checklist & Audit Protocol
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify each evidence dimension to approve recovery and award verifier XP.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Award className="w-4 h-4" /> +50 XP Reward
            </div>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              gpsVerified ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <input
                type="checkbox"
                checked={gpsVerified}
                onChange={(e) => setGpsVerified(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold block">GPS Coordinates Match</span>
                <span className="text-[11px] text-slate-400">Before/after geo-location match hotspot site</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              timestampVerified ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <input
                type="checkbox"
                checked={timestampVerified}
                onChange={(e) => setTimestampVerified(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold block">Timestamp Authenticated</span>
                <span className="text-[11px] text-slate-400">Chronological cleanup timing validated</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              beforeImageVerified ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <input
                type="checkbox"
                checked={beforeImageVerified}
                onChange={(e) => setBeforeImageVerified(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold block">Before Image Validated</span>
                <span className="text-[11px] text-slate-400">Initial waste accumulation image confirmed</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              afterImageVerified ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <input
                type="checkbox"
                checked={afterImageVerified}
                onChange={(e) => setAfterImageVerified(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold block">After Image Validated</span>
                <span className="text-[11px] text-slate-400">Cleared site photo confirms full trash removal</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              wasteRecordVerified ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              <input
                type="checkbox"
                checked={wasteRecordVerified}
                onChange={(e) => setWasteRecordVerified(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold block">Waste Weight Audit</span>
                <span className="text-[11px] text-slate-400">Recorded waste tonnage consistent with site</span>
              </div>
            </label>
          </div>

          {/* Verifier Notes Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Verifier Audit Notes & Commentary
            </label>
            <textarea
              value={verifierNotes}
              onChange={(e) => setVerifierNotes(e.target.value)}
              placeholder="Enter audit comments, physical inspection notes, or resubmission instructions..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              disabled={submitting || !isVerifierOrAdmin || tag.status === 'RECOVERY_VERIFIED'}
              onClick={() => handleVerification(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reject & Request Resubmission
            </button>

            <button
              type="button"
              disabled={submitting || !isVerifierOrAdmin || tag.status === 'RECOVERY_VERIFIED'}
              onClick={() => handleVerification(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve Recovery Verification
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

