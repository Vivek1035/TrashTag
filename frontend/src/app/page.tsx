'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserNavHeader } from '@/components/layout/UserNavHeader';
import { AuthModal } from '@/components/auth/AuthModal';
import { Github, Linkedin } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Metric {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  color: string;
}

interface LifecycleStage {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  bg: string;
}

interface MissionCard {
  tag: string;
  title: string;
  location: string;
  volunteers: number;
  scheduled: string;
  status: 'ACTIVE' | 'UPCOMING';
  waste: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const METRICS: Metric[] = [
  { label: 'Hotspots Reported', value: '1,240', icon: '📍', color: 'text-red-400' },
  { label: 'Waste Recovered', value: '74,320', unit: 'kg', icon: '♻️', color: 'text-emerald-400' },
  { label: 'Active Missions', value: '38', icon: '🚀', color: 'text-amber-400' },
  { label: 'Volunteers', value: '3,180', icon: '🧤', color: 'text-sky-400' },
  { label: 'Sites Transformed', value: '192', icon: '🌱', color: 'text-teal-400' },
];

const LIFECYCLE: LifecycleStage[] = [
  { id: 'DETECT', label: 'Detect', icon: '🔭', description: 'Community members identify and photograph illegal dump sites with GPS location data.', color: 'text-red-400', bg: 'bg-red-50/80 dark:bg-red-950/60 border-red-800/50' },
  { id: 'TAG', label: 'Tag', icon: '🏷️', description: 'The site receives a unique TrashTag ID. AI classifies waste type and estimates severity.', color: 'text-orange-400', bg: 'bg-orange-950/60 border-orange-800/50' },
  { id: 'MOBILIZE', label: 'Mobilize', icon: '👥', description: 'Verified reports trigger cleanup missions. Volunteers register, coordinate and prepare.', color: 'text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-800/50' },
  { id: 'RECOVER', label: 'Recover', icon: '♻️', description: 'Field teams log GPS-verified cleanup evidence. Waste records submitted for verifier review.', color: 'text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-800/50' },
  { id: 'PREVENT', label: 'Prevent', icon: '🛡️', description: 'AI generates site-specific prevention strategies. Transformation plans are selected and executed.', color: 'text-teal-400', bg: 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-800/50' },
  { id: 'MONITOR', label: 'Monitor', icon: '🔎', description: '30, 60 and 90-day checkpoints verify the site stays clean. Clean sites reach SUSTAINED status.', color: 'text-sky-400', bg: 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-800/50' },
];

const MISSIONS: MissionCard[] = [
  { tag: 'TT-D04', title: 'Ulsoor Lake Perimeter Waste Drive', location: 'Ulsoor Lake, Bengaluru', volunteers: 18, scheduled: 'In Progress', status: 'ACTIVE', waste: '260 kg mixed' },
  { tag: 'TT-D01', title: 'Bellandur Lake Plastic Recovery', location: 'Bellandur Lake East Bank', volunteers: 9, scheduled: 'Sep 24, 2026', status: 'UPCOMING', waste: '180 kg plastic' },
  { tag: 'TT-D12', title: 'Marathahalli Bridge — Second Recovery', location: 'Outer Ring Road, Bengaluru', volunteers: 6, scheduled: 'Sep 26, 2026', status: 'UPCOMING', waste: '150 kg mixed' },
];

const PROBLEM_STATS = [
  { value: '2.01B', label: 'Tonnes of solid waste generated globally each year', icon: '🗑️' },
  { value: '91%', label: 'Of plastic is never recycled', icon: '⚠️' },
  { value: '90%', label: 'Of river plastic comes from 10 rivers', icon: '🌊' },
  { value: '1M+', label: 'Marine animals killed by plastic annually', icon: '🐋' },
];

// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
        const hasComma = target.includes(',');
        const prefix = target.match(/^[^0-9]*/)?.[0] || '';
        const postfix = target.match(/[^0-9.]+$/)?.[0] || '';
        let start = 0;
        const duration = 1800;
        const step = 16;
        const increment = numeric / (duration / step);
        const timer = setInterval(() => {
          start += increment;
          if (start >= numeric) {
            start = numeric;
            clearInterval(timer);
          }
          const formatted = hasComma
            ? Math.round(start).toLocaleString()
            : start >= 10 ? Math.round(start).toString() : start.toFixed(1);
          setDisplay(`${prefix}${formatted}${postfix}`);
        }, step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Map Preview (SVG-based) ───────────────────────────────────────────────────
function MapPreview() {
  const hotspots = [
    { x: 52, y: 38, status: 'REPORTED', severity: 'HIGH' },
    { x: 34, y: 52, status: 'MISSION_ACTIVE', severity: 'CRITICAL' },
    { x: 68, y: 61, status: 'RECOVERY_VERIFIED', severity: 'MEDIUM' },
    { x: 44, y: 72, status: 'TRANSFORMED', severity: 'LOW' },
    { x: 76, y: 35, status: 'MONITORING', severity: 'HIGH' },
    { x: 25, y: 40, status: 'REPORTED', severity: 'MEDIUM' },
    { x: 60, y: 22, status: 'MISSION_CREATED', severity: 'HIGH' },
    { x: 82, y: 72, status: 'SUSTAINED', severity: 'LOW' },
    { x: 15, y: 65, status: 'CLEANUP_COMPLETED', severity: 'CRITICAL' },
  ];

  const colorMap: Record<string, string> = {
    REPORTED: '#ef4444',
    MISSION_CREATED: '#f97316',
    MISSION_ACTIVE: '#f59e0b',
    CLEANUP_COMPLETED: '#a3e635',
    RECOVERY_VERIFIED: '#10b981',
    TRANSFORMATION_PLANNED: '#06b6d4',
    TRANSFORMED: '#14b8a6',
    MONITORING: '#3b82f6',
    SUSTAINED: '#22c55e',
    REOPENED: '#dc2626',
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-emerald-900/40">
      {/* Dark map base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#060d0f] via-[#0a1628] to-[#061612]" />

      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[10,20,30,40,50,60,70,80,90].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="#10b981" strokeWidth="0.2" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="#10b981" strokeWidth="0.2" />
          </g>
        ))}
      </svg>

      {/* Topographic contour lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="45" ry="35" fill="none" stroke="#10b981" strokeWidth="0.8" />
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="none" stroke="#10b981" strokeWidth="0.6" />
        <ellipse cx="50" cy="50" rx="25" ry="16" fill="none" stroke="#10b981" strokeWidth="0.4" />
        <path d="M 10,60 Q 30,40 50,55 Q 70,70 90,50" fill="none" stroke="#10b981" strokeWidth="0.5" />
        <path d="M 10,70 Q 35,55 55,65 Q 75,75 90,62" fill="none" stroke="#10b981" strokeWidth="0.4" />
      </svg>

      {/* Road network */}
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#94a3b8" strokeWidth="0.8" />
        <line x1="0" y1="25" x2="100" y2="75" stroke="#64748b" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="25" stroke="#64748b" strokeWidth="0.5" />
        <path d="M 20,10 Q 40,30 60,20 Q 80,10 90,40" fill="none" stroke="#64748b" strokeWidth="0.4" />
        <path d="M 10,80 Q 35,65 55,80 Q 75,95 95,75" fill="none" stroke="#64748b" strokeWidth="0.4" />
      </svg>

      {/* Water body */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="30" cy="60" rx="12" ry="8" fill="#0ea5e9" />
        <ellipse cx="70" cy="30" rx="8" ry="5" fill="#0ea5e9" />
        <path d="M 60,70 Q 65,72 70,68 Q 75,64 80,70" fill="#0ea5e9" />
      </svg>

      {/* Hotspot markers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {hotspots.map((h, i) => {
          const color = colorMap[h.status] || '#ef4444';
          return (
            <g key={i}>
              {/* Pulse ring */}
              <circle cx={h.x} cy={h.y} r="3.5" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4">
                <animate attributeName="r" values="3.5;6;3.5" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              {/* Dot */}
              <circle cx={h.x} cy={h.y} r="1.8" fill={color} />
              {/* Pin drop */}
              <circle cx={h.x} cy={h.y - 3} r="2.2" fill={color} />
              <polygon points={`${h.x - 1.5},${h.y - 1.5} ${h.x + 1.5},${h.y - 1.5} ${h.x},${h.y + 1}`} fill={color} />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        {[
          { color: '#ef4444', label: 'Reported' },
          { color: '#f59e0b', label: 'Active' },
          { color: '#10b981', label: 'Verified' },
          { color: '#22c55e', label: 'Sustained' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-600 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Coordinates overlay */}
      <div className="absolute top-3 right-3 font-mono text-[10px] text-emerald-600/60">
        <div>12.9716° N</div>
        <div>77.5946° E</div>
        <div className="mt-1 text-slate-600">BENGALURU</div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
          style={{ animation: 'scanline 4s linear infinite', top: '0%' }}
        />
      </div>
    </div>
  );
}

// ── AI Preview Card ──────────────────────────────────────────────────────────
function AIPreviewCard() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % 4), 2200);
    return () => clearInterval(t);
  }, []);

  const categories = [
    { label: 'Plastic', pct: 72, color: '#f97316' },
    { label: 'Organic', pct: 18, color: '#22c55e' },
    { label: 'Other', pct: 10, color: '#94a3b8' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-lg">🤖</div>
        <div>
          <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Gemini AI Classification</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">TrashTag TT-D02 · HSR Layout E-Waste</div>
        </div>
        <div className="ml-auto px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 rounded text-[10px] text-amber-900 dark:text-amber-300 font-mono font-bold">AI ESTIMATE</div>
      </div>

      {/* Waste categories */}
      <div className="space-y-2">
        {categories.map(({ label, pct, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
              <span style={{ color }} className="font-mono font-semibold">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: phase >= 1 ? `${pct}%` : '0%', backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-1">SEVERITY ESTIMATE</div>
          <div className="text-red-600 dark:text-red-400 font-bold text-lg">CRITICAL</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Confidence 94%</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-1">RISK SCORE</div>
          <div className="text-amber-600 dark:text-amber-400 font-bold text-lg">95/100</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Soil leaching risk HIGH</div>
        </div>
      </div>

      {/* Prevention recommendations */}
      <div className="space-y-2">
        <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">AI PREVENTION RECOMMENDATIONS</div>
        {[
          'Install CPCB-certified e-waste collection hub',
          'Deploy perimeter CCTV deterrence system',
          'Community awareness campaign on e-waste',
        ].map((r, i) => (
          <div key={i} className={`flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">→</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
        ⚠ AI estimates — not ground truth. Human verification required.
      </div>
    </div>
  );
}

// ── Monitoring Preview ────────────────────────────────────────────────────────
function MonitoringPreview() {
  const checkpoints = [
    { day: 30, status: 'COMPLETED', clean: true, date: 'Aug 19' },
    { day: 60, status: 'COMPLETED', clean: true, date: 'Sep 18' },
    { day: 90, status: 'PENDING', clean: null, date: 'Oct 18' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-sky-700 dark:text-sky-400">Site Monitoring</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Jayanagar Community Garden · TT-D08</div>
        </div>
        <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 rounded text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold">MONITORING</div>
      </div>

      <div className="relative">
        {/* Timeline bar */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-300 dark:bg-slate-700" />
        <div className="absolute top-5 left-8 h-0.5 bg-emerald-500 transition-all duration-1000" style={{ width: '60%' }} />

        <div className="flex justify-between relative">
          {checkpoints.map((cp) => (
            <div key={cp.day} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-lg z-10 ${
                cp.status === 'COMPLETED' && cp.clean
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : cp.status === 'PENDING'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                    : 'bg-red-100 dark:bg-red-950 border-red-500 text-red-700 dark:text-red-400'
              }`}>
                {cp.status === 'COMPLETED' ? (cp.clean ? '✓' : '✗') : '⏱'}
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200">{cp.day}d</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">{cp.date}</div>
                <div className={`text-[10px] font-semibold ${
                  cp.status === 'COMPLETED' && cp.clean ? 'text-emerald-700 dark:text-emerald-400' :
                  cp.status === 'PENDING' ? 'text-slate-600 dark:text-slate-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {cp.status === 'COMPLETED' ? 'Clean ✓' : 'Upcoming'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-2.5 text-center">
          <div className="text-emerald-700 dark:text-emerald-400 font-bold text-base">118 kg</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Recovered</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
          <div className="text-sky-700 dark:text-sky-400 font-bold text-base">60</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Days Clean</div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-center">
          <div className="text-amber-700 dark:text-amber-400 font-bold text-base">30d</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Until Final</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <span className="text-emerald-600 dark:text-emerald-400 text-base">🌱</span>
        <span>Site remains clean after 60 days. Final 90-day checkpoint on Oct 18 will confirm <strong className="text-emerald-700 dark:text-emerald-400">SUSTAINED</strong> status.</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setActiveStage(s => (s + 1) % LIFECYCLE.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d0f] text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">

      {/* ── CSS Animations ──────────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0px); opacity: 0.7; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes tag-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up { animation: float-up 3s ease-in-out infinite; }
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-tag-in { animation: tag-in 0.6s ease-out forwards; }
        :root.dark .hero-gradient, html.dark .hero-gradient {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 50%, rgba(20,184,166,0.08) 0%, transparent 60%),
                      #060d0f;
        }
        :root:not(.dark) .hero-gradient, html:not(.dark) .hero-gradient {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 80% 50%, rgba(20,184,166,0.05) 0%, transparent 60%),
                      #f8fafc;
        }
        :root.dark .section-gradient, html.dark .section-gradient {
          background: linear-gradient(180deg, #060d0f 0%, #07100d 50%, #060d0f 100%);
        }
        :root:not(.dark) .section-gradient, html:not(.dark) .section-gradient {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 40px rgba(16,185,129,0.15);
        }
        .lifecycle-connector::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -16px;
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #059669);
          transform: translateY(-50%);
        }
        .demo-badge {
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05));
          border: 1px solid rgba(251,191,36,0.3);
        }
      `}</style>




      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center py-12 lg:py-16 relative overflow-hidden">
        {/* Floating particles */}
        {mounted && [0,1,2,3,4].map(i => (
          <div key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400 animate-float-up"
            style={{
              left: `${20 + i * 16}%`,
              bottom: `${15 + i * 5}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left — Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-800/50 rounded-full text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Environmental Recovery Platform · Bengaluru, India
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              <span className="text-slate-900 dark:text-white">Tag the</span>{' '}
              <span className="text-emerald-400">Problem.</span>
              <br />
              <span className="text-slate-900 dark:text-white">Track the</span>{' '}
              <span className="text-teal-400">Recovery.</span>
              <br />
              <span className="text-slate-900 dark:text-white">Prevent the</span>{' '}
              <span className="text-amber-400">Return.</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              TrashTag turns local pollution hotspots into community recovery missions, verified cleanups, and long-term prevention plans — powered by GPS evidence, AI analysis, and 90-day monitoring.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/report"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-900/50 text-base">
                <span>🏷️</span>
                Tag a Trash Hotspot
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-emerald-800/60 hover:border-emerald-600 text-emerald-300 hover:text-emerald-200 font-semibold rounded-xl transition-all text-base">
                <span>🗺️</span>
                Explore Recovery Map
              </Link>
            </div>

            {/* Mini metrics strip */}
            <div className="flex flex-wrap gap-6 pt-2">
              {METRICS.slice(0, 3).map((m) => (
                <div key={m.label} className="text-center">
                  <div className={`text-2xl font-bold ${m.color}`}>
                    {mounted ? <AnimatedCounter target={m.value} suffix={m.unit ? ` ${m.unit}` : ''} /> : m.value}
                  </div>
                  <div className="text-xs text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Demo data notice */}
            <div className="demo-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-amber-400">
              <span>⚠</span>
              <span>Numbers above are demo data — clearly fictional, not verified impact claims.</span>
            </div>
          </div>

          {/* Right — Map Preview */}
          <div className="relative h-[480px] lg:h-[560px]">
            <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-3xl animate-glow" />
            <MapPreview />

            {/* Floating tag cards */}
            <div className="absolute -right-4 top-8 bg-white dark:bg-[#060f0a] border border-red-800/50 rounded-xl p-3 shadow-2xl max-w-[160px]">
              <div className="text-xs text-red-400 font-semibold">📍 TT-D13</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Construction rubble</div>
              <div className="text-xs text-slate-500">Whitefield · CRITICAL</div>
            </div>

            <div className="absolute -left-4 bottom-16 bg-white dark:bg-[#060f0a] border border-emerald-800/50 rounded-xl p-3 shadow-2xl max-w-[160px]">
              <div className="text-xs text-emerald-400 font-semibold">✓ TT-D11</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">SUSTAINED after 90d</div>
              <div className="text-xs text-slate-500">Malleswaram · Clean</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1. PROBLEM ──────────────────────────────────────────────────────── */}
      <section className="section-gradient py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/50 border border-red-800/40 rounded-full text-xs text-red-400 font-medium">THE PROBLEM</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Waste doesn't disappear when we look away.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Urban pollution hotspots persist because there is no system to tag them, track cleanup accountability, or prevent recurrence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROBLEM_STATS.map((s, i) => (
              <div key={i} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center card-hover shadow-sm">
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {mounted ? <AnimatedCounter target={s.value} /> : s.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-snug">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-3 gap-6">
            {[
              { icon: '🚫', title: 'No Accountability', desc: 'Reports disappear into void. Without structured tracking, the same site gets dumped on repeatedly with no consequence.' },
              { icon: '🔄', title: 'No Prevention', desc: 'Even when cleaned, sites revert. Without root-cause analysis and community ownership, waste returns within 90 days.' },
              { icon: '📊', title: 'No Measurement', desc: 'Impact claims are unverifiable. Without GPS evidence and verifier audits, environmental impact data is meaningless.' },
            ].map((p) => (
              <div key={p.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 card-hover shadow-sm">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-slate-50 dark:bg-[#060d0f] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent opacity-50 dark:opacity-100" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/40 rounded-full text-xs text-emerald-800 dark:text-emerald-400 font-semibold">HOW IT WORKS</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">From sighting to sustained solution.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              TrashTag closes the loop — from initial report all the way through verified recovery, AI-guided prevention, and long-term monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Report a Hotspot', desc: 'Photograph the site with GPS location. AI pre-classifies waste type and severity for verifier review.', icon: '📸', color: 'emerald' },
              { num: '02', title: 'Verify & Mission', desc: 'Trained verifiers confirm the report. Organizations coordinate community cleanup missions.', icon: '✅', color: 'teal' },
              { num: '03', title: 'Recover & Log', desc: 'Field teams submit GPS-stamped evidence and waste weight records. Waste recovery is fully auditable.', icon: '♻️', color: 'sky' },
              { num: '04', title: 'Prevent & Monitor', desc: 'AI generates prevention plans. 30/60/90-day checkpoints verify the site stays clean long-term.', icon: '🛡️', color: 'amber' },
            ].map((step) => (
              <div key={step.num} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 card-hover shadow-sm">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl bg-${step.color}-100 dark:bg-${step.color}-950/80 border border-${step.color}-200 dark:border-${step.color}-800/60`}>
                  {step.icon}
                </div>
                <div className="absolute top-5 right-5 text-5xl font-black text-slate-200 dark:text-slate-700/60 font-mono">{step.num}</div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. RECOVERY LIFECYCLE ─────────────────────────────────────────────── */}
      <section id="lifecycle" className="py-28 section-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-950/50 border border-teal-800/40 rounded-full text-xs text-teal-400 font-medium">RECOVERY LIFECYCLE</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Every TrashTag follows a structured lifecycle.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              No shortcuts. No unverified claims. A site is only declared SUSTAINED after GPS-verified evidence at every stage.
            </p>
          </div>

          {/* Pipeline row — desktop */}
          <div className="hidden lg:flex items-center gap-0 mb-12">
            {LIFECYCLE.map((stage, i) => (
              <div key={stage.id} className="flex-1 flex items-center">
                <button
                  className={`flex-1 relative rounded-xl border p-4 text-center cursor-pointer transition-all duration-300 ${stage.bg} ${activeStage === i ? 'scale-105 shadow-lg shadow-emerald-900/20' : 'opacity-60 hover:opacity-80'}`}
                  onClick={() => setActiveStage(i)}
                >
                  <div className="text-2xl mb-2">{stage.icon}</div>
                  <div className={`text-xs font-bold tracking-widest ${stage.color}`}>{stage.id}</div>
                </button>
                {i < LIFECYCLE.length - 1 && (
                  <div className="w-8 flex-shrink-0 flex items-center justify-center">
                    <div className={`h-0.5 w-full transition-all duration-500 ${i < activeStage ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active stage description */}
          <div className={`lg:block max-w-2xl mx-auto text-center mb-12 p-6 rounded-2xl border transition-all duration-300 ${LIFECYCLE[activeStage].bg}`}>
            <div className="text-4xl mb-3">{LIFECYCLE[activeStage].icon}</div>
            <div className={`text-sm font-bold tracking-widest mb-2 ${LIFECYCLE[activeStage].color}`}>{LIFECYCLE[activeStage].id}</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{LIFECYCLE[activeStage].label}</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{LIFECYCLE[activeStage].description}</p>
          </div>

          {/* Mobile — cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:hidden">
            {LIFECYCLE.map((stage) => (
              <div key={stage.id} className={`rounded-xl border p-4 ${stage.bg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{stage.icon}</span>
                  <span className={`text-xs font-bold tracking-widest ${stage.color}`}>{stage.id}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{stage.description}</p>
              </div>
            ))}
          </div>

          {/* Status badge legend */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {[
              ['REPORTED', '#ef4444'],
              ['VERIFIED', '#f97316'],
              ['MISSION_ACTIVE', '#f59e0b'],
              ['CLEANUP_COMPLETED', '#a3e635'],
              ['RECOVERY_VERIFIED', '#10b981'],
              ['TRANSFORMED', '#14b8a6'],
              ['MONITORING', '#3b82f6'],
              ['SUSTAINED', '#22c55e'],
              ['REOPENED', '#dc2626'],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/40 rounded-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. INTERACTIVE MAP PREVIEW ───────────────────────────────────────── */}
      <section className="py-28 bg-slate-50 dark:bg-[#060d0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950/50 border border-sky-800/40 rounded-full text-xs text-sky-400 font-medium">RECOVERY MAP</div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Every hotspot on the map. Every status tracked.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                The live recovery map shows every TrashTag in real time — color-coded by lifecycle status. Click any marker to see the full recovery story, evidence photos, waste records, and mission details.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '📍', text: 'Filter by waste type, severity, status' },
                  { icon: '🔭', text: 'GPS coordinates verified at every stage' },
                  { icon: '📊', text: 'Aggregated impact metrics per location' },
                  { icon: '🏷️', text: 'Report new hotspots directly from the map' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 text-sm">
                    <span className="text-lg">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/explore"
                className="inline-flex items-center gap-2 px-5 py-3 bg-sky-900/50 hover:bg-sky-800/60 border border-sky-700/50 hover:border-sky-600/60 text-sky-300 font-medium rounded-xl transition-all">
                Open Recovery Map →
              </Link>
            </div>

            <div className="h-[400px] lg:h-[500px]">
              <MapPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. COMMUNITY MISSIONS ─────────────────────────────────────────────── */}
      <section id="missions" className="py-28 section-gradient">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-800/40 rounded-full text-xs text-amber-400 font-medium">COMMUNITY MISSIONS</div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Join the next cleanup mission.</h2>
              <p className="text-slate-600 dark:text-slate-400">Verified hotspots become coordinated missions. Volunteer, earn points, make measurable impact.</p>
            </div>
            <div>
              <div className="demo-badge px-3 py-2 rounded-lg text-xs text-amber-400">
                ⚠ DEMO DATA below — fictional missions for hackathon demonstration
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {MISSIONS.map((m) => (
              <div key={m.tag} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 card-hover shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold">{m.tag}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    m.status === 'ACTIVE'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                      : 'bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug">{m.title}</h3>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2"><span>📍</span>{m.location}</div>
                  <div className="flex items-center gap-2"><span>🧤</span>{m.volunteers} volunteers joined</div>
                  <div className="flex items-center gap-2"><span>📅</span>{m.scheduled}</div>
                  <div className="flex items-center gap-2"><span>⚖️</span>Est. {m.waste}</div>
                </div>
                <Link href="/missions"
                  className="block w-full text-center py-2.5 rounded-xl border border-emerald-600 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-sm font-bold transition-all">
                  {m.status === 'ACTIVE' ? 'View Mission' : 'Join Mission'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/missions"
              className="inline-flex items-center gap-2 px-6 py-3 border border-emerald-600 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl font-bold transition-all">
              View All Missions →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. AI PREVENTION ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-slate-50 dark:bg-[#060d0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/5 via-transparent to-teal-950/5" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <AIPreviewCard />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/40 rounded-full text-xs text-emerald-800 dark:text-emerald-400 font-semibold">AI PREVENTION</div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">AI that analyses the waste, not just detects it.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Gemini AI, TrashTag analyses uploaded evidence images to classify waste composition, estimate severity, and recommend site-specific prevention strategies — preventing recurrence, not just cleaning up.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Waste Classification', desc: 'Identifies plastic, organic, e-waste, construction debris and mixed waste from photos.', icon: '🔬' },
                  { title: 'Risk Scoring', desc: '0–100 risk score based on waste type, volume, location sensitivity and environmental proximity.', icon: '📊' },
                  { title: 'Prevention Strategy', desc: '3+ ranked prevention recommendations per site: infrastructure, community, policy-based.', icon: '🛡️' },
                  { title: 'Human Verified', desc: 'AI outputs are estimates. Verifiers and organisations always review before any action.', icon: '✅' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-lg shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{f.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. MONITORING ──────────────────────────────────────────────────────── */}
      <section className="py-28 section-gradient">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800/40 rounded-full text-xs text-sky-800 dark:text-sky-400 font-semibold">LONG-TERM MONITORING</div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">We don't celebrate until 90 days clean.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Recovery verification is only the beginning. Every transformed site receives 30, 60, and 90-day inspection checkpoints. A site is only declared <span className="text-emerald-700 dark:text-emerald-400 font-bold">SUSTAINED</span> after passing all three.
              </p>
              <div className="space-y-4">
                {[
                  { day: '30d', desc: 'First checkpoint — confirm initial recovery holds', color: 'text-sky-700 dark:text-sky-400' },
                  { day: '60d', desc: 'Mid-term — verify community ownership taking hold', color: 'text-teal-700 dark:text-teal-400' },
                  { day: '90d', desc: 'Final — declare SUSTAINED or reopen for new mission', color: 'text-emerald-700 dark:text-emerald-400' },
                ].map((item) => (
                  <div key={item.day} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 flex items-center justify-center font-bold text-sm ${item.color} shrink-0 shadow-sm`}>
                      {item.day}
                    </div>
                    <div className="pt-1">
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/30 rounded-xl p-4 text-sm text-amber-900 dark:text-amber-300">
                <span className="font-semibold">Sites that fail monitoring</span> — if waste returns, the site is marked <span className="text-red-700 dark:text-red-400 font-mono font-bold">REOPENED</span> and a new recovery mission is triggered automatically.
              </div>
            </div>

            <div>
              <MonitoringPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. IMPACT ──────────────────────────────────────────────────────────── */}
      <section id="impact" className="py-28 bg-slate-50 dark:bg-[#060d0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-800/40 rounded-full text-xs text-teal-800 dark:text-teal-400 font-semibold">PLATFORM IMPACT</div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Measurable. Verifiable. Transparent.</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every number on TrashTag is backed by GPS evidence and human verification — not self-reported data.
            </p>
            <div className="demo-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-amber-800 dark:text-amber-400 font-medium">
              <span>⚠</span>
              <span>DEMO DATA — All numbers below are fictional. Generated for hackathon demonstration. No real impact claimed.</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
            {METRICS.map((m) => (
              <div key={m.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-2 card-hover shadow-sm">
                <div className="text-3xl">{m.icon}</div>
                <div className={`text-3xl font-extrabold ${m.color}`}>
                  {mounted ? <AnimatedCounter target={m.value} suffix={m.unit ? ` ${m.unit}` : ''} /> : m.value}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Leaderboard preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">🏆 Top Contributors · <span className="demo-badge px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-400 text-xs font-mono">DEMO</span></h3>
              <Link href="/leaderboard" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300">View Full Leaderboard →</Link>
            </div>
            <div className="space-y-3">
              {[
                { rank: 1, name: '[DEMO] Arjun Verma', score: 820, role: 'ADMIN', kg: '320 kg', badges: ['🌱', '🏆', '🧹'] },
                { rank: 2, name: '[DEMO] Priya Krishnan', score: 450, role: 'VERIFIER', kg: '280 kg', badges: ['🏆', '🔎'] },
                { rank: 3, name: '[DEMO] Suresh Iyer', score: 380, role: 'USER', kg: '108 kg', badges: ['🏷️', '🧹', '🏆'] },
              ].map((u) => (
                <div key={u.rank} className="flex items-center gap-4 py-3 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    u.rank === 1 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60' :
                    u.rank === 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700' :
                    'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-700/60'
                  }`}>#{u.rank}</div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-white font-semibold">{u.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{u.role} · {u.kg} recovered</div>
                  </div>
                  <div className="flex gap-1">{u.badges.map((b, i) => <span key={i} className="text-sm">{b}</span>)}</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">{u.score} pts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden bg-slate-50 dark:bg-[#060d0f]">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-emerald-50/30 to-slate-100 dark:from-[#060d0f] dark:via-emerald-950/20 dark:to-[#060d0f]" />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative space-y-8">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Your city. Your hotspot.<br />
            <span className="text-emerald-600 dark:text-emerald-400">Your mission.</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Join TrashTag. Report a pollution hotspot in your neighbourhood. Track its recovery. Prevent its return. Be part of the community that holds the system accountable.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/report"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-base shadow-lg shadow-emerald-900/20 dark:shadow-emerald-900/40 hover:shadow-emerald-800/60">
              <span>🏷️</span>
              Tag a Trash Hotspot
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 border border-emerald-600/50 dark:border-emerald-700/50 hover:border-emerald-500 text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 font-bold rounded-xl transition-all text-base bg-white dark:bg-transparent shadow-sm">
              <span>🗺️</span>
              Explore Recovery Map
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-6">
            {[
              { href: '/timeline', label: '📅 View Timeline' },
              { href: '/leaderboard', label: '🏆 Leaderboard' },
              { href: '/monitoring', label: '🔎 Monitoring' },
              { href: '/missions', label: '🚀 All Missions' },
              { href: '/dashboard', label: '📊 Dashboard' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-slate-600 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-[#040a07] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#062319] border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Trash<span className="text-emerald-500 dark:text-emerald-400">Tag</span></span>
            <span className="text-slate-600 dark:text-slate-400 text-sm hidden sm:inline">- Environmental Recovery Platform</span>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 text-center font-semibold">
            Designed & Developed by <span className="text-slate-900 dark:text-white font-bold">Vivek Singh</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Vivek1035"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold group"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4 text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/vivek-singh-087b46243/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold group"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectTo="/dashboard"
      />
    </div>
  );
}
