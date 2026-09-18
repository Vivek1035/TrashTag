'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchMissionById,
  fetchMissionParticipants,
  joinMissionApi,
  leaveMissionApi,
  startMissionApi,
  Mission,
  Participant,
} from '@/services/api';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params?.id as string;
  const { user, token } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    if (!missionId) return;
    setLoading(true);
    try {
      const [m, pList] = await Promise.all([
        fetchMissionById(missionId, token || undefined),
        fetchMissionParticipants(missionId, token || undefined),
      ]);
      setMission(m);
      setParticipants(pList);
    } catch (err: any) {
      console.error('Failed to load mission:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [missionId, token]);

  const handleJoin = async () => {
    if (!token) {
      setMessage({ text: 'Please sign in to join cleanup missions.', type: 'error' });
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await joinMissionApi(missionId, token);
      setMission(updated);
      const pList = await fetchMissionParticipants(missionId, token);
      setParticipants(pList);
      setMessage({ text: 'Joined mission! +10 XP awarded 🎉', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to join mission', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!token) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await leaveMissionApi(missionId, token);
      setMission(updated);
      const pList = await fetchMissionParticipants(missionId, token);
      setParticipants(pList);
      setMessage({ text: 'Left mission.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to leave mission', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartMission = async () => {
    if (!token) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await startMissionApi(missionId, token);
      setMission(updated);
      setMessage({ text: 'Cleanup mission deployed! TrashTag status set to MISSION_ACTIVE 🚀', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to start mission', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading mission details...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Mission Not Found</h2>
        <p className="text-slate-400 mt-2">The requested cleanup mission could not be located.</p>
        <Link href="/missions" className="mt-4 inline-block px-4 py-2 bg-slate-800 text-emerald-400 rounded-lg">
          ← Back to Missions
        </Link>
      </div>
    );
  }

  const isOrgOrAdmin = user?.role === 'ORGANIZATION' || user?.role === 'ADMIN';
  const progressPct = Math.min(
    100,
    Math.round(((mission.currentParticipantsCount || 0) / (mission.maxParticipants || 1)) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/missions"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          ← Back to Cleanup Missions
        </Link>

        {/* Feedback Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border text-sm font-medium transition-all ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/80 border-red-500/40 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {mission.trashTagCode && (
                  <Link
                    href={`/recovery/${mission.trashTagId}`}
                    className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/60 hover:bg-emerald-900/40 transition-colors"
                  >
                    TrashTag {mission.trashTagCode}
                  </Link>
                )}
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    mission.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                      : mission.status === 'UPCOMING'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {mission.status}
                </span>
              </div>

              {mission.status === 'ACTIVE' && (
                <Link
                  href={`/recovery/${mission.trashTagId}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-950/50 animate-pulse"
                >
                  ⚡ Open Field Mode
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{mission.title}</h1>
            <p className="text-slate-300 text-base leading-relaxed">
              {mission.description || 'No detailed mission description provided.'}
            </p>
          </div>

          {/* Key Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Scheduled Date & Time</span>
              <p className="text-sm font-semibold text-slate-200">
                {new Date(mission.scheduledDate).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-semibold">Meeting Point</span>
              <p className="text-sm font-semibold text-slate-200">
                {mission.meetingPoint || 'To be announced on location'}
              </p>
            </div>

            {mission.equipmentNeeded && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">Required Equipment & Safety Gear</span>
                <p className="text-sm text-emerald-400 font-medium">{mission.equipmentNeeded}</p>
              </div>
            )}

            {mission.creatorName && (
              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Organized by <strong className="text-slate-200">{mission.creatorName}</strong></span>
                <span>Created {new Date(mission.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Volunteer Progress & Roster */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100">Volunteer Roster</h3>
              <span className="text-xs font-semibold text-slate-400">
                {mission.currentParticipantsCount || 0} / {mission.maxParticipants} Volunteers Signed Up
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {participants.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No volunteers signed up yet. Be the first to join!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-slate-950/60 px-3.5 py-2.5 rounded-lg border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {p.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-200">{p.userName}</span>
                    </div>

                    {p.checkedIn ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                        Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Joined</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {isOrgOrAdmin && mission.status === 'UPCOMING' && (
              <button
                onClick={handleStartMission}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-950/40"
              >
                {actionLoading ? 'Deploying...' : '🚀 Start Mission & Deploy Volunteers'}
              </button>
            )}

            {mission.joinedByCurrentUser ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 border border-slate-700 font-bold text-sm rounded-lg transition-all"
              >
                {actionLoading ? 'Processing...' : 'Leave Mission'}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={
                  actionLoading || (mission.currentParticipantsCount || 0) >= mission.maxParticipants
                }
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-950/40"
              >
                {actionLoading
                  ? 'Processing...'
                  : (mission.currentParticipantsCount || 0) >= mission.maxParticipants
                  ? 'Mission Full'
                  : 'Join Mission (+10 XP)'}
              </button>
            )}

            {mission.trashTagId && (
              <Link
                href={`/recovery/${mission.trashTagId}`}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline"
              >
                View Associated TrashTag Page →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

