'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

interface BeforeAfterViewerProps {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  title: string;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  beforeImageUrl,
  afterImageUrl,
  title,
}) => {
  const [activeTab, setActiveTab] = useState<'before' | 'after' | 'split'>('split');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Before / After Evidence Gallery</span>
        </h3>

        {afterImageUrl && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                activeTab === 'split' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                activeTab === 'before' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Before Only
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                activeTab === 'after' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              After Only
            </button>
          </div>
        )}
      </div>

      {/* Image Grid Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[260px]">
        {/* BEFORE IMAGE */}
        {(activeTab === 'split' || activeTab === 'before') && (
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group h-64">
            {beforeImageUrl ? (
              <img
                src={beforeImageUrl}
                alt={`Before - ${title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">No initial photo</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
              Before Report
            </div>
          </div>
        )}

        {/* AFTER IMAGE */}
        {afterImageUrl ? (
          (activeTab === 'split' || activeTab === 'after') && (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group h-64">
              <img
                src={afterImageUrl}
                alt={`After - ${title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                After Recovery & Transformation
              </div>
            </div>
          )
        ) : (
          activeTab === 'split' && (
            <div className="relative rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-2 h-64">
              <Sparkles className="w-8 h-8 text-emerald-400/50 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">After Evidence Pending</span>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Photo will be updated once waste recovery and site transformation are completed.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

