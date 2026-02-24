import type { DoshaType, HouseNumber, Planet, DashaPeriod } from './kundli';
import type { ProblemType } from './chat';

export type SeverityLevel = 'significant' | 'moderate' | 'mild';
export type ResponsivenessLevel = 'highly_responsive' | 'responsive' | 'moderately_responsive';

export interface DiagnosisResult {
  rootDosha: DoshaType;
  rootPlanets: Planet[];
  affectedHouses: HouseNumber[];
  severityLevel: SeverityLevel;
  responsivenessLevel: ResponsivenessLevel;
  isCommonlyAddressed: boolean;
  impactedAreas: {
    primary: string;
    secondary: string[];
  };
  currentDasha: DashaPeriod;
  positiveMessage: string;
}

export interface FreeRemedy {
  id: string;
  name: string;
  type: 'mantra' | 'fasting' | 'daan' | 'daily_practice';
  description: string;
  mantraText?: {
    roman: string;
    devanagari: string;
  };
  frequency: string;
  duration: string;
  audioUrl?: string;
}

export interface PaidRemedyPreview {
  id: string;
  name: string;
  description: string;
  isLocked: true;
}

export interface Diagnosis {
  id: string;
  kundliId: string;
  chatSessionId: string;
  problemType: ProblemType;
  result: DiagnosisResult;
  freeRemedies: FreeRemedy[];
  paidRemedyPreviews: PaidRemedyPreview[];
  llmProvider: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  diagnosisId: string;
  type: 'full_remedy_plan';
  status: 'generating' | 'ready' | 'failed';
  pdfUrl: string | null;
  createdAt: Date;
}
