'use client';

import React from 'react';
import Link from 'next/link';
import { TimelineEvent } from '@/services/api';
import { MapPin, CheckCircle2, Users, Rocket, Recycle, Sparkles, Target, Trees, Search, AlertTriangle, ShieldCheck, User } from 'lucide-react';

interface VerticalTimelineStreamProps {
  events: TimelineEvent[];
  loading?: boolean;
  emptyMessage?: string;
}

const EVENT_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    colorClass: string;
    badgeText: string;
    badgeBg: string;
  }
> = {
  REPORT_CREATED: {
    icon: <MapPin className="w-5 h-5 text-amber-400" />,
    colorClass: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
    badgeText: 'Reported',
    badgeBg: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  },
  REPORT_VERIFIED: {
    icon: <CheckCircle2 className="w-5 h-5 text-blue-400" />,
    colorClass: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
    badgeText: 'Verified',
    badgeBg: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  },
  MISSION_CREATED: {
    icon: <Users className="w-5 h-5 text-cyan-400" />,
    colorClass: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
    badgeText: 'Mission Planned',
    badgeBg: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  },
  MISSION_JOINED: {
    icon: <Users className="w-5 h-5 text-teal-400" />,
    colorClass: 'border-teal-500/30 bg-teal-950/20 text-teal-400',
    badgeText: 'Volunteer Joined',
    badgeBg: 'bg-teal-900/40 text-teal-300 border-teal-700/50',
  },
  CLEANUP_STARTED: {
    icon: <Rocket className="w-5 h-5 text-indigo-400" />,
    colorClass: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400',
    badgeText: 'Cleanup Started',
    badgeBg: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50',
  },
  CLEANUP_COMPLETED: {
    icon: <Recycle className="w-5 h-5 text-emerald-400" />,
    colorClass: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    badgeText: 'Cleanup Completed',
    badgeBg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  },
  RECOVERY_VERIFIED: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    colorClass: 'border-green-500/30 bg-green-950/20 text-green-400',
    badgeText: 'Recovery Verified',
    badgeBg: 'bg-green-900/40 text-green-300 border-green-700/50',
  },
  TRANSFORMATION_RECOMMENDED: {
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    colorClass: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
    badgeText: 'AI Prevention Plan',
    badgeBg: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  },
  TRANSFORMATION_SELECTED: {
    icon: <Target className="w-5 h-5 text-fuchsia-400" />,
    colorClass: 'border-fuchsia-500/30 bg-fuchsia-950/20 text-fuchsia-400',
    badgeText: 'Strategy Selected',
    badgeBg: 'bg-fuchsia-900/40 text-fuchsia-300 border-fuchsia-700/50',
  },
  TRANSFORMATION_COMPLETED: {
    icon: <Trees className="w-5 h-5 text-lime-400" />,
    colorClass: 'border-lime-500/30 bg-lime-950/20 text-lime-400',
    badgeText: 'Transformed',
    badgeBg: 'bg-lime-900/40 text-lime-300 border-lime-700/50',
  },
  MONITORING_COMPLETED: {
    icon: <Search className="w-5 h-5 text-sky-400" />,
    colorClass: 'border-sky-500/30 bg-sky-950/20 text-sky-400',
    badgeText: 'Monitoring Inspection',
    badgeBg: 'bg-sky-900/40 text-sky-300 border-sky-700/50',
  },
  SITE_REOPENED: {
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    colorClass: 'border-red-500/30 bg-red-950/20 text-red-400',
    badgeText: 'Site Reopened',
    badgeBg: 'bg-red-900/40 text-red-300 border-red-700/50',
  },
  SITE_SUSTAINED: {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    colorClass: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    badgeText: 'Sustained Clean',
    badgeBg: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  },
};

function formatEventTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function VerticalTimelineStream({
  events,
  loading = false,
  emptyMessage = 'No timeline events found.',
}: VerticalTimelineStreamProps) {
  if (loading) {
    return (
      <div className="space-y-6 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-16 bg-slate-800/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
        <Recycle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/80 before:via-cyan-500/50 before:to-slate-800">
      {events.map((event) => {
        const config = EVENT_CONFIG[event.eventType] || {
          icon: <Recycle className="w-5 h-5 text-slate-400" />,
          colorClass: 'border-slate-700 bg-slate-900 text-slate-300',
          badgeText: event.eventType.replace(/_/g, ' '),
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        };

        const targetTagId = event.trashTagId;
        const tagCodePill = event.tagCode || 'TRASH-TAG';

        return (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10 ${config.colorClass}`}
            >
              {config.icon}
            </div>

            {/* Event Card */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl hover:border-slate-700 transition-all duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                    {config.badgeText}
                  </span>
                  {event.tagCode && (
                    <Link
                      href={`/recovery/${targetTagId}`}
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/80 transition-colors"
                    >
                      🏷️ {tagCodePill}
                    </Link>
                  )}
                  {event.trashTagTitle && (
                    <span className="text-xs text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-xs">
                      • {event.trashTagTitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    {event.actorName || 'System Volunteer'}
                  </span>
                  <span>•</span>
                  <time className="font-mono text-slate-400">{formatEventTime(event.createdAt)}</time>
                </div>
              </div>

              <h4 className="text-base font-semibold text-slate-100 mb-1">{event.title}</h4>
              {event.description && <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>}

              {/* Event Image attachment if present */}
              {event.imageUrl && (
                <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-800 max-w-sm">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              )}

              {/* Link to Recovery Page */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <Link
                  href={`/recovery/${targetTagId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View TrashTag Recovery Site &rarr;
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

