'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchMissions, joinMissionApi, leaveMissionApi, Mission } from '@/services/api';

export default function MissionsPage() {
  const { user, token } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus !== 'ALL' ? filterStatus : undefined;
      const data = await fetchMissions({ status: statusParam, token: token || undefined });
      setMissions(data);
    } catch (err: any) {
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, [filterStatus, token]);

  const handleJoin = async (missionId: string) => {
    if (!token) {
      setMessage({ text: 'Please sign in to join cleanup missions.', type: 'error' });
      return;
    }
    setActionLoadingId(missionId);
    setMessage(null);
    try {
      const updated = await joinMissionApi(missionId, token);
      setMissions((prev) => prev.map((m) => (m.id === missionId ? updated : m)));
      setMessage({ text: 'Successfully joined mission! Earned 10 XP points 🎉', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to join mission', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLeave = async (missionId: string) => {
    if (!token) return;
    setActionLoadingId(missionId);
    setMessage(null);
    try {
      const updated = await leaveMissionApi(missionId, token);
      setMissions((prev) => prev.map((m) => (m.id === missionId ? updated : m)));
      setMessage({ text: 'Left mission.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to leave mission', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredMissions = missions.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.trashTagCode?.toLowerCase().includes(q) ||
      m.meetingPoint?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Community Mobilization
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Cleanup Missions
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm sm:text-base">
              Join active field cleanup operations in your area. Mobilize with volunteers, recover hazardous waste, and earn TrashTag XP.
            </p>
          </div>

          {(user?.role === 'ORGANIZATION' || user?.role === 'ADMIN') && (
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-all shadow-lg shadow-emerald-900/30 text-sm shrink-0"
            >
              + Organize New Mission
            </Link>
          )}
        </div>

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

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by title, tag code (e.g. TT-1002), location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Mission Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-900/40 rounded-xl animate-pulse border border-slate-800/60" />
            ))}
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/60">
            <p className="text-slate-400 text-lg font-medium">No cleanup missions found matching your filter.</p>
            <p className="text-slate-500 text-sm mt-1">Explore verified TrashTags on the Explore Map to launch new missions!</p>
            <Link
              href="/explore"
              className="mt-4 inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-semibold rounded-lg border border-slate-700"
            >
              Go to Explore Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => {
              const progressPct = Math.min(
                100,
                Math.round(((mission.currentParticipantsCount || 0) / (mission.maxParticipants || 1)) * 100)
              );

              return (
                <div
                  key={mission.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-emerald-950/20 group"
                >
                  <div className="space-y-4">
                    {/* Status & Tag Code */}
                    <div className="flex items-center justify-between">
                      {mission.trashTagCode ? (
                        <Link
                          href={`/recovery/${mission.trashTagId}`}
                          className="font-mono text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50"
                        >
                          {mission.trashTagCode}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">Global Mission</span>
                      )}

                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
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

                    {/* Mission Title & Description */}
                    <div>
                      <Link href={`/missions/${mission.id}`}>
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {mission.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                        {mission.description || 'Join community volunteers for on-site waste collection and sorting.'}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">📅</span>
                        <span>{new Date(mission.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {mission.meetingPoint && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">📍</span>
                          <span className="truncate">{mission.meetingPoint}</span>
                        </div>
                      )}
                      {mission.creatorName && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-slate-500">👥</span>
                          <span>Organized by <strong className="text-slate-200">{mission.creatorName}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Volunteers Signed Up</span>
                        <span className="font-bold text-slate-200">
                          {mission.currentParticipantsCount || 0} / {mission.maxParticipants}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progressPct >= 100 ? 'bg-emerald-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <Link
                      href={`/missions/${mission.id}`}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </Link>

                    {mission.status === 'ACTIVE' ? (
                      <Link
                        href={`/recovery/${mission.trashTagId}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/40 animate-pulse"
                      >
                        ⚡ Open Field Mode
                      </Link>
                    ) : mission.joinedByCurrentUser ? (
                      <button
                        onClick={() => handleLeave(mission.id)}
                        disabled={actionLoadingId === mission.id}
                        className="px-4 py-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-300 border border-slate-700 text-xs font-bold rounded-lg transition-all"
                      >
                        {actionLoadingId === mission.id ? 'Leaving...' : 'Leave Mission'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(mission.id)}
                        disabled={
                          actionLoadingId === mission.id ||
                          (mission.currentParticipantsCount || 0) >= mission.maxParticipants
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/30"
                      >
                        {actionLoadingId === mission.id
                          ? 'Joining...'
                          : (mission.currentParticipantsCount || 0) >= mission.maxParticipants
                          ? 'Mission Full'
                          : 'Join Mission'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

