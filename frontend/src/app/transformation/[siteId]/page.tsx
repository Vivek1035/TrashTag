'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TrashTag } from '@/types/trashtag';
import {
  fetchTrashTagById,
  fetchTransformationApi,
  getPreventionRecommendationsApi,
  planTransformationApi,
  completeTransformationApi,
  TransformationResponse,
  PreventionResponse,
  PreventionStrategy,
} from '@/services/api';
import { TransformationPresentation } from '@/components/transformation/TransformationPresentation';
import {
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  Weight,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  FileText,
  RotateCcw,
  Bot,
  Lock,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function TransformationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const siteId = (params?.siteId as string) || '';

  const [tag, setTag] = useState<TrashTag | null>(null);
  const [transformation, setTransformation] = useState<TransformationResponse | null>(null);
  const [aiPrevention, setAiPrevention] = useState<PreventionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Strategy selection form state
  const [selectedStrategy, setSelectedStrategy] = useState<PreventionStrategy | null>(null);

  // Completion form state
  const [transformationType, setTransformationType] = useState<string>('Community Garden');
  const [description, setDescription] = useState<string>('');
  const [afterImageUrl, setAfterImageUrl] = useState<string>('');

  const loadData = async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const tagData = await fetchTrashTagById(siteId);
      setTag(tagData);

      try {
        const transformData = await fetchTransformationApi(siteId, token || undefined);
        setTransformation(transformData);
        if (transformData.transformationType) {
          setTransformationType(transformData.transformationType);
        }
        if (transformData.description) {
          setDescription(transformData.description);
        }
        if (transformData.afterImageUrl) {
          setAfterImageUrl(transformData.afterImageUrl);
        }
      } catch (e) {
        // Transformation record might not exist yet
      }

      // If RECOVERY_VERIFIED, load AI prevention strategies
      if (
        tagData.status === 'RECOVERY_VERIFIED' ||
        tagData.status === 'TRANSFORMATION_PLANNED' ||
        tagData.status === 'TRANSFORMED' ||
        tagData.status === 'MONITORING'
      ) {
        if (token) {
          getPreventionRecommendationsApi(siteId, token)
            .then((res) => setAiPrevention(res))
            .catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('Failed to load transformation site details:', err);
      setError(err.message || 'Failed to load site details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [siteId, token]);

  const handleSelectStrategy = async (strategy: PreventionStrategy) => {
    if (!token) {
      setError('Log in to select a prevention strategy.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await planTransformationApi(
        siteId,
        {
          strategyName: strategy.name,
          strategyReason: strategy.reason,
          costCategory: strategy.costCategory,
          maintenanceLevel: strategy.maintenanceLevel,
          expectedImpact: strategy.expectedImpact,
          implementationNotes: strategy.implementationNotes,
        },
        token
      );
      setTransformation(updated);
      setSelectedStrategy(strategy);
      setSuccessMessage(`Strategy "${strategy.name}" selected! Status advanced to TRANSFORMATION_PLANNED.`);
      await loadData();
    } catch (err: any) {
      console.error('Strategy selection error:', err);
      setError(err.message || 'Failed to select strategy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Log in to submit transformation completion.');
      return;
    }
    if (!afterImageUrl.trim()) {
      setError('Transformation evidence image URL is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await completeTransformationApi(
        siteId,
        {
          transformationType,
          description: description.trim() || `Transformed into ${transformationType}`,
          afterImageUrl: afterImageUrl.trim(),
        },
        token
      );
      setTransformation(updated);
      setSuccessMessage('Transformation completed! Status advanced to TRANSFORMED & 30/60/90-day monitoring checkpoints scheduled.');
      await loadData();
    } catch (err: any) {
      console.error('Transformation completion error:', err);
      setError(err.message || 'Failed to complete transformation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading transformation workspace...</p>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">TrashTag Site Not Found</h2>
        <p className="text-slate-400 text-sm">Could not retrieve site data for ID: {siteId}</p>
        <Link
          href="/explore"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
        >
          Return to Explore Map
        </Link>
      </div>
    );
  }

  const isEligible =
    tag.status === 'RECOVERY_VERIFIED' ||
    tag.status === 'TRANSFORMATION_PLANNED' ||
    tag.status === 'TRANSFORMED' ||
    tag.status === 'MONITORING' ||
    tag.status === 'SUSTAINED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/recovery/${tag.id}`}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  {tag.tagCode}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {tag.status}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-0.5">{tag.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Transformation Stage
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner Alert if NOT Eligible */}
        {!isEligible && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">RECOVERY_VERIFIED Status Required</h4>
              <p className="text-xs text-amber-300/80 mt-1">
                This site is currently in state <strong>{tag.status}</strong>. Transformation strategy planning requires the site to pass clean site recovery verification (<strong>RECOVERY_VERIFIED</strong> status).
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Action Completed</h4>
                <p className="text-xs text-emerald-300/80">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Transformation Error</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Site Context Summary Hero Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-40">
              {tag.primaryImageUrl ? (
                <img
                  src={tag.primaryImageUrl}
                  alt={`Before - ${tag.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1">
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">No initial photo</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">
                Initial Dump Site
              </div>
            </div>

            <div className="md:col-span-2 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Location Address
                </span>
                <span className="font-medium text-slate-200">{tag.address || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-emerald-400" /> Recovered Waste Swept
                </span>
                <span className="font-bold text-emerald-400 text-sm">{tag.recoveredWeightKg || 0} kg</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Selected Prevention Plan
                </span>
                <span className="font-semibold text-purple-300">
                  {transformation?.preventionStrategy || selectedStrategy?.name || 'Awaiting Selection'}
                </span>
              </div>

              {transformation?.description && (
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-0.5">Transformation Goal:</span>
                  {transformation.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PHASE 1: SELECT AI PREVENTION STRATEGY (When status is RECOVERY_VERIFIED) */}
        {tag.status === 'RECOVERY_VERIFIED' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  Phase 1: Select AI Prevention Strategy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose a context-appropriate prevention strategy to advance status to <strong>TRANSFORMATION_PLANNED</strong>.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(aiPrevention?.strategies || [
                {
                  name: 'Community Garden',
                  reason: 'Converting cleared dump sites into active community gardens fosters ongoing neighborhood stewardship.',
                  costCategory: 'MEDIUM',
                  maintenanceLevel: 'MEDIUM',
                  expectedImpact: 'HIGH',
                  implementationNotes: 'Engage local residents for a planting weekend. Install raised beds.',
                },
                {
                  name: 'Waste Segregation Point',
                  reason: 'Providing dedicated, labeled waste collection infrastructure addresses root cause of dumping.',
                  costCategory: 'LOW',
                  maintenanceLevel: 'LOW',
                  expectedImpact: 'HIGH',
                  implementationNotes: 'Install color-coded bins for Plastic, Organic, and Mixed waste with signage.',
                },
                {
                  name: 'Mural + Barrier',
                  reason: 'Combining community mural artwork with planter barriers visually revitalizes site.',
                  costCategory: 'LOW',
                  maintenanceLevel: 'LOW',
                  expectedImpact: 'MEDIUM',
                  implementationNotes: 'Partner with local youth artists; place heavy planter boxes to block vehicle access.',
                },
              ]).map((strat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                        Impact: {strat.expectedImpact}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{strat.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{strat.reason}</p>
                  </div>

                  <button
                    onClick={() => handleSelectStrategy(strat)}
                    disabled={submitting}
                    className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Select & Plan Strategy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 2: COMPLETE TRANSFORMATION EVIDENCE (When status is TRANSFORMATION_PLANNED) */}
        {tag.status === 'TRANSFORMATION_PLANNED' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  Phase 2: Transformation Evidence Upload
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload transformation evidence to advance status to <strong>TRANSFORMED</strong> and trigger automated <strong>30/60/90-day monitoring checkpoints</strong>.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ready to Complete
              </span>
            </div>

            <form onSubmit={handleCompleteTransformation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Transformation Type</label>
                  <select
                    value={transformationType}
                    onChange={(e) => setTransformationType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="Community Garden">Community Garden</option>
                    <option value="Waste Segregation Point">Waste Segregation Point</option>
                    <option value="Mural + Barrier">Mural + Barrier</option>
                    <option value="Composting Hub">Composting Hub</option>
                    <option value="Community Notice Board">Community Notice Board</option>
                    <option value="Urban Parklet">Urban Parklet</option>
                    <option value="Other Revitalization">Other Revitalization</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">After-Transformation Photo URL</label>
                  <input
                    type="url"
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/transformed-site.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Transformation Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the physical modifications, garden beds installed, mural work, community participants..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Submit Transformation & Initiate Monitoring
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3-STAGE TRANSFORMATION PRESENTATION SHOWCASE */}
        <TransformationPresentation
          beforeImageUrl={tag.primaryImageUrl}
          afterImageUrl={transformation?.afterImageUrl || tag.afterImageUrl}
          recoveredWeightKg={tag.recoveredWeightKg}
          transformationType={transformation?.transformationType || tag.wasteType}
          description={transformation?.description}
        />

        {/* AUTOMATED MONITORING CHECKPOINTS PANEL */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Automated Site Monitoring Checkpoints</h3>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              30 / 60 / 90 Days Protocol
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(transformation?.checkpoints && transformation.checkpoints.length > 0
              ? transformation.checkpoints
              : [
                  { checkpointDays: 30, status: 'PENDING', notes: 'Scheduled 30-day post-transformation audit.' },
                  { checkpointDays: 60, status: 'PENDING', notes: 'Scheduled 60-day post-transformation audit.' },
                  { checkpointDays: 90, status: 'PENDING', notes: 'Scheduled 90-day final sustainability audit.' },
                ]
            ).map((cp: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-400 uppercase font-mono">
                      {cp.checkpointDays}-Day Audit
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        cp.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    📅 {cp.scheduledDate ? new Date(cp.scheduledDate).toLocaleDateString() : `${cp.checkpointDays} days post-completion`}
                  </p>
                  <p className="text-[11px] text-slate-400">{cp.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

