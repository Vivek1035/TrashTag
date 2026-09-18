'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TrashTag } from '@/types/trashtag';
import {
  completeMissionApi,
  fetchMissionById,
  fetchTrashTagById,
  Mission,
} from '@/services/api';

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in metres
}

export default function FieldModePage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params?.missionId as string;
  const { token } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [tag, setTag] = useState<TrashTag | null>(null);
  const [loading, setLoading] = useState(true);

  // GPS Location Check State
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'at_location' | 'away' | 'unavailable'>('checking');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  // Cleanup Session State
  const [cleanupStarted, setCleanupStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Waste breakdown inputs
  const [plasticKg, setPlasticKg] = useState<number>(0);
  const [organicKg, setOrganicKg] = useState<number>(0);
  const [metalKg, setMetalKg] = useState<number>(0);
  const [glassKg, setGlassKg] = useState<number>(0);
  const [otherKg, setOtherKg] = useState<number>(0);

  // Photo & Notes
  const [afterImageUrl, setAfterImageUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  // Recalculate client total for immediate UX feedback
  const totalKg = Math.max(0, plasticKg) + Math.max(0, organicKg) + Math.max(0, metalKg) + Math.max(0, glassKg) + Math.max(0, otherKg);

  const loadData = async () => {
    if (!missionId) return;
    setLoading(true);
    try {
      const m = await fetchMissionById(missionId, token || undefined);
      setMission(m);
      if (m.trashTagId) {
        const t = await fetchTrashTagById(m.trashTagId);
        setTag(t);
        checkLocation(m.meetingLatitude || t.latitude, m.meetingLongitude || t.longitude);
      } else {
        checkLocation(m.meetingLatitude || 37.7749, m.meetingLongitude || -122.4194);
      }
    } catch (err: any) {
      console.error('Error loading mission in field mode:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkLocation = (targetLat?: number, targetLng?: number) => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      return;
    }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!targetLat || !targetLng) {
          setGpsStatus('at_location');
          return;
        }
        const dist = calculateHaversineDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          targetLat,
          targetLng
        );
        setDistanceMeters(Math.round(dist));
        if (dist <= 500) {
          setGpsStatus('at_location');
        } else {
          setGpsStatus('away');
        }
      },
      (err) => {
        console.warn('Geolocation permission error or unavailable:', err.message);
        setGpsStatus('unavailable');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    loadData();
  }, [missionId, token]);

  const handleStartCleanup = () => {
    setCleanupStarted(true);
    setStartTime(new Date());
  };

  const handleSubmitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ text: 'Please sign in to submit cleanup recovery results.', type: 'error' });
      return;
    }
    if (totalKg <= 0) {
      setMessage({ text: 'Please log at least 1 kg of recovered waste across categories.', type: 'error' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await completeMissionApi(
        missionId,
        {
          plasticKg,
          organicKg,
          metalKg,
          glassKg,
          otherKg,
          totalKg,
          afterImageUrl: afterImageUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        token
      );
      setCompletedSuccess(true);
      setMessage({ text: 'Mission completed! Waste record saved and TrashTag set to CLEANUP_COMPLETED 🎉', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to submit mission completion', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Initializing Field Mode...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 text-center flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-white">Mission Not Found</h2>
        <p className="text-slate-400 text-sm mt-1">Could not locate active mission details.</p>
        <Link href="/missions" className="mt-4 px-4 py-2 bg-slate-800 text-emerald-400 rounded-lg text-sm">
          ← Back to Missions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto min-w-[320px] pb-12">
      {/* Mobile Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <Link href={`/missions/${mission.id}`} className="text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-emerald-400 uppercase">Field Mode</span>
        </div>
        <button
          onClick={() => checkLocation(mission.meetingLatitude || tag?.latitude, mission.meetingLongitude || tag?.longitude)}
          className="text-xs text-slate-400 hover:text-emerald-400"
          title="Refresh GPS"
        >
          🔄 GPS
        </button>
      </header>

      {/* Main Container */}
      <main className="p-4 space-y-5">
        {/* Mission Brief Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            {tag?.tagCode ? (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
                {tag.tagCode}
              </span>
            ) : (
              <span className="text-xs text-slate-500">Mission</span>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                mission.status === 'COMPLETED'
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
              }`}
            >
              {mission.status}
            </span>
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-white leading-tight">{mission.title}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{mission.meetingPoint || tag?.address || 'Site Location'}</span>
            </p>
          </div>

          {/* GPS Proximity Status Badge */}
          <div className="pt-2 border-t border-slate-800/80">
            {gpsStatus === 'checking' && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking GPS location...</span>
              </div>
            )}
            {gpsStatus === 'at_location' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 p-2.5 rounded-lg">
                <span>📍</span>
                <span>At mission location (GPS Verified)</span>
              </div>
            )}
            {gpsStatus === 'away' && (
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/40 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>🚶</span>
                  <span>Move closer to mission location</span>
                </div>
                {distanceMeters && <span className="text-[10px] opacity-80">{distanceMeters}m away</span>}
              </div>
            )}
            {gpsStatus === 'unavailable' && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                <span>⚠️</span>
                <span>GPS location permission unavailable — manual field mode override</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Feedback Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold transition-all ${
              message.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/90 border-red-500/50 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Completion Success View */}
        {completedSuccess ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto border border-emerald-500/40">
              🎉
            </div>
            <h2 className="text-xl font-bold text-white">Cleanup Operation Complete!</h2>
            <p className="text-xs text-slate-300">
              You recovered <strong className="text-emerald-400 font-bold">{totalKg} kg</strong> of waste. TrashTag status updated to <strong className="text-emerald-400">CLEANUP_COMPLETED</strong>.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg text-[11px] text-slate-400 text-left border border-slate-800 space-y-1">
              <p className="font-semibold text-slate-300">Next Stage in Lifecycle:</p>
              <p>✓ Recovery Verification (Field verifiers will conduct on-site audit before setting RECOVERY_VERIFIED).</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/recovery/${mission.trashTagId}`}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all text-center"
              >
                View Hotspot Lifecycle Page →
              </Link>
              <Link
                href="/missions"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl text-center"
              >
                Back to Missions
              </Link>
            </div>
          </div>
        ) : !cleanupStarted && mission.status !== 'COMPLETED' ? (
          /* Start Cleanup Action Card */
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center space-y-4 shadow-lg">
            <div className="text-3xl">🧹</div>
            <h2 className="text-lg font-bold text-white">Ready to Begin Cleanup?</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate Field Mode to track waste collection in real-time, log category breakdown, and submit photo evidence upon completion.
            </p>
            <button
              onClick={handleStartCleanup}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              ⚡ Start Cleanup Session
            </button>
          </div>
        ) : (
          /* Active Waste Collector & Completion Form */
          <form onSubmit={handleSubmitComplete} className="space-y-5">
            {/* Header UX Weight Display */}
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Recovered</span>
                <div className="text-2xl font-extrabold text-white">
                  {totalKg} <span className="text-sm font-normal text-slate-400">kg</span>
                </div>
              </div>
              {startTime && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Session</span>
                  <p className="text-xs font-mono font-bold text-slate-300">
                    Started {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>

            {/* Category Breakdown Inputs */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Log Waste Category Breakdown (Kg)
              </h3>

              {/* Plastic */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍾</span>
                  <span className="text-xs font-semibold text-slate-200">Plastic Waste</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlasticKg((v) => Math.max(0, v - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={plasticKg}
                    onChange={(e) => setPlasticKg(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPlasticKg((v) => v + 5)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Organic */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍂</span>
                  <span className="text-xs font-semibold text-slate-200">Organic / Debris</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrganicKg((v) => Math.max(0, v - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={organicKg}
                    onChange={(e) => setOrganicKg(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setOrganicKg((v) => v + 5)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Metal */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥫</span>
                  <span className="text-xs font-semibold text-slate-200">Metal & Cans</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMetalKg((v) => Math.max(0, v - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={metalKg}
                    onChange={(e) => setMetalKg(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMetalKg((v) => v + 5)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Glass */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍾</span>
                  <span className="text-xs font-semibold text-slate-200">Glass Waste</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGlassKg((v) => Math.max(0, v - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={glassKg}
                    onChange={(e) => setGlassKg(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setGlassKg((v) => v + 5)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Other */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📦</span>
                  <span className="text-xs font-semibold text-slate-200">Other / Mixed</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtherKg((v) => Math.max(0, v - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={otherKg}
                    onChange={(e) => setOtherKg(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg py-1.5 text-center text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setOtherKg((v) => v + 5)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Photo & Field Notes */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                After-Cleanup Photo Evidence
              </h3>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/after-cleanup.jpg"
                  value={afterImageUrl}
                  onChange={(e) => setAfterImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {afterImageUrl && (
                <div className="relative h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={afterImageUrl} alt="After cleanup preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Field Notes & Comments</label>
                <textarea
                  rows={2}
                  placeholder="Bagged 120 kg, sorted e-waste and metal cans..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || totalKg <= 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-emerald-950/60"
            >
              {submitting ? 'Submitting Field Metrics...' : `Submit Cleanup Recovery (${totalKg} kg)`}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
