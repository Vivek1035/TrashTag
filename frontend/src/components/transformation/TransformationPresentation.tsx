'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, ShieldCheck, ArrowRight, Layers, Image as ImageIcon, HeartHandshake } from 'lucide-react';

interface TransformationPresentationProps {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  recoveredWeightKg?: number;
  transformationType?: string;
  description?: string;
}

export const TransformationPresentation: React.FC<TransformationPresentationProps> = ({
  beforeImageUrl,
  afterImageUrl,
  recoveredWeightKg,
  transformationType,
  description,
}) => {
  const [activeStage, setActiveStage] = useState<'all' | 'before' | 'after'>('all');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Site Transformation Showcase
            </h3>
            <p className="text-[11px] text-slate-400">3-Stage evolution from illegal dump to revitalized community space</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              activeStage === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3-Stage Timeline
          </button>
          <button
            onClick={() => setActiveStage('before')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              activeStage === 'before' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Before Only
          </button>
          <button
            onClick={() => setActiveStage('after')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              activeStage === 'after' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            After Only
          </button>
        </div>
      </div>

      {/* 3-Stage Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STAGE 1: INITIAL DUMP SITE */}
        {(activeStage === 'all' || activeStage === 'before') && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-3 flex flex-col justify-between">
            <div className="relative rounded-lg overflow-hidden h-48 bg-slate-900 border border-slate-800">
              {beforeImageUrl ? (
                <img
                  src={beforeImageUrl}
                  alt="Stage 1: Before Illegal Dump"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No initial image</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                Stage 1: Dump Site
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Illegal Waste Accumulation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Initial report submitted by community reporter.</p>
            </div>
          </div>
        )}

        {/* STAGE 2: CLEARED & RECOVERED SITE */}
        {activeStage === 'all' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
              <div className="space-y-0.5">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {recoveredWeightKg || 0} kg
                </span>
                <span className="text-xs font-semibold text-slate-300 block">Recovered Waste Swept</span>
              </div>
              <span className="text-[10px] text-slate-500">Verified field cleanup operation</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400">Stage 2: Waste Cleared</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Volunteers removed hazardous materials.</p>
            </div>
          </div>
        )}

        {/* STAGE 3: TRANSFORMATION & COMMUNITY SPACE */}
        {(activeStage === 'all' || activeStage === 'after') && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-3 flex flex-col justify-between">
            <div className="relative rounded-lg overflow-hidden h-48 bg-slate-900 border border-slate-800">
              {afterImageUrl ? (
                <img
                  src={afterImageUrl}
                  alt="Stage 3: Transformed Space"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                  <Sparkles className="w-8 h-8 text-purple-400/60 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">Transformation Image Pending</span>
                  <p className="text-[11px] text-slate-500">Upload after-photo to showcase site revitalization</p>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-purple-500/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Stage 3: Transformed
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-300">
                {transformationType || 'Revitalized Community Asset'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                {description || 'Site converted into a long-term sustainable asset.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

