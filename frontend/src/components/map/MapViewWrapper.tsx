'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { TrashTag } from '@/types/trashtag';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  tags: TrashTag[];
  selectedTag: TrashTag | null;
  onSelectTag: (tag: TrashTag) => void;
}

const DynamicMapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-sm font-medium animate-pulse flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-emerald-400" /> Loading Explore Map...
      </span>
    </div>
  ),
});

export const MapViewWrapper: React.FC<MapViewProps> = (props) => {
  return <DynamicMapView {...props} />;
};

