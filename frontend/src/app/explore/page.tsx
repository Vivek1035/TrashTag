'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FilterCategory, TrashTag } from '@/types/trashtag';
import { fetchTrashTags } from '@/services/api';
import { MapViewWrapper } from '@/components/map/MapViewWrapper';
import { TrashTagPreview } from '@/components/map/TrashTagPreview';
import { Footer } from '@/components/layout/Footer';
import {
  MapPin,
  Search,
  Compass,
  AlertTriangle,
  ListFilter,
  Map as MapIcon,
  X,
} from 'lucide-react';

export default function ExplorePage() {
  const [tags, setTags] = useState<TrashTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<TrashTag | null>(null);
  const [activeTabMobile, setActiveTabMobile] = useState<'map' | 'list'>('map');
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTrashTags();
      setTags(data);
      if (data.length > 0 && !selectedTag) {
        setSelectedTag(data[0]);
      }
    } catch (err) {
      console.error('Error fetching trash tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats counters
  const counts = useMemo(() => {
    const critical = tags.filter((t) => t.severity === 'CRITICAL').length;
    const reported = tags.filter((t) => t.status === 'REPORTED').length;
    const mission = tags.filter((t) => t.status === 'MISSION_ACTIVE' || t.status === 'MISSION_CREATED').length;
    const recovered = tags.filter((t) => t.status === 'RECOVERY_VERIFIED' || t.status === 'CLEANUP_COMPLETED').length;
    const transformed = tags.filter((t) => t.status === 'TRANSFORMED' || t.status === 'TRANSFORMATION_PLANNED').length;
    const total = tags.length;

    return {
      all: total,
      critical,
      reported,
      mission,
      recovered,
      transformed,
      activeStats: critical + reported,
    };
  }, [tags]);

  // Filter & Search Logic
  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      let matchesFilter = true;
      switch (selectedFilter) {
        case 'Critical':
          matchesFilter = tag.severity === 'CRITICAL';
          break;
        case 'Reported':
          matchesFilter = tag.status === 'REPORTED';
          break;
        case 'Mission Active':
          matchesFilter = tag.status === 'MISSION_ACTIVE' || tag.status === 'MISSION_CREATED';
          break;
        case 'Recovered':
          matchesFilter = tag.status === 'RECOVERY_VERIFIED' || tag.status === 'CLEANUP_COMPLETED';
          break;
        case 'Transformed':
          matchesFilter = tag.status === 'TRANSFORMED' || tag.status === 'TRANSFORMATION_PLANNED';
          break;
        case 'Reopened':
          matchesFilter = tag.status === 'REOPENED';
          break;
        case 'All':
        default:
          matchesFilter = true;
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const code = tag.tagCode.toLowerCase();
        const title = tag.title.toLowerCase();
        const address = (tag.address || '').toLowerCase();
        matchesSearch = code.includes(q) || title.includes(q) || address.includes(q);
      }

      return matchesFilter && matchesSearch;
    });
  }, [tags, selectedFilter, searchQuery]);

  const CATEGORY_PILLS = [
    { id: 'All', label: 'All', count: counts.all, dotColor: 'bg-emerald-500' },
    { id: 'Critical', label: 'Critical', count: counts.critical, dotColor: 'bg-red-500 border border-red-300' },
    { id: 'Reported', label: 'Reported', count: counts.reported, dotColor: 'bg-amber-500' },
    { id: 'Mission Active', label: 'Mission', count: counts.mission, dotColor: 'bg-yellow-400' },
    { id: 'Recovered', label: 'Recovered', count: counts.recovered, dotColor: 'bg-emerald-400' },
    { id: 'Transformed', label: 'Transformed', count: counts.transformed, dotColor: 'bg-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── Main Content Container ──────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto w-full">
        {/* ── Top Header Section ────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Compass className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>LIVE ENVIRONMENTAL NETWORK</span>
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <span className="text-slate-600 dark:text-slate-400">DEMO MODE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              See polluted spaces, active cleanup missions, verified recoveries, and community transformations in real time.
            </p>
          </div>

          {/* Top Summary Stats Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-2.5 flex items-center justify-around sm:justify-end gap-6 shadow-xl shrink-0">
            <div className="text-center">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-pink-500 dark:text-pink-400">ACTIVE</p>
              <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{counts.activeStats}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500 dark:text-amber-400">MISSIONS</p>
              <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{counts.mission}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-500 dark:text-emerald-400">RECOVERED</p>
              <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{counts.recovered}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] font-extrabold tracking-widest uppercase text-purple-500 dark:text-purple-400">TRANSFORM</p>
              <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">{counts.transformed}</p>
            </div>
          </div>
        </div>

        {/* ── Full Width Search & Filter Bar ─────────────────── */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a location, waste type, or hotspot title..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs bg-slate-200 dark:bg-slate-800 p-1 rounded-md"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {CATEGORY_PILLS.map((pill) => {
              const isActive = selectedFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedFilter(pill.id as FilterCategory)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                  }`}
                >
                  {pill.id === 'All' ? (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {pill.count}
                    </span>
                  ) : (
                    <span className={`w-2.5 h-2.5 rounded-full ${pill.dotColor}`} />
                  )}
                  <span>{pill.label}</span>
                  {pill.id !== 'All' && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Map Canvas & Sidebar Container ───────────── */}
        <div className="h-[600px] lg:h-[680px] flex flex-col md:flex-row relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          {/* Mobile View Switcher Tabs */}
          <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold z-20 shrink-0">
            <button
              onClick={() => setActiveTabMobile('map')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                activeTabMobile === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Map View
            </button>
            <button
              onClick={() => setActiveTabMobile('list')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                activeTabMobile === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-4 h-4" /> Hotspots ({filteredTags.length})
            </button>
          </div>

          {/* Left Map View Canvas */}
          <main
            className={`flex-1 h-full min-h-0 relative z-10 ${
              activeTabMobile === 'map' ? 'flex flex-1 h-full' : 'hidden md:flex md:h-full'
            }`}
          >
            <MapViewWrapper
              tags={filteredTags}
              selectedTag={selectedTag}
              onSelectTag={(tag) => setSelectedTag(tag)}
            />

            {/* Map Overlay Legend */}
            {showLegend && (
              <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2.5 max-w-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 gap-4">
                  <span>Satellite Layers & Legend</span>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-300" />
                    <span>Active Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Reported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span>Cleanup Mission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Recovered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>Transformation</span>
                  </div>
                </div>
              </div>
            )}

            {!showLegend && (
              <button
                onClick={() => setShowLegend(true)}
                className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xl"
              >
                Show Legend
              </button>
            )}

            {/* Selected Hotspot Floating Preview Card (Mobile & Desktop) */}
            {selectedTag && (
              <div className="absolute z-30 shadow-2xl transition-all duration-300 bottom-4 left-4 right-4 max-h-[60vh] md:bottom-auto md:left-auto md:top-4 md:right-4 md:w-80 lg:w-96 md:max-h-[85vh] overflow-y-auto custom-scrollbar">
                <TrashTagPreview tag={selectedTag} onClose={() => setSelectedTag(null)} />
              </div>
            )}
          </main>

          {/* Right Side Sidebar Hotspots List */}
          <aside
            className={`w-full md:w-[380px] lg:w-[420px] h-full min-h-0 bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20 overflow-hidden ${
              activeTabMobile === 'list' ? 'flex flex-1 h-full' : 'hidden md:flex md:h-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  Hotspots <span className="text-slate-500 dark:text-slate-400 font-mono font-normal">({filteredTags.length})</span>
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
                DEMO DATA
              </span>
            </div>

            {/* List of Filtered Hotspots */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
              {filteredTags.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto opacity-80" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Hotspots Found</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                    Try adjusting your search query or selecting a different status filter above.
                  </p>
                </div>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTag?.id === tag.id;
                  return (
                    <div
                      key={tag.id}
                      onClick={() => {
                        setSelectedTag(tag);
                        if (activeTabMobile === 'list') {
                          setActiveTabMobile('map');
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-50/90 dark:bg-slate-900 border-emerald-500/80 dark:border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {tag.title}
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          DEMO DATA
                        </span>
                      </div>

                      {tag.address && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{tag.address}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {tag.wasteType} Waste
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                            tag.status === 'REPORTED'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : tag.status === 'MISSION_ACTIVE' || tag.status === 'MISSION_CREATED'
                              ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
                              : tag.status === 'RECOVERY_VERIFIED' || tag.status === 'CLEANUP_COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : tag.status === 'TRANSFORMED' || tag.status === 'TRANSFORMATION_PLANNED'
                              ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {tag.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Global Footer ────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
