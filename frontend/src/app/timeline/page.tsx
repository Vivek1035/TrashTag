'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import VerticalTimelineStream from '@/components/timeline/VerticalTimelineStream';
import { fetchGlobalTimelineApi, TimelineEvent } from '@/services/api';
import { UserNavHeader } from '@/components/layout/UserNavHeader';
import { Activity, ShieldCheck, Recycle, Sparkles, Filter, RefreshCw, MapPin, Compass } from 'lucide-react';

const FILTER_TABS = [
  { id: 'ALL', label: 'All Activity', icon: Activity },
  { id: 'REPORT_CREATED', label: 'Reports', icon: Activity },
  { id: 'MISSION_CREATED', label: 'Missions', icon: Recycle },
  { id: 'RECOVERY_VERIFIED', label: 'Verifications', icon: ShieldCheck },
  { id: 'TRANSFORMATION_RECOMMENDED', label: 'AI & Transformation', icon: Sparkles },
  { id: 'MONITORING_COMPLETED', label: 'Surveillance', icon: ShieldCheck },
];

export default function GlobalTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTimeline = async (filter: string) => {
    setLoading(true);
    try {
      const data = await fetchGlobalTimelineApi(filter, 0, 50);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load global timeline events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTimeline(activeFilter);
  }, [activeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTimeline(activeFilter);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" /> Live Ecological Feed
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              TrashTag Activity Timeline
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Chronological log of dump reports, volunteer cleanup missions, AI prevention plans, and 90-day site surveillance.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-md text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Stream
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 px-3">
            <Filter className="w-4 h-4 text-emerald-400" /> Filter:
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Timeline Stream */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-2 sm:p-4 rounded-3xl">
          <VerticalTimelineStream
            events={events}
            loading={loading}
            emptyMessage={
              activeFilter === 'ALL'
                ? 'No activity recorded yet across the TrashTag network.'
                : `No activity events matching "${activeFilter.replace(/_/g, ' ')}".`
            }
          />
        </div>
      </main>
    </div>
  );
}

