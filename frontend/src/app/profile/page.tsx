'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Footer } from '@/components/layout/Footer';
import {
  User,
  Camera,
  Settings,
  LogOut,
  ShieldCheck,
  Award,
  Trophy,
  MapPin,
  Recycle,
  Eye,
  Activity,
  CheckCircle2,
  Lock,
  Edit3,
  Sparkles,
  Building,
  HeartHandshake,
  Upload,
  X,
  Check,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile editable states
  const [avatarUrl, setAvatarUrl] = useState<string>(PRESET_AVATARS[0]);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  // Profile organization details
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Alex Chen',
    category: 'NSS Volunteer',
    institution: 'BVRIT Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    interests: ['Waste Cleanup', 'Plastic Reduction', 'Water Body Cleanup', 'Monitoring & Verification'],
    roles: ['Report Waste Hotspots', 'Join Cleanup Missions', 'Monitor Cleaned Locations'],
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setPhotoModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({ ...editForm });
    setEditProfileOpen(false);
  };

  const handleSaveSettings = () => {
    setProfileData((prev) => ({
      ...prev,
      category: editForm.category,
      institution: editForm.institution,
      city: editForm.city,
      state: editForm.state,
      country: editForm.country,
    }));
    setSettingsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8">
        
        {/* Top Header Card matching Image 2 */}
        <section className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Info & Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Avatar with Camera Badge */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-emerald-500/50 shadow-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profileData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-3xl font-black">
                      {profileData.name.charAt(0)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-110"
                  title="Change Profile Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name & Metadata Pills */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {profileData.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      {user?.role || 'VOLUNTEER'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {profileData.institution} • {profileData.city}, {profileData.state}
                  </p>
                </div>

                {/* Badges / Status Pills matching Image 2 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold">
                    DEMO DATA
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-[11px] font-mono font-bold">
                    VOLUNTEER ({profileData.institution})
                  </span>
                  <button
                    onClick={() => setPhotoModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                  >
                    <Camera className="w-3 h-3" /> Change Photo
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 742 Impact Pts
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-mono font-medium">
                    Joined 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action Controls matching Image 2 & User Request #3 */}
            <div className="flex flex-wrap md:flex-col items-stretch md:items-end gap-2.5 w-full md:w-auto">
              {/* Clicking Public Profile button takes user directly to Settings Modal */}
              <button
                onClick={() => {
                  setEditForm({ ...profileData });
                  setSettingsModalOpen(true);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                  publicProfile
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                title="Configure Public Profile in Settings"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{publicProfile ? '🔓 Public Profile On' : '🔒 Public Profile Off (Enable in Settings)'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setEditForm({ ...profileData });
                    setSettingsModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={logout}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 6 Key Stat Cards Grid matching Image 2 */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>HOTSPOTS REPORTED</span>
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">8</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-2 inline-block w-fit">
              USER-REPORTED
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>MISSIONS JOINED</span>
                <Recycle className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">12</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-2 inline-block w-fit">
              VOLUNTEER
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-emerald-500/30 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>COMPLETED</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">12</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-2 inline-block w-fit border border-emerald-500/20">
              VERIFIED
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>RECOVERED</span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">4</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-2 inline-block w-fit">
              SITES
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>WASTE RECORDED</span>
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">340 kg</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-2 inline-block w-fit">
              MEASURED
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                <span>CHAIN LENGTH</span>
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">4 Links</div>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mt-2 inline-block w-fit border border-amber-500/20">
              CONNECTED
            </span>
          </div>

        </section>

        {/* Organization & Community Profile Card matching Image 2 */}
        <section className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
              <Building className="w-5 h-5 text-emerald-500" />
              <span>Organization & Community Profile</span>
            </div>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Participant Category</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{profileData.category}</p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Institution / Organization</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{profileData.institution}</p>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Base Location</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{profileData.city}, {profileData.state}, {profileData.country}</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Environmental Interests */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-500" /> Environmental Focus Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 text-xs font-semibold"
                  >
                    🌱 {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Community Roles */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Active Platform Roles
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData.roles.map((role, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/80 text-xs font-semibold"
                  >
                    ⚡ {role}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Community Badges Grid Section matching Image 2 */}
        <section className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Community Badges & Achievements
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Unlocked through verified on-ground reporting, cleanups, and biweekly surveillance.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
              4 / 7 Unlocked
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Unlocked 1 */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 p-4 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🛡️</span>
                <span className="p-1 bg-emerald-500 text-white rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">First Responder</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Tagged 1st waste hotspot with AI classification.</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">Unlocked</span>
            </div>

            {/* Unlocked 2 */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 p-4 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🧹</span>
                <span className="p-1 bg-emerald-500 text-white rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Master Cleaner</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Participated in 10+ verified cleanup missions.</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">Unlocked</span>
            </div>

            {/* Unlocked 3 */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 p-4 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl">👁️</span>
                <span className="p-1 bg-emerald-500 text-white rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Hawk Eye</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Completed 5 successful biweekly inspections.</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">Unlocked</span>
            </div>

            {/* Unlocked 4 */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 p-4 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🌿</span>
                <span className="p-1 bg-emerald-500 text-white rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Eco Hero</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Reached 500+ total environmental impact points.</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block pt-1">Unlocked</span>
            </div>

            {/* Locked 1 */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 relative opacity-85">
              <div className="flex items-center justify-between">
                <span className="text-3xl filter grayscale opacity-60">🏆</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Recovery Champion</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Verify 5 full hotspot 90-day recoveries.</p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Progress</span>
                  <span>4 / 5 (80%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[80%]"></div>
                </div>
              </div>
            </div>

            {/* Locked 2 */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 relative opacity-85">
              <div className="flex items-center justify-between">
                <span className="text-3xl filter grayscale opacity-60">🔗</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Chain Master</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Build a 10-link unbroken recovery audit chain.</p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Progress</span>
                  <span>4 / 10 (40%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[40%]"></div>
                </div>
              </div>
            </div>

            {/* Locked 3 */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-2 relative opacity-85">
              <div className="flex items-center justify-between">
                <span className="text-3xl filter grayscale opacity-60">👑</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Community Leader</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Lead 3 community missions as coordinator.</p>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Progress</span>
                  <span>1 / 3 (33%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[33%]"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ── Account & Community Settings Modal (User Request #2 & Image 1) ───────────────── */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    Account & Community Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Manage theme, organization & privacy preferences
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: APPEARANCE & COLOR THEME */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                APPEARANCE & COLOR THEME
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Light Theme Option */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
                    theme === 'light'
                      ? 'border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sun className="w-5 h-5 text-amber-500" />
                    {theme === 'light' && <Check className="w-4 h-4 text-emerald-500 font-bold" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Light Theme</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean high-contrast daytime UI</p>
                  </div>
                </button>

                {/* Dark Theme Option */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
                    theme === 'dark'
                      ? 'border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Moon className="w-5 h-5 text-purple-400" />
                    {theme === 'dark' && <Check className="w-4 h-4 text-emerald-500 font-bold" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Dark Theme</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Low-glare climate-tech style</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Section 2: ORGANIZATION & COMMUNITY PROFILE */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-500" /> ORGANIZATION & COMMUNITY PROFILE
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Participant Type
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="NSS Volunteer">NSS Volunteer</option>
                    <option value="Student Steward">Student Steward</option>
                    <option value="Community Member">Community Member</option>
                    <option value="Municipal Verifier">Municipal Verifier</option>
                    <option value="NGO Partner">NGO Partner</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Institution / College Name
                  </label>
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Country</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: PRIVACY & LEADERBOARD VISIBILITY */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase block">
                PRIVACY & LEADERBOARD VISIBILITY
              </span>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Public Profile Visibility</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {publicProfile
                      ? 'Your activity statistics are publicly visible on community leaderboards.'
                      : 'Your activity statistics remain private to your local account.'}
                  </p>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setPublicProfile(!publicProfile)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    publicProfile ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      publicProfile ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Preferences Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Done & Save Preferences
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Change Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setPhotoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" /> Update Profile Photo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a custom photo from your device or choose a preset avatar.
              </p>
            </div>

            {/* Custom Upload Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 block">
                Upload From Device
              </label>
              <label className="w-full py-4 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload photo</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Preset Avatars */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 block">
                Or Select Preset Avatar
              </label>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAvatarUrl(url);
                      setPhotoModalOpen(false);
                    }}
                    className={`rounded-2xl overflow-hidden border-2 transition-all aspect-square ${
                      avatarUrl === url ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setEditProfileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" /> Edit Profile Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your participant category, institution, base location, and roles.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Participant Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Institution / Organization</label>
                <input
                  type="text"
                  value={editForm.institution}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/30"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
