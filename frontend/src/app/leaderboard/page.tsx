'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchLeaderboardApi, LeaderboardResponse, LeaderboardUser } from '@/services/api';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  Activity,
  Recycle,
  ShieldCheck,
  Compass,
  MapPin,
  Scale,
  Sparkles,
  Info,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaderboardApi();
      setData(res);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const topThree = data?.rankings.slice(0, 3) || [];
  const remaining = data?.rankings.slice(3) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <Recycle className="w-6 h-6 text-emerald-400 animate-spin-slow" />
            <span className="tracking-tight text-white">Trash<span className="text-emerald-400">Tag</span></span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              Explore
            </Link>
            <Link
              href="/missions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Recycle className="w-4 h-4 text-teal-400" />
              Missions
            </Link>
            <Link
              href="/monitoring"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Surveillance
            </Link>
            <Link
              href="/timeline"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Timeline
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-amber-400 bg-amber-950/50 border border-amber-800/60"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" /> Action-Based Gamification & Impact
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Environmental Impact Leaderboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Honoring community volunteers, field verifiers, and environmental stewards derived strictly from verified ecological actions.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-md text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            Refresh Ranks
          </button>
        </div>

        {/* Global Impact Summary Bar (Separate Impact Metrics from Gamification) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 shadow-lg">
            <div className="text-xs text-amber-400 font-medium flex items-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5" /> Total Points
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {data ? data.globalTotalScore.toLocaleString() : '0'} <span className="text-xs text-slate-400">XP</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Hotspot Reports
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? data.globalTotalReports.toLocaleString() : '0'}
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Recycle className="w-3.5 h-3.5 text-teal-400" /> Missions Joined
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? data.globalTotalMissions.toLocaleString() : '0'}
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Scale className="w-3.5 h-3.5 text-cyan-400" /> Waste Recovered
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {data ? Math.round(data.globalTotalWasteRecoveredKg).toLocaleString() : '0'} <span className="text-xs text-slate-400">kg</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Sites Recovered
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data ? data.globalTotalRecoveries.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        {/* Scoring Rules Banner */}
        <div className="mb-10 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Official Scoring Rules (Server Verified):</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Verified Report: <strong className="text-amber-400">+20 pts</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Mission Joined: <strong className="text-teal-400">+10 pts</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Cleanup Completed: <strong className="text-emerald-400">+30 pts</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Recovery Verified: <strong className="text-green-400">+50 pts</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Monitoring Completed: <strong className="text-sky-400">+20 pts</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
              Transformation Completed: <strong className="text-purple-400">+50 pts</strong>
            </span>
          </div>
        </div>

        {/* Top 3 Winners Podium */}
        {!loading && topThree.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" /> Top Community Stewards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div
                  onClick={() => setSelectedUser(topThree[1])}
                  className="cursor-pointer group bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-700/80 shadow-xl hover:border-slate-500 transition-all duration-300 relative flex flex-col items-center text-center order-2 md:order-1"
                >
                  <div className="absolute -top-4 px-3 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs font-bold border border-slate-500 flex items-center gap-1 shadow-md">
                    <Medal className="w-3.5 h-3.5 text-slate-300" /> #2 Silver
                  </div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-400 shadow-lg mb-3 mt-2">
                    <img src={topThree[1].avatarUrl} alt={topThree[1].displayName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {topThree[1].displayName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">@{topThree[1].username}</p>
                  <div className="text-xl font-black text-amber-400 font-mono mb-3">
                    {topThree[1].points} <span className="text-xs text-slate-400">XP</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {topThree[1].badges.map((b) => (
                      <span key={b.id} title={b.description} className="text-sm bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                        {b.icon}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Podium - Prominent) */}
              {topThree[0] && (
                <div
                  onClick={() => setSelectedUser(topThree[0])}
                  className="cursor-pointer group bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-8 rounded-3xl border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 hover:border-amber-400 transition-all duration-300 relative flex flex-col items-center text-center order-1 md:order-2 md:-translate-y-4"
                >
                  <div className="absolute -top-5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xl">
                    <Crown className="w-4 h-4 fill-slate-950" /> #1 Champion
                  </div>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl mb-3 mt-2">
                    <img src={topThree[0].avatarUrl} alt={topThree[0].displayName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-extrabold text-white text-lg group-hover:text-amber-400 transition-colors">
                    {topThree[0].displayName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">@{topThree[0].username}</p>
                  <div className="text-3xl font-black text-amber-400 font-mono mb-4">
                    {topThree[0].points} <span className="text-sm text-slate-400">XP</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {topThree[0].badges.map((b) => (
                      <span key={b.id} title={b.description} className="text-base bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                        {b.icon} {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div
                  onClick={() => setSelectedUser(topThree[2])}
                  className="cursor-pointer group bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-amber-900/60 shadow-xl hover:border-amber-700 transition-all duration-300 relative flex flex-col items-center text-center order-3"
                >
                  <div className="absolute -top-4 px-3 py-0.5 rounded-full bg-amber-900/80 text-amber-200 text-xs font-bold border border-amber-700 flex items-center gap-1 shadow-md">
                    <Medal className="w-3.5 h-3.5 text-amber-400" /> #3 Bronze
                  </div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-700 shadow-lg mb-3 mt-2">
                    <img src={topThree[2].avatarUrl} alt={topThree[2].displayName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {topThree[2].displayName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">@{topThree[2].username}</p>
                  <div className="text-xl font-black text-amber-400 font-mono mb-3">
                    {topThree[2].points} <span className="text-xs text-slate-400">XP</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {topThree[2].badges.map((b) => (
                      <span key={b.id} title={b.description} className="text-sm bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                        {b.icon}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Full Roster Rankings
            </h3>
            <span className="text-xs text-slate-400">Derived from verified DB actions</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading rankings data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Volunteer Steward</th>
                    <th className="py-4 px-6">Environmental Score</th>
                    <th className="py-4 px-6 text-center">Reports</th>
                    <th className="py-4 px-6 text-center">Missions</th>
                    <th className="py-4 px-6 text-center">Waste Recovered</th>
                    <th className="py-4 px-6 text-center">Site Recoveries</th>
                    <th className="py-4 px-6">Earned Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {data?.rankings.map((u) => (
                    <tr
                      key={u.userId}
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-300">
                        {u.rank === 1 && <span className="text-amber-400">🥇 #1</span>}
                        {u.rank === 2 && <span className="text-slate-300">🥈 #2</span>}
                        {u.rank === 3 && <span className="text-amber-600">🥉 #3</span>}
                        {u.rank > 3 && <span>#{u.rank}</span>}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} alt={u.displayName} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                          <div>
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {u.displayName}
                            </div>
                            <div className="text-xs text-slate-400">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-amber-400 text-base">
                        {u.points.toLocaleString()} <span className="text-xs text-slate-400 font-normal">XP</span>
                      </td>

                      <td className="py-4 px-6 text-center font-mono text-slate-300">{u.reports}</td>
                      <td className="py-4 px-6 text-center font-mono text-slate-300">{u.missions}</td>
                      <td className="py-4 px-6 text-center font-mono text-emerald-400 font-semibold">
                        {Math.round(u.wasteRecoveredKg)} kg
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-green-400 font-semibold">{u.recoveries}</td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {u.badges.length > 0 ? (
                            u.badges.map((b) => (
                              <span
                                key={b.id}
                                title={`${b.name}: ${b.description}`}
                                className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
                              >
                                {b.icon} <span className="hidden xl:inline">{b.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No badges earned yet</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* User Impact & Badge Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img src={selectedUser.avatarUrl} alt={selectedUser.displayName} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-lg" />
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedUser.displayName}</h3>
                <p className="text-sm text-slate-400">@{selectedUser.username} • Rank #{selectedUser.rank}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Environmental Score</span>
                <span className="text-lg font-black text-amber-400 font-mono">{selectedUser.points} XP</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Waste Recovered</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{Math.round(selectedUser.wasteRecoveredKg)} kg</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Hotspot Reports</span>
                <span className="text-lg font-bold text-white font-mono">{selectedUser.reports}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-0.5">Missions Joined</span>
                <span className="text-lg font-bold text-white font-mono">{selectedUser.missions}</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Action-Derived Badges ({selectedUser.badges.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedUser.badges.length > 0 ? (
                selectedUser.badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {b.name}
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30">
                          {b.level}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{b.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl">
                  No action-derived badges earned yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

