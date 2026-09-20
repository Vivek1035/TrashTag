'use client';

import React from 'react';
import { FilterCategory } from '@/types/trashtag';
import { Search, Filter, AlertTriangle, AlertCircle, PlayCircle, CheckCircle2, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface MapFiltersProps {
  selectedFilter: FilterCategory;
  onSelectFilter: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

const FILTER_ITEMS: { id: FilterCategory; label: string; icon: React.ReactNode; badgeColor: string }[] = [
  { id: 'All', label: 'All Hotspots', icon: <Layers className="w-4 h-4" />, badgeColor: 'bg-slate-700 text-white' },
  { id: 'Critical', label: 'Critical', icon: <AlertTriangle className="w-4 h-4 text-red-400" />, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  { id: 'Reported', label: 'Reported', icon: <AlertCircle className="w-4 h-4 text-amber-400" />, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  { id: 'Mission Active', label: 'Mission Active', icon: <PlayCircle className="w-4 h-4 text-blue-400" />, badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  { id: 'Recovered', label: 'Recovered', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  { id: 'Transformed', label: 'Transformed', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  { id: 'Reopened', label: 'Reopened', icon: <RefreshCw className="w-4 h-4 text-rose-400" />, badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
];

export const MapFilters: React.FC<MapFiltersProps> = ({
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by tag code (TT-1001), title, or address..."
          className="w-full bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 bg-slate-700 px-1.5 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter Category
          </span>
          <span className="text-xs text-emerald-400 font-mono font-medium">
            {totalCount} {totalCount === 1 ? 'hotspot' : 'hotspots'} found
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTER_ITEMS.map((item) => {
            const isActive = selectedFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectFilter(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-300 dark:border-slate-700/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

