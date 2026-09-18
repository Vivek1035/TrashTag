import { ApiResponse, PageResponse, RecoveryStatus, Severity, TrashTag, WasteType } from '@/types/trashtag';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface TimelineEvent {
  id: string;
  trashTagId: string;
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
  checkpointDays: number;
  scheduledDate: string;
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

export async function fetchTrashTagTimeline(idOrTagCode: string): Promise<TimelineEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/trash-tags/${idOrTagCode}/timeline`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<PageResponse<TimelineEvent>> = await res.json();
    return json.data.content || [];
  } catch (err) {
    console.warn(`API unavailable for timeline ${idOrTagCode}, returning mock timeline:`, err);
    return [
      {
        id: 'te-1',
        trashTagId: idOrTagCode,
        actorId: 'user-1',
        actorName: 'Alice Green',
        eventType: 'REPORT_CREATED',
        title: 'Trash Hotspot Tagged',
        description: 'Hotspot reported with severity HIGH. Initial waste estimated at 120 kg.',
        imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'te-2',
        trashTagId: idOrTagCode,
        actorId: 'user-ver',
        actorName: 'Verifier Bob',
        eventType: 'HOTSPOT_VERIFIED',
        title: 'Hotspot Verified',
        description: 'Field verifier confirmed illegal dump site coordinates and severity level.',
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

// Demo fallback data
export const MOCK_TRASH_TAGS: TrashTag[] = [
  {
    id: 'tt-1001-uuid',
    tagCode: 'TT-1001',
    reporterId: 'user-1',
    reporterName: 'Alice Green',
    status: 'REPORTED',
    wasteType: 'PLASTIC',
    severity: 'CRITICAL',
    title: 'Riverbank Illegal Plastic Dump',
    description: 'Massive pile of single-use plastic bottles, bags, and chemical containers along the river edge.',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '102 River Rd, San Francisco, CA',
    estimatedWeightKg: 120,
    primaryImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-1002-uuid',
    tagCode: 'TT-1002',
    reporterId: 'user-2',
    reporterName: 'Carlos Dev',
    status: 'MISSION_ACTIVE',
    wasteType: 'ELECTRONIC',
    severity: 'HIGH',
    title: 'Industrial E-Waste Dumping Grounds',
    description: 'Discarded monitors, lithium batteries, and circuit boards behind old warehouse.',
    latitude: 37.7833,
    longitude: -122.4167,
    address: '450 Industrial Way, San Francisco, CA',
    estimatedWeightKg: 350,
    primaryImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tt-1004-uuid',
    tagCode: 'TT-1004',
    reporterId: 'user-4',
    reporterName: 'Community Admin',
    status: 'TRANSFORMED',
    wasteType: 'MIXED',
    severity: 'LOW',
    title: 'Mission District Alley Recovery',
    description: 'Formerly an urban dump site, now transformed into a vibrant community garden plot.',
    latitude: 37.7599,
    longitude: -122.4148,
    address: 'Balmy Alley, San Francisco, CA',
    estimatedWeightKg: 200,
    primaryImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    reportedAt: new Date(Date.now() - 3600000 * 720).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm-1001-uuid',
    trashTagId: 'tt-1002-uuid',
    trashTagCode: 'TT-1002',
    trashTagTitle: 'Industrial E-Waste Dumping Grounds',
    title: 'Operation Bay E-Waste Recovery',
    description: 'Volunteer team assembling to haul hazardous e-waste and sort lithium batteries safely.',
    status: 'ACTIVE',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    startedAt: new Date().toISOString(),
    maxParticipants: 25,
    currentParticipantsCount: 14,
    joinedByCurrentUser: false,
    meetingPoint: 'Gate B, Industrial Way Lot',
    meetingLatitude: 37.7833,
    meetingLongitude: -122.4167,
    equipmentNeeded: 'Heavy-duty gloves, Steel-toe boots, Safety glasses',
    createdBy: 'org-1',
    creatorName: 'Bay Area Cleanup Alliance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm-1002-uuid',
    trashTagId: 'tt-1001-uuid',
    trashTagCode: 'TT-1001',
    trashTagTitle: 'Riverbank Illegal Plastic Dump',
    title: 'Riverbank Plastics Interception',
    description: 'Join us to sweep 120 kg of single-use plastics before storm runoff reaches the bay.',
    status: 'UPCOMING',
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    maxParticipants: 20,
    currentParticipantsCount: 8,
    joinedByCurrentUser: true,
    meetingPoint: 'River Rd Bridge South Footpath',
    meetingLatitude: 37.7749,
    meetingLongitude: -122.4194,
    equipmentNeeded: 'Trash grabbers, Heavy bags, Waterproof boots',
    createdBy: 'org-2',
    creatorName: 'Clean Ocean Network',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
