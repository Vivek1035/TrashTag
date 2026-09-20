'use client';

import React from 'react';
import Link from 'next/link';
import { TrashTag } from '@/types/trashtag';
import { MapPin, Weight, ArrowRight, User, Calendar, ShieldAlert, Sparkles, Tag } from 'lucide-react';

interface TrashTagPreviewProps {
  tag: TrashTag;
  onClose?: () => void;
}

export const TrashTagPreview: React.FC<TrashTagPreviewProps> = ({ tag, onClose }) => {
  const [imgError, setImgError] = React.useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'VERIFIED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'MISSION_CREATED':
      case 'MISSION_ACTIVE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CLEANUP_COMPLETED':
      case 'RECOVERY_VERIFIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'TRANSFORMATION_PLANNED':
      case 'TRANSFORMED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'MONITORING':
      case 'SUSTAINED':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'REOPENED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900/60 text-red-200 border-red-500';
      case 'HIGH':
        return 'bg-amber-900/60 text-amber-200 border-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-900/60 text-yellow-200 border-yellow-500';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-600';
    }
  };

  // Format recovery status label
  const formattedStatus = tag.status.replace(/_/g, ' ');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Cover Image or Placeholder */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {tag.primaryImageUrl && !imgError ? (
          <img
            src={tag.primaryImageUrl}
            alt={tag.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 bg-gradient-to-br from-slate-900 to-slate-800">
            <Tag className="w-10 h-10 stroke-1 text-emerald-500/60" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Environmental Hotspot Image</span>
          </div>
        )}

        {/* Tag Code Badge on top of image */}
        <div className="absolute top-3 left-3 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-mono font-bold text-emerald-400 border border-emerald-500/40 shadow-lg">
          #{tag.tagCode}
        </div>

        {/* Close Button if provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-white w-7 h-7 rounded-full flex items-center justify-center text-xs backdrop-blur-md border border-slate-300 dark:border-slate-700/50 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content details */}
      <div className="p-4 space-y-3.5">
        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-wide">
            {tag.title}
          </h3>
          {tag.address && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{tag.address}</span>
            </p>
          )}
        </div>

        {/* Status & Severity Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-md font-semibold border ${getStatusBadge(tag.status)}`}>
            {formattedStatus}
          </span>
          <span className={`px-2.5 py-1 rounded-md font-medium border ${getSeverityBadge(tag.severity)} flex items-center gap-1`}>
            <ShieldAlert className="w-3 h-3" />
            {tag.severity} SEVERITY
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-medium">
            {tag.wasteType}
          </span>
        </div>

        {/* Waste Weight Metrics */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Weight className="w-3 h-3 text-amber-400" /> Est. Waste
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
              {tag.estimatedWeightKg ? `${tag.estimatedWeightKg} kg` : 'N/A'}
            </span>
          </div>

          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-2.5">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Recovered Waste
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {tag.status === 'RECOVERY_VERIFIED' || tag.status === 'TRANSFORMED' || tag.status === 'SUSTAINED'
                ? `${tag.estimatedWeightKg || 0} kg`
                : 'Pending'}
            </span>
          </div>
        </div>

        {/* Reporter info & date */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            Reported by <strong className="text-slate-700 dark:text-slate-300 font-medium">{tag.reporterName || 'Anonymous'}</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3" />
            {new Date(tag.reportedAt).toLocaleDateString()}
          </span>
        </div>

        {/* View Recovery Button */}
        <Link
          href={`/recovery/${tag.id}`}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>View Recovery Lifecycle</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

