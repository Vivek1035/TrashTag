'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FilterCategory, TrashTag } from '@/types/trashtag';
import { fetchTrashTags } from '@/services/api';
import { MapViewWrapper } from '@/components/map/MapViewWrapper';
import { MapFilters } from '@/components/map/MapFilters';
import { MapLegend } from '@/components/map/MapLegend';
import { TrashTagPreview } from '@/components/map/TrashTagPreview';
import { MapPin, RefreshCw, ListFilter, Map as MapIcon, PlusCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ExplorePage() {
  const [tags, setTags] = useState<TrashTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<TrashTag | null>(null);
  const [activeTabMobile, setActiveTabMobile] = useState<'map' | 'list'>('map');

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

  // Filter & Search Logic
  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      // 1. Status Category Filter
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

      // 2. Text Search Query (tag code, title, address)
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight flex items-center gap-2">
              <span>TrashTag</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                Explore Map
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
              Live environmental recovery platform & pollution hotspot tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh hotspots"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <Link
            href="/report"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tag New Hotspot</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Mobile View Switcher Tabs */}
        <div className="md:hidden flex border-b border-slate-800 bg-slate-900 text-xs font-semibold z-20 shrink-0">
          <button
            onClick={() => setActiveTabMobile('map')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
              activeTabMobile === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Map View
          </button>
          <button
            onClick={() => setActiveTabMobile('list')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
              activeTabMobile === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" /> List ({filteredTags.length})
          </button>
        </div>

        {/* Left Side Panel (Desktop) / Tab view (Mobile) */}
        <aside
          className={`w-full md:w-[420px] xl:w-[460px] bg-slate-950 border-r border-slate-800/80 flex flex-col z-20 ${
            activeTabMobile === 'list' ? 'flex flex-1' : 'hidden md:flex'
          }`}
        >
          {/* Controls & Filter Section */}
          <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0">
            <MapFilters
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={filteredTags.length}
            />

            <MapLegend />
          </div>

          {/* List of Filtered Hotspots */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredTags.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-slate-200">No TrashTags Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Try adjusting your search query or switching filter categories.
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
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-emerald-500 scale-[1.01]' : 'hover:opacity-90'
                    }`}
                  >
                    <TrashTagPreview tag={tag} />
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Map Canvas Section */}
        <main
          className={`flex-1 relative ${
            activeTabMobile === 'map' ? 'flex flex-1 h-full' : 'hidden md:flex'
          }`}
        >
          <MapViewWrapper
            tags={filteredTags}
            selectedTag={selectedTag}
            onSelectTag={(tag) => setSelectedTag(tag)}
          />

          {/* Mobile Bottom Sheet / Card preview when a marker is clicked */}
          {selectedTag && (
            <div className="md:hidden absolute bottom-4 left-4 right-4 z-30 max-h-[60vh] overflow-y-auto shadow-2xl">
              <TrashTagPreview tag={selectedTag} onClose={() => setSelectedTag(null)} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

