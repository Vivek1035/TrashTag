export type RecoveryStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'MISSION_CREATED'
  | 'MISSION_ACTIVE'
  | 'CLEANUP_COMPLETED'
  | 'RECOVERY_VERIFIED'
  | 'TRANSFORMATION_PLANNED'
  | 'TRANSFORMED'
  | 'MONITORING'
  | 'SUSTAINED'
  | 'REOPENED';

export type WasteType =
  | 'PLASTIC'
  | 'ELECTRONIC'
  | 'ORGANIC'
  | 'CONSTRUCTION'
  | 'MIXED'
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TrashTag {
  id: string;
  tagCode: string;
  reporterId: string;
  reporterName: string;
  status: RecoveryStatus;
  wasteType: WasteType;
  severity: Severity;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  estimatedWeightKg?: number;
  primaryImageUrl?: string;
  reportedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  lastStatusChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type FilterCategory =
  | 'All'
  | 'Critical'
  | 'Reported'
  | 'Mission Active'
  | 'Recovered'
  | 'Transformed'
  | 'Reopened';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

