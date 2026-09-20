'use client';

import React from 'react';
import { TimelineEvent } from '@/services/api';
import { Clock, User, CheckCircle2, ShieldCheck, PlayCircle, Sparkles, Tag } from 'lucide-react';

interface TimelineStreamProps {
  events: TimelineEvent[];
}

export const TimelineStream: React.FC<TimelineStreamProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'REPORT_CREATED':
        return <Tag className="w-3.5 h-3.5 text-amber-400" />;
      case 'HOTSPOT_VERIFIED':
        return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case 'MISSION_CREATED':
      case 'MISSION_STARTED':
        return <PlayCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'CLEANUP_COMPLETED':
      case 'RECOVERY_VERIFIED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'TRANSFORMATION_SUBMITTED':
      case 'TRANSFORMED':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Clock className="w-4 h-4 text-emerald-400" />
        <span>Hotspot Activity & Audit Log</span>
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">No events recorded yet.</div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:bg-slate-800">
          {events.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Event Icon Bullet */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-md">
                {getEventIcon(ev.eventType)}
              </div>

              {/* Event Content */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{ev.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                </div>

                {ev.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ev.description}</p>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>By <strong className="text-slate-700 dark:text-slate-300 font-medium">{ev.actorName || 'System'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

