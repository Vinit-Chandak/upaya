/** Phase 3: Pandit Consultation Types */

export type PanditStatus = 'active' | 'inactive' | 'suspended';

export type SessionType = 'chat' | 'call';

export type SessionStatus = 'pending' | 'active' | 'ended' | 'cancelled';

export interface Pandit {
  id: string;
  name: string;
  nameHi: string;
  photoUrl: string | null;
  specialities: string[];
  languages: string[];
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  pricePerMinChat: number;
  pricePerMinCall: number;
  availabilityJson: PanditAvailability;
  bio: string;
  bioHi: string;
  status: PanditStatus;
  firebaseUid: string | null;
  createdAt: Date;
}

export interface PanditAvailability {
  isOnline?: boolean;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  nextAvailable?: string;
}

export interface PanditSession {
  id: string;
  userId: string;
  panditId: string;
  type: SessionType;
  startTime: Date | null;
  endTime: Date | null;
  durationMinutes: number | null;
  cost: number;
  aiBriefJson: PanditAIBrief | null;
  aiSummaryJson: PanditAISummary | null;
  messagesJson: PanditMessage[];
  rating: number | null;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PanditMessage {
  role: 'user' | 'pandit';
  content: string;
  timestamp: string;
}

export interface PanditAIBrief {
  problemCategory: string;
  problemDuration: string;
  chartHighlights: string;
  currentDasha: string;
  severity: string;
  currentRemedies: string[];
  userExpectations: string;
  instructionNote: string;
}

export interface PanditAISummary {
  keyPoints: string[];
  newRemedies: Array<{
    name: string;
    nameHi: string;
    type: 'mantra' | 'puja' | 'practice';
    description: string;
    price?: number;
    pujaId?: string;
  }>;
  timelineGuidance: string;
}

export interface PanditWithAvailability extends Pandit {
  isAvailableNow: boolean;
  isAiRecommended?: boolean;
}

export interface CreateSessionInput {
  panditId: string;
  type: SessionType;
}

export interface EndSessionInput {
  rating?: number;
}
