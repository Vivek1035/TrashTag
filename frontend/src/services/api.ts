import { ApiResponse, PageResponse, RecoveryStatus, Severity, TrashTag, WasteType } from '@/types/trashtag';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface TimelineEvent {
  id: string;
  trashTagId: string;
  tagCode?: string;
  trashTagTitle?: string;
  actorId: string;
  actorName: string;
  eventType: string;
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  trashTagId: string;
  trashTagCode?: string;
  trashTagTitle?: string;
  title: string;
  description?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  joinedByCurrentUser?: boolean;
  meetingPoint?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  equipmentNeeded?: string;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionInput {
  title: string;
  description?: string;
  trashTagId: string;
  scheduledDate: string;
  maxParticipants?: number;
  targetWasteKg?: number;
  meetingPoint?: string;
  meetingLatitude?: number;
  meetingLongitude?: number;
  equipmentNeeded?: string;
}

export interface CompleteMissionInput {
  plasticKg?: number;
  organicKg?: number;
  metalKg?: number;
  glassKg?: number;
  otherKg?: number;
  totalKg?: number;
  afterImageUrl?: string;
  notes?: string;
}

export interface VerifyRecoveryInput {
  approved: boolean;
  notes?: string;
  evidenceGpsVerified?: boolean;
  evidenceTimestampVerified?: boolean;
  evidenceBeforeImageVerified?: boolean;
  evidenceAfterImageVerified?: boolean;
  evidenceWasteRecordVerified?: boolean;
}

export interface ImageClassificationResponse {
  trashTagId: string;
  wasteCategories: Record<string, number>;
  severitySuggestion: Severity;
  confidence: number;
  detectedObjects: string[];
  explanation: string;
  provider: string;
  disclaimer: string;
  createdAt: string;
}

export interface PreventionStrategy {
  name: string;
  reason: string;
  costCategory: string;
  maintenanceLevel: string;
  expectedImpact: string;
  implementationNotes: string;
}

export interface PreventionResponse {
  trashTagId: string;
  strategies: PreventionStrategy[];
  provider: string;
  disclaimer: string;
  createdAt: string;
}

export interface ClassificationOverrideInput {
  wasteType: WasteType;
  severity: Severity;
  notes?: string;
}

export interface MonitoringCheckpointDTO {
  id: string;
  trashTagId: string;
  tagCode?: string;
  trashTagTitle?: string;
  address?: string;
  trashTagStatus?: string;
  checkpointDays: number;
  scheduledDate: string;
  completedDate?: string;
  image?: string;
  wasteDetected?: boolean;
  status: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}


export interface TransformationResponse {
  id: string;
  trashTagId: string;
  tagCode: string;
  title: string;
  status: RecoveryStatus;
  transformationType?: string;
  description?: string;
  preventionStrategy?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  estimatedWeightKg?: number;
  recoveredWeightKg?: number;
  submittedBy?: string;
  transformedAt?: string;
  checkpoints: MonitoringCheckpointDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface SelectStrategyInput {
  strategyName: string;
  strategyReason?: string;
  costCategory?: string;
  maintenanceLevel?: string;
  expectedImpact?: string;
  implementationNotes?: string;
}

export interface CompleteTransformationInput {
  transformationType: string;
  description: string;
  afterImageUrl: string;
}

export interface CompleteMonitoringInput {
  wasteDetected: boolean;
  evidenceImageUrl?: string;
  notes?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: string;
  earnedAt?: string;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  points: number;
  reports: number;
  missions: number;
  wasteRecoveredKg: number;
  recoveries: number;
  badges: UserBadge[];
}

export interface LeaderboardResponse {
  globalTotalScore: number;
  globalTotalReports: number;
  globalTotalMissions: number;
  globalTotalWasteRecoveredKg: number;
  globalTotalRecoveries: number;
  rankings: LeaderboardUser[];
}

export interface MonitoringDashboardMetrics {
  dueCount: number;
  completedCount: number;
  overdueCount: number;
  sustainedCount: number;
  reopenedCount: number;
}

export interface MonitoringDashboardResponse {
  metrics: MonitoringDashboardMetrics;
  checkpoints: MonitoringCheckpointDTO[];
}





export interface Participant {
  id: string;
  missionId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  joinedAt?: string;
}

export async function fetchTrashTags(params?: {
  status?: RecoveryStatus;
  wasteType?: WasteType;
  severity?: Severity;
  page?: number;
  size?: number;
}): Promise<TrashTag[]> {
  try {
    const url = new URL(`${API_BASE}/trash-tags`);
    if (params?.status) url.searchParams.append('status', params.status);
    if (params?.wasteType) url.searchParams.append('wasteType', params.wasteType);
    if (params?.severity) url.searchParams.append('severity', params.severity);
    url.searchParams.append('page', String(params?.page || 0));
    url.searchParams.append('size', String(params?.size || 100));

    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<PageResponse<TrashTag>> = await res.json();
    return json.data.content || [];
  } catch (err) {
    console.warn('API unavailable, using mock data:', err);
    return MOCK_TRASH_TAGS;
  }
}

export async function fetchTrashTagById(idOrTagCode: string): Promise<TrashTag> {
  try {
    const res = await fetch(`${API_BASE}/trash-tags/${idOrTagCode}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<TrashTag> = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`API unavailable for ID ${idOrTagCode}, finding in fallback:`, err);
    const found = MOCK_TRASH_TAGS.find(
      (t) => t.id === idOrTagCode || t.tagCode.toLowerCase() === idOrTagCode.toLowerCase()
    );
    return found || MOCK_TRASH_TAGS[0];
  }
}

export async function fetchGlobalTimelineApi(
  eventType?: string,
  page: number = 0,
  size: number = 50
): Promise<TimelineEvent[]> {
  try {
    const url = new URL(`${API_BASE}/timeline`);
    if (eventType && eventType !== 'ALL') {
      url.searchParams.append('eventType', eventType);
    }
    url.searchParams.append('page', String(page));
    url.searchParams.append('size', String(size));

    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.content || json.data?.content || [];
  } catch (err) {
    console.warn('API unavailable for global timeline, returning mock stream:', err);
    return MOCK_GLOBAL_TIMELINE;
  }
}

export async function fetchLeaderboardApi(): Promise<LeaderboardResponse> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn('API unavailable for leaderboard, returning mock leaderboard:', err);
    return MOCK_LEADERBOARD;
  }
}

export async function fetchTrashTagTimeline(idOrTagCode: string): Promise<TimelineEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/trash-tags/${idOrTagCode}/timeline`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.content || json.data?.content || [];
  } catch (err) {
    console.warn(`API unavailable for timeline ${idOrTagCode}, returning mock timeline:`, err);
    return [
      {
        id: 'te-1',
        trashTagId: idOrTagCode,
        tagCode: 'TT-1001',
        trashTagTitle: 'Riverbank Illegal Plastic Dump',
        actorId: 'user-1',
        actorName: 'Alice Green',
        eventType: 'REPORT_CREATED',
        title: 'TrashTag Reported',
        description: 'TrashTag site reported with severity CRITICAL.',
        imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'te-2',
        trashTagId: idOrTagCode,
        tagCode: 'TT-1001',
        trashTagTitle: 'Riverbank Illegal Plastic Dump',
        actorId: 'user-ver',
        actorName: 'Verifier Bob',
        eventType: 'REPORT_VERIFIED',
        title: 'Report Verified',
        description: 'Verifier confirmed dump site coordinates and severity level.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
  }
}

export async function verifyTrashTagApi(idOrTagCode: string, token: string): Promise<TrashTag> {
  const res = await fetch(`${API_BASE}/trash-tags/${idOrTagCode}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `Verification failed (${res.status})`);
  }
  const json: ApiResponse<TrashTag> = await res.json();
  return json.data;
}

// ── Cleanup Mission APIs ───────────────────────────────────────

export async function fetchMissions(params?: {
  status?: string;
  trashTagId?: string;
  page?: number;
  size?: number;
  token?: string;
}): Promise<Mission[]> {
  try {
    const url = new URL(`${API_BASE}/missions`);
    if (params?.status) url.searchParams.append('status', params.status);
    if (params?.trashTagId) url.searchParams.append('trashTagId', params.trashTagId);
    url.searchParams.append('page', String(params?.page || 0));
    url.searchParams.append('size', String(params?.size || 50));

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (params?.token) headers['Authorization'] = `Bearer ${params.token}`;

    const res = await fetch(url.toString(), { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.content || data || [];
  } catch (err) {
    console.warn('API unavailable for missions, returning mock data:', err);
    return MOCK_MISSIONS;
  }
}

export async function fetchMissionById(id: string, token?: string): Promise<Mission> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/missions/${id}`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API unavailable for mission ${id}, returning mock mission:`, err);
    const found = MOCK_MISSIONS.find((m) => m.id === id);
    return found || MOCK_MISSIONS[0];
  }
}

export async function createMissionApi(input: CreateMissionInput, token: string): Promise<Mission> {
  const res = await fetch(`${API_BASE}/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to create mission (${res.status})`);
  }
  return await res.json();
}

export async function joinMissionApi(missionId: string, token: string): Promise<Mission> {
  const res = await fetch(`${API_BASE}/missions/${missionId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to join mission (${res.status})`);
  }
  return await res.json();
}

export async function leaveMissionApi(missionId: string, token: string): Promise<Mission> {
  const res = await fetch(`${API_BASE}/missions/${missionId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to leave mission (${res.status})`);
  }
  return await res.json();
}

export async function startMissionApi(missionId: string, token: string): Promise<Mission> {
  const res = await fetch(`${API_BASE}/missions/${missionId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to start mission (${res.status})`);
  }
  return await res.json();
}

export async function completeMissionApi(
  missionId: string,
  input: CompleteMissionInput,
  token: string
): Promise<Mission> {
  const res = await fetch(`${API_BASE}/missions/${missionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to complete mission (${res.status})`);
  }
  return await res.json();
}

export async function verifyRecoveryApi(

  trashTagId: string,
  input: VerifyRecoveryInput,
  token: string
): Promise<TrashTag> {
  const res = await fetch(`${API_BASE}/trash-tags/${trashTagId}/recovery/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to verify recovery (${res.status})`);
  }
  const data = await res.json();
  return data.data || data;
}

export async function classifyTrashTagApi(trashTagId: string, token: string): Promise<ImageClassificationResponse> {
  const res = await fetch(`${API_BASE}/ai/trash-tags/${trashTagId}/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `AI image classification failed (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function getPreventionRecommendationsApi(trashTagId: string, token: string): Promise<PreventionResponse> {
  const res = await fetch(`${API_BASE}/ai/trash-tags/${trashTagId}/prevention`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch AI prevention recommendations (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function overrideClassificationApi(
  trashTagId: string,
  input: ClassificationOverrideInput,
  token: string
): Promise<TrashTag> {
  const res = await fetch(`${API_BASE}/ai/trash-tags/${trashTagId}/override`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to override classification (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function planTransformationApi(
  trashTagId: string,
  input: SelectStrategyInput,
  token: string
): Promise<TransformationResponse> {
  const res = await fetch(`${API_BASE}/transformation/${trashTagId}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to select strategy (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function completeTransformationApi(
  trashTagId: string,
  input: CompleteTransformationInput,
  token: string
): Promise<TransformationResponse> {
  const res = await fetch(`${API_BASE}/transformation/${trashTagId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to complete transformation (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function fetchTransformationApi(
  trashTagId: string,
  token?: string
): Promise<TransformationResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/transformation/${trashTagId}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch transformation (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function fetchMonitoringDashboardApi(
  params?: { checkpointDays?: number; status?: string; search?: string },
  token?: string
): Promise<MonitoringDashboardResponse> {
  const url = new URL(`${API_BASE}/monitoring`);
  if (params?.checkpointDays) url.searchParams.append('checkpointDays', String(params.checkpointDays));
  if (params?.status) url.searchParams.append('status', params.status);
  if (params?.search) url.searchParams.append('search', params.search);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers, cache: 'no-store' });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to fetch monitoring dashboard (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function initializeMonitoringApi(
  trashTagId: string,
  token: string
): Promise<MonitoringCheckpointDTO[]> {
  const res = await fetch(`${API_BASE}/trash-tags/${trashTagId}/monitoring`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to initialize monitoring (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function completeMonitoringInspectionApi(
  checkpointId: string,
  input: CompleteMonitoringInput,
  token: string
): Promise<MonitoringCheckpointDTO> {
  const res = await fetch(`${API_BASE}/monitoring/${checkpointId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to submit monitoring inspection (${res.status})`);
  }
  const json = await res.json();
  return json.data || json;
}





export async function fetchMissionParticipants(missionId: string, token?: string): Promise<Participant[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/missions/${missionId}/participants`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API unavailable for participants of ${missionId}:`, err);
    return [
      {
        id: 'p-1',
        missionId,
        userId: 'u-1',
        userName: 'Alice Green (Organizer)',
        checkedIn: true,
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'p-2',
        missionId,
        userId: 'u-2',
        userName: 'Carlos Volunteer',
        checkedIn: false,
        joinedAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ];
  }
}

// ⚠ DEMO DATA — Fictional Bengaluru locations for hackathon demonstration.
// No real environmental cleanup is claimed or implied by these records.
export const MOCK_TRASH_TAGS: TrashTag[] = [
  {
    id: 'tt-d01-uuid',
    tagCode: 'TT-D01',
    reporterId: 'u1-demo',
    reporterName: '[DEMO] Anika Rao',
    status: 'REPORTED',
    wasteType: 'PLASTIC',
    severity: 'HIGH',
    title: '[DEMO] Bellandur Lake Plastic Heap',
    description: '⚠ DEMO DATA — Large accumulation of single-use plastic bags, bottles and packaging material observed near the eastern bank of Bellandur lake.',
    latitude: 12.9250,
    longitude: 77.6780,
    address: 'Bellandur Lake East Bank, Bengaluru, KA',
    estimatedWeightKg: 180,
    primaryImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-d04-uuid',
    tagCode: 'TT-D04',
    reporterId: 'u4-demo',
    reporterName: '[DEMO] Rahul Nair',
    status: 'MISSION_ACTIVE',
    wasteType: 'MIXED',
    severity: 'HIGH',
    title: '[DEMO] Ulsoor Lake Perimeter Mixed Waste',
    description: '⚠ DEMO DATA — Mixed waste including construction debris, plastic and glass observed around Ulsoor Lake\'s western perimeter. Active demo mission in progress.',
    latitude: 12.9785,
    longitude: 77.6199,
    address: 'Ulsoor Lake West Perimeter, Bengaluru, KA',
    estimatedWeightKg: 260,
    primaryImageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 600).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-d08-uuid',
    tagCode: 'TT-D08',
    reporterId: 'u8-demo',
    reporterName: '[DEMO] Suresh Iyer',
    status: 'TRANSFORMED',
    wasteType: 'ORGANIC',
    severity: 'LOW',
    title: '[DEMO] Jayanagar Community Garden Demo Site',
    description: '⚠ DEMO DATA — Former organic waste accumulation point transformed into a demo community composting and garden space. No real transformation occurred.',
    latitude: 12.9250,
    longitude: 77.5938,
    address: '4th Block, Jayanagar, Bengaluru, KA',
    estimatedWeightKg: 120,
    recoveredWeightKg: 118,
    primaryImageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 2160).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-d11-uuid',
    tagCode: 'TT-D11',
    reporterId: 'u11-demo',
    reporterName: '[DEMO] Tanya Patel',
    status: 'SUSTAINED',
    wasteType: 'MIXED',
    severity: 'LOW',
    title: '[DEMO] Malleswaram Sankey Tank — SUSTAINED',
    description: '⚠ DEMO DATA — Site fully sustained after 90-day monitoring. Community ownership transferred. Demo lifecycle endpoint.',
    latitude: 13.0020,
    longitude: 77.5680,
    address: 'Sankey Tank Road, Malleswaram, Bengaluru, KA',
    estimatedWeightKg: 200,
    recoveredWeightKg: 195,
    primaryImageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 4320).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm-d02-uuid',
    trashTagId: 'tt-d04-uuid',
    trashTagCode: 'TT-D04',
    trashTagTitle: '[DEMO] Ulsoor Lake Perimeter Mixed Waste',
    title: '[DEMO] Ulsoor Lake Perimeter Waste Drive',
    description: '⚠ DEMO MISSION — Mixed waste recovery operation around Ulsoor Lake. Teams will sort waste into plastic, glass and debris categories.',
    status: 'ACTIVE',
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    maxParticipants: 30,
    currentParticipantsCount: 18,
    joinedByCurrentUser: false,
    meetingPoint: 'Ulsoor Lake West Gate Entry',
    meetingLatitude: 12.9785,
    meetingLongitude: 77.6199,
    equipmentNeeded: 'Safety vests, Sorting bins, Heavy-duty bags, Gloves',
    createdBy: 'org-cleantech-demo',
    creatorName: '[DEMO] CleanTech Bluru',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm-d01-uuid',
    trashTagId: 'tt-d01-uuid',
    trashTagCode: 'TT-D01',
    trashTagTitle: '[DEMO] Bellandur Lake Plastic Heap',
    title: '[DEMO] Bellandur Plastic Recovery Mission',
    description: '⚠ DEMO MISSION — Volunteer team to clear plastic waste accumulation near Bellandur Lake\'s eastern bank.',
    status: 'UPCOMING',
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    maxParticipants: 25,
    currentParticipantsCount: 9,
    joinedByCurrentUser: true,
    meetingPoint: 'Bellandur Lake North Gate Parking',
    meetingLatitude: 12.9250,
    meetingLongitude: 77.6780,
    equipmentNeeded: 'Trash grabbers, Heavy bags, Waterproof boots, Gloves',
    createdBy: 'org-greenblr-demo',
    creatorName: '[DEMO] Green Bengaluru Foundation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


export const MOCK_GLOBAL_TIMELINE: TimelineEvent[] = [
  {
    id: 'gt-d01',
    trashTagId: 'tt-d01-uuid',
    tagCode: 'TT-D01',
    trashTagTitle: '[DEMO] Bellandur Lake Plastic Heap',
    actorId: 'u1-demo',
    actorName: '[DEMO] Anika Rao',
    eventType: 'REPORT_CREATED',
    title: '[DEMO] TrashTag Reported',
    description: '⚠ DEMO — Hotspot reported near Bellandur Lake east bank. Severity HIGH. Estimated 180 kg of plastic waste.',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  },
  {
    id: 'gt-d02',
    trashTagId: 'tt-d02-uuid',
    tagCode: 'TT-D02',
    trashTagTitle: '[DEMO] HSR Layout E-Waste Dump',
    actorId: 'ver1-demo',
    actorName: '[DEMO] Priya Krishnan (Verifier)',
    eventType: 'REPORT_VERIFIED',
    title: '[DEMO] Report Verified',
    description: '⚠ DEMO — Environmental verifier confirmed e-waste hotspot at HSR Layout Sector 3.',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'gt-d03',
    trashTagId: 'tt-d04-uuid',
    tagCode: 'TT-D04',
    trashTagTitle: '[DEMO] Ulsoor Lake Perimeter Mixed Waste',
    actorId: 'org-cleantech-demo',
    actorName: '[DEMO] CleanTech Bluru',
    eventType: 'MISSION_CREATED',
    title: '[DEMO] Cleanup Mission Created',
    description: '⚠ DEMO — Ulsoor Lake Perimeter Waste Drive scheduled with 30 volunteer spots.',
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'gt-d04',
    trashTagId: 'tt-d08-uuid',
    tagCode: 'TT-D08',
    trashTagTitle: '[DEMO] Jayanagar Community Garden Demo Site',
    actorId: 'admin-demo',
    actorName: '[DEMO] Gemini AI (MockAIService)',
    eventType: 'TRANSFORMATION_RECOMMENDED',
    title: '[DEMO] AI Prevention Plan Generated',
    description: '⚠ DEMO — MockAIService generated 3 prevention strategies for Jayanagar organic hotspot.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'gt-d05',
    trashTagId: 'tt-d11-uuid',
    tagCode: 'TT-D11',
    trashTagTitle: '[DEMO] Malleswaram Sankey Tank — SUSTAINED',
    actorId: 'ver1-demo',
    actorName: '[DEMO] Priya Krishnan (Verifier)',
    eventType: 'SITE_SUSTAINED',
    title: '[DEMO] Site Sustained — Malleswaram',
    description: '⚠ DEMO — Malleswaram Sankey Tank site officially declared sustained. No waste recurrence after 90 days.',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const MOCK_LEADERBOARD: LeaderboardResponse = {
  globalTotalScore: 2740,
  globalTotalReports: 15,
  globalTotalMissions: 6,
  globalTotalWasteRecoveredKg: 823,
  globalTotalRecoveries: 4,
  rankings: [
    {
      rank: 1,
      userId: 'admin-demo-uuid',
      username: 'demo_admin',
      displayName: '[DEMO] Arjun Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'ADMIN',
      points: 820,
      reports: 0,
      missions: 4,
      wasteRecoveredKg: 320,
      recoveries: 2,
      badges: [
        { id: 'b-1', name: 'Cleanup Volunteer', description: 'Joined 2+ missions', icon: '🧹', level: 'SILVER' },
        { id: 'b-2', name: 'Recovery Champion', description: 'Recovered 100+ kg waste', icon: '🏆', level: 'GOLD' },
        { id: 'b-3', name: 'Prevention Builder', description: 'Executed 1+ site transformations', icon: '🌱', level: 'PLATINUM' },
      ],
    },
    {
      rank: 2,
      userId: 'verifier1-demo-uuid',
      username: 'demo_verifier_priya',
      displayName: '[DEMO] Priya Krishnan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'VERIFIER',
      points: 450,
      reports: 0,
      missions: 3,
      wasteRecoveredKg: 280,
      recoveries: 3,
      badges: [
        { id: 'b-2', name: 'Recovery Champion', description: 'Recovered 50+ kg waste', icon: '🏆', level: 'GOLD' },
        { id: 'b-4', name: 'Monitoring Guardian', description: 'Completed 2+ monitoring checkpoints', icon: '🔎', level: 'SILVER' },
      ],
    },
    {
      rank: 3,
      userId: 'u8-demo-uuid',
      username: 'demo_suresh_iyer',
      displayName: '[DEMO] Suresh Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdcd5c?auto=format&fit=crop&w=200&q=80',
      role: 'USER',
      points: 380,
      reports: 1,
      missions: 4,
      wasteRecoveredKg: 108,
      recoveries: 1,
      badges: [
        { id: 'b-1', name: 'Hotspot Scout', description: 'Reported 1+ hotspot', icon: '🏷️', level: 'BRONZE' },
        { id: 'b-2', name: 'Cleanup Volunteer', description: 'Joined 2+ missions', icon: '🧹', level: 'SILVER' },
        { id: 'b-3', name: 'Recovery Champion', description: 'Recovered 50+ kg waste', icon: '🏆', level: 'GOLD' },
      ],
    },
  ],
};

export interface UserPersonalStats {
  environmentalScore: number;
  myReportsCount: number;
  myMissionsCount: number;
  myWasteRecoveredKg: number;
  mySitesRecoveredCount: number;
}

export interface LifecycleBreakdown {
  totalActiveTrashTagsCount: number;
  awaitingVerificationCount: number;
  verifiedCount: number;
  activeMissionsCount: number;
  awaitingRecoveryVerificationCount: number;
  transformationPlannedCount: number;
  transformedCount: number;
  inMonitoringCount: number;
  reopenedCount: number;
  sustainedCount: number;
}

export interface DemoDataStats {
  demoReportsCount: number;
  demoEstimatedWasteKg: number;
  demoVerifiedWasteKg: number;
  demoSitesRecoveredCount: number;
}

export interface ImpactOverview {
  userReportedCount: number;
  estimatedWasteKg: number;
  verifiedWasteKg: number;
  sitesRecoveredCount: number;
  demoData: DemoDataStats;
}

export interface MonitoringPipelineSummary {
  totalCheckpoints: number;
  dueCheckpoints: number;
  completedCheckpoints: number;
  overdueCheckpoints: number;
  sustainedSitesCount: number;
  reopenedSitesCount: number;
}

export interface DashboardResponse {
  userStats: UserPersonalStats;
  lifecycleBreakdown: LifecycleBreakdown;
  impactOverview: ImpactOverview;
  upcomingMissions: Mission[];
  monitoringPipeline: MonitoringPipelineSummary;
  recentTimeline: TimelineEvent[];
}

export const MOCK_DASHBOARD: DashboardResponse = {
  userStats: {
    environmentalScore: 820,
    myReportsCount: 8,
    myMissionsCount: 5,
    myWasteRecoveredKg: 240,
    mySitesRecoveredCount: 3,
  },
  lifecycleBreakdown: {
    totalActiveTrashTagsCount: 12,
    awaitingVerificationCount: 4,
    verifiedCount: 2,
    activeMissionsCount: 3,
    awaitingRecoveryVerificationCount: 2,
    transformationPlannedCount: 1,
    transformedCount: 1,
    inMonitoringCount: 2,
    reopenedCount: 1,
    sustainedCount: 3,
  },
  impactOverview: {
    userReportedCount: 8,
    estimatedWasteKg: 420.0,
    verifiedWasteKg: 240.0,
    sitesRecoveredCount: 3,
    demoData: {
      demoReportsCount: 4,
      demoEstimatedWasteKg: 850.0,
      demoVerifiedWasteKg: 430.0,
      demoSitesRecoveredCount: 2,
    },
  },
  upcomingMissions: MOCK_MISSIONS,
  monitoringPipeline: {
    totalCheckpoints: 9,
    dueCheckpoints: 2,
    completedCheckpoints: 5,
    overdueCheckpoints: 1,
    sustainedSitesCount: 3,
    reopenedSitesCount: 1,
  },
  recentTimeline: MOCK_GLOBAL_TIMELINE,
};

export async function fetchDashboardData(token?: string): Promise<DashboardResponse> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/dashboard`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.warn('API unavailable for fetchDashboardData, using dynamic mock data fallback:', err);
    return MOCK_DASHBOARD;
  }
}

