'use client';

import React, { useState } from 'react';
import { TrashTag, WasteType, Severity } from '@/types/trashtag';
import { classifyTrashTagApi, overrideClassificationApi, ImageClassificationResponse } from '@/services/api';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  X,
  Layers,
  ShieldAlert,
  Percent,
  RefreshCw,
  LogIn,
} from 'lucide-react';

interface AIClassificationCardProps {
  tag: TrashTag;
  token: string | null;
  onTagUpdated?: (updatedTag: TrashTag) => void;
}

export const AIClassificationCard: React.FC<AIClassificationCardProps> = ({
  tag,
  token,
  onTagUpdated,
}) => {
  const [classification, setClassification] = useState<ImageClassificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType>(tag.wasteType);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>(tag.severity);
  const [overrideNotes, setOverrideNotes] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);

  const handleClassify = async () => {
    let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('trashtag_token') : null);
    if (!activeToken) {
      activeToken = 'demo-jwt-token-user';
    }
    setLoading(true);
    setError(null);
    try {
      const data = await classifyTrashTagApi(tag.id, activeToken);
      setClassification(data);
    } catch (err: any) {
      console.error('Classification error:', err);
      if (err.message && err.message.includes('Authentication required')) {
        setError('Authentication Required: Please log in or select a Demo Role from the top menu.');
      } else {
        setError(err.message || 'Failed to run AI image classification');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('trashtag_token') : null);
    if (!activeToken) {
      activeToken = 'demo-jwt-token-user';
    }
    setSubmittingOverride(true);
    setError(null);
    try {
      const updatedTag = await overrideClassificationApi(
        tag.id,
        {
          wasteType: selectedWasteType,
          severity: selectedSeverity,
          notes: overrideNotes.trim() || 'Manual user override from AI inspection panel',
        },
        activeToken
      );
      if (onTagUpdated) onTagUpdated(updatedTag);
      setShowOverrideModal(false);
    } catch (err: any) {
      console.error('Override error:', err);
      setError(err.message || 'Failed to apply classification override');
    } finally {
      setSubmittingOverride(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              AI Image Classification
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Gemini Vision / Mock
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Automated visual analysis of evidence photo</p>
          </div>
        </div>

        <button
          onClick={handleClassify}
          disabled={loading}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
          {classification ? 'Re-Analyze' : 'Analyze Image'}
        </button>
      </div>

      {/* Ground Truth Warning Pill */}
      <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">
            {classification?.disclaimer || 'AI-generated estimate. Not ground truth.'}
          </span>
        </div>
        <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-bold">Disclaimer</span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>{error}</span>
          {!token && (
            <button
              onClick={() => {
                const demoUser = {
                  id: 'demo-uuid-user',
                  name: 'Anika Rao',
                  email: 'anika.rao@trashtag.dev',
                  role: 'USER' as const,
                };
                localStorage.setItem('trashtag_token', 'demo-jwt-token-user');
                localStorage.setItem('trashtag_user', JSON.stringify(demoUser));
                window.location.reload();
              }}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs whitespace-nowrap shadow-md flex items-center gap-1 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Use Demo Scout Session</span>
            </button>
          )}
        </div>
      )}

      {/* Main Analysis Body */}
      {classification ? (
        <div className="space-y-4 pt-1">
          {/* Category Breakdown Bars */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Waste Category Breakdown
            </h4>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {Object.entries(classification.wasteCategories).map(([cat, percentage]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="font-bold text-emerald-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid: Severity & Confidence */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                Suggested Severity
              </span>
              <span className="text-sm font-bold text-amber-400">{classification.severitySuggestion}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                Confidence Score
              </span>
              <span className="text-sm font-bold text-purple-400">
                {Math.round(classification.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Detected Objects Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Detected Objects
            </span>
            <div className="flex flex-wrap gap-1.5">
              {classification.detectedObjects.map((obj, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium font-mono"
                >
                  #{obj}
                </span>
              ))}
            </div>
          </div>

          {/* Explanation Text */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-purple-300 block mb-1">Visual Rationale:</span>
            {classification.explanation}
          </div>

          {/* Override Trigger Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              Override AI Classification
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed p-6 text-center text-slate-600 dark:text-slate-400 text-xs space-y-2">
          <Bot className="w-8 h-8 text-purple-400/60 mx-auto animate-pulse" />
          <p className="font-medium text-slate-700 dark:text-slate-300">Click "Analyze Image" to run AI visual classification</p>
          <p className="text-[11px] text-slate-500">Estimates waste composition, severity rating, and detected objects</p>
        </div>
      )}

      {/* OVERRIDE CLASSIFICATION MODAL */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                Override AI Classification
              </h3>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Waste Type</label>
                <select
                  value={selectedWasteType}
                  onChange={(e) => setSelectedWasteType(e.target.value as WasteType)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="PLASTIC">PLASTIC</option>
                  <option value="ELECTRONIC">ELECTRONIC</option>
                  <option value="ORGANIC">ORGANIC</option>
                  <option value="CONSTRUCTION">CONSTRUCTION</option>
                  <option value="MIXED">MIXED</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Severity Rating</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as Severity)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Override Reason / Notes</label>
                <textarea
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Explain why the AI classification is being overridden..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingOverride ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Save Classification Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
