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

export interface MissionInfo {
  id: string;
  trashTagId: string;
  title: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  maxParticipants: number;
  currentParticipantsCount?: number;
  meetingPoint?: string;
  equipmentNeeded?: string;
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
