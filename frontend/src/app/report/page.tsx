'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createTrashTagApi, CreateTrashTagInput } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Severity, WasteType } from '@/types/trashtag';
import {
  MapPin,
  ArrowLeft,
  PlusCircle,
  ShieldAlert,
  Weight,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Navigation,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

const BENGALURU_PRESETS = [
  { name: 'Bellandur Lake East', lat: 12.9250, lng: 77.6780, address: 'Bellandur Lake East Bank, Bengaluru' },
  { name: 'Ulsoor Lake West', lat: 12.9785, lng: 77.6199, address: 'Ulsoor Lake West Perimeter, Bengaluru' },
  { name: 'Indiranagar 100ft Rd', lat: 12.9719, lng: 77.6412, address: 'Indiranagar 100ft Road Corner, Bengaluru' },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245, address: '5th Block Koramangala, Bengaluru' },
  { name: 'Whitefield Main Rd', lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Road, Bengaluru' },
  { name: 'Sankey Tank Malleswaram', lat: 13.0020, lng: 77.5680, address: 'Sankey Tank Road, Malleswaram, Bengaluru' },
];

const DEMO_PHOTO_PRESETS = [
  {
    name: 'Plastic Dump',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'E-Waste Accumulation',
    url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Canal Debris',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Mixed Trash Dump',
    url: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ReportPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Bellandur Lake East Bank, Bengaluru');
  const [latitude, setLatitude] = useState<number>(12.9250);
  const [longitude, setLongitude] = useState<number>(77.6780);
  const [wasteType, setWasteType] = useState<WasteType>('PLASTIC');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [estimatedWasteKg, setEstimatedWasteKg] = useState<number>(150);
  const [beforeImageUrl, setBeforeImageUrl] = useState('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforeImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTagCode, setSuccessTagCode] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof BENGALURU_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setAddress(preset.address);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(Number(position.coords.latitude.toFixed(4)));
          setLongitude(Number(position.coords.longitude.toFixed(4)));
          setAddress(`Current GPS Coordinates (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setErrorMsg('Could not fetch device GPS location. Selected preset instead.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive title for the hotspot.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload: CreateTrashTagInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      latitude,
      longitude,
      address,
      wasteType,
      severity,
      estimatedWasteKg: Number(estimatedWasteKg) || 50,
      beforeImageUrl: beforeImageUrl.trim() || undefined,
    };

    try {
      const created = await createTrashTagApi(payload, token || undefined);
      setSuccessTagCode(created.tagCode || created.id);
      setTimeout(() => {
        router.push(`/recovery/${created.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to report hotspot:', err);
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-3 lg:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Map</span>
          </Link>

          <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>

          <h1 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Tag New Trash Hotspot</span>
          </h1>
        </div>

        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono hidden md:inline">
          GPS Verified Reporting
        </span>
      </div>

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Report an Illegal Dump or Waste Hotspot</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Submit location details and evidence. TrashTag generates a verifiable audit code for community cleanup and AI prevention.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successTagCode && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Hotspot reported successfully! Tag Code: <strong>#{successTagCode}</strong>. Redirecting to recovery page...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Hotspot Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bellandur Lake Plastic Dump & Debris"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the waste type, accumulation extent, hazards, or dumping pattern..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Waste Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Waste Category
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as WasteType)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PLASTIC">Plastic Waste</option>
                  <option value="ORGANIC">Organic / Food Waste</option>
                  <option value="EWASTE">Electronic Waste (E-Waste)</option>
                  <option value="HAZARDOUS">Hazardous / Medical</option>
                  <option value="MIXED">Mixed / Construction Debris</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="LOW">LOW — Minor littering</option>
                  <option value="MEDIUM">MEDIUM — Moderate accumulation</option>
                  <option value="HIGH">HIGH — Major dump site</option>
                  <option value="CRITICAL">CRITICAL — Severe hazard / water threat</option>
                </select>
              </div>
            </div>

            {/* Waste Estimate */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-amber-400" />
                <span>Estimated Waste Weight (kg)</span>
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={estimatedWasteKg}
                onChange={(e) => setEstimatedWasteKg(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            {/* Geospatial Location Section */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Hotspot Location Coordinates
                </span>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors font-medium self-start sm:self-auto"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Use Device GPS</span>
                </button>
              </div>

              {/* Presets Grid */}
              <div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-2 font-medium">
                  Select Demo Location Preset (Bengaluru):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BENGALURU_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-2.5 py-2 rounded-xl text-left border text-xs transition-colors truncate ${
                        latitude === p.lat && longitude === p.lng
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      📍 {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-mono">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-mono">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Address / Landmark</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Primary Photo Picker Section */}
            <div className="bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  <span>Primary Photo</span>
                </label>
                {beforeImageUrl && (
                  <button
                    type="button"
                    onClick={() => setBeforeImageUrl('')}
                    className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              {/* Hidden File / Camera Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Live Image Preview Box */}
              {beforeImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group h-56 sm:h-64 flex items-center justify-center">
                  <img
                    src={beforeImageUrl}
                    alt="Primary Hotspot Photo Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 font-mono font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Photo Loaded
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-semibold shadow-md transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3 bg-white dark:bg-slate-900/40">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Photo Selected</p>
                    <p className="text-[11px] text-slate-500">Upload a photo from device, snap with camera, or choose a demo preset below.</p>
                  </div>
                </div>
              )}

              {/* Upload & Camera Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Click Photo / Camera</span>
                </button>
              </div>

              {/* Demo Photo Presets */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mb-2 font-medium">
                  Or select Demo Photo Preset:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBeforeImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border text-left p-1.5 transition-all flex flex-col items-center gap-1 group ${
                        beforeImageUrl === preset.url
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <Link
                href="/explore"
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Hotspot Report...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit TrashTag Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

