'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RecoveryStatus, TrashTag } from '@/types/trashtag';
import { verifyTrashTagApi } from '@/services/api';
import { ShieldCheck, PlusCircle, PlayCircle, Sparkles, AlertTriangle, ArrowRight, RefreshCw, Eye, CheckCircle2 } from 'lucide-react';

interface NextActionCalloutProps {
  tag: TrashTag;
  onStatusUpdated?: () => void;
}

export const NextActionCallout: React.FC<NextActionCalloutProps> = ({ tag, onStatusUpdated }) => {
  const [verifying, setVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle instant verification (Verifier/Admin action)
  const handleVerify = async () => {
    setVerifying(true);
    setErrorMsg(null);
    try {
      // Use stored dev token or mock verifier call
      const token = localStorage.getItem('trashtag_token') || 'dev_verifier_token';
      await verifyTrashTagApi(tag.id, token);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      console.error('Failed to verify hotspot:', err);
      setErrorMsg(err.message || 'Verification failed. Please check permissions.');
    } finally {
      setVerifying(false);
    }
  };

  const renderActionContent = () => {
    switch (tag.status) {
      case 'REPORTED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Next Recommended Action
              </span>
              <h3 className="text-base font-bold text-white">Awaiting Verification</h3>
              <p className="text-xs text-slate-300">
                Field verifier or community admin must confirm hotspot coordinates and severity.
              </p>
            </div>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{verifying ? 'Verifying...' : 'Verify Hotspot'}</span>
            </button>
          </div>
        );

      case 'VERIFIED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Next Recommended Action
              </span>
              <h3 className="text-base font-bold text-white">Mobilize Cleanup Mission</h3>
              <p className="text-xs text-slate-300">
                Hotspot verified! Create a cleanup mission to recruit volunteers and schedule waste recovery.
              </p>
            </div>
            <Link
              href={`/missions/new?tagId=${tag.id}`}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Cleanup Mission</span>
            </Link>
          </div>
        );

      case 'MISSION_CREATED':
      case 'MISSION_ACTIVE':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5 animate-pulse" /> Mission Active
              </span>
              <h3 className="text-base font-bold text-white">Open Field Recovery Mode</h3>
              <p className="text-xs text-slate-300">
                Cleanup team deployed! Track live volunteer check-ins and log recovered waste items.
              </p>
            </div>
            <Link
              href={`/missions/${tag.id}/field`}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Open Field Mode</span>
            </Link>
          </div>
        );

      case 'CLEANUP_COMPLETED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recovery Audit
              </span>
              <h3 className="text-base font-bold text-white">Awaiting Recovery Verification</h3>
              <p className="text-xs text-slate-300">
                Waste collected! Audit before/after photo evidence and total weight recovered.
              </p>
            </div>
            <button
              onClick={handleVerify}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Recovery Audit</span>
            </button>
          </div>
        );

      case 'RECOVERY_VERIFIED':
      case 'TRANSFORMATION_PLANNED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Site Transformation
              </span>
              <h3 className="text-base font-bold text-white">Create Prevention Strategy & Garden Plan</h3>
              <p className="text-xs text-slate-300">
                Prevent re-dumping by repurposing site into a community garden, park, or mural.
              </p>
            </div>
            <Link
              href={`/transformations/new?tagId=${tag.id}`}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Prevention Plan</span>
            </Link>
          </div>
        );

      case 'TRANSFORMED':
      case 'MONITORING':
      case 'SUSTAINED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Active Surveillance
              </span>
              <h3 className="text-base font-bold text-white">30/60/90-Day Site Monitoring</h3>
              <p className="text-xs text-slate-300">
                Site transformed! Conduct periodic surveillance checks to maintain zero waste.
              </p>
            </div>
            <Link
              href={`/monitoring/${tag.id}`}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Log Surveillance Check</span>
            </Link>
          </div>
        );

      case 'REOPENED':
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Action Required
              </span>
              <h3 className="text-base font-bold text-white">Create New Recovery Mission</h3>
              <p className="text-xs text-slate-300">
                Hotspot reopened due to fresh dumping. Re-deploy cleanup team immediately.
              </p>
            </div>
            <Link
              href={`/missions/new?tagId=${tag.id}`}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center gap-2 shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Create New Recovery Mission</span>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {errorMsg && (
        <div className="mb-3 text-xs text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-800/60">
          {errorMsg}
        </div>
      )}

      {renderActionContent()}
    </div>
  );
};

