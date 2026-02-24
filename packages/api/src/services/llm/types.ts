import type { ProblemType } from '@upaya/shared';

/**
 * Provider-agnostic LLM interfaces.
 * All LLM providers must implement the LLMProvider interface.
 */

export interface DiagnosisInput {
  kundliData: Record<string, unknown>;
  problemType: ProblemType;
  emotionalContext: string;
  qualifyingAnswer: string;
  language: 'hi' | 'en';
}

export interface DiagnosisOutput {
  rootDosha: string;
  rootPlanets: string[];
  affectedHouses: number[];
  severityLevel: 'significant' | 'moderate' | 'mild';
  responsivenessLevel: 'highly_responsive' | 'responsive' | 'moderately_responsive';
  isCommonlyAddressed: boolean;
  impactedAreas: {
    primary: string;
    secondary: string[];
  };
  positiveMessage: string;
  freeRemedies: Array<{
    name: string;
    type: 'mantra' | 'fasting' | 'daan' | 'daily_practice';
    description: string;
    mantraText?: { roman: string; devanagari: string };
    frequency: string;
    duration: string;
  }>;
  fullRemedies: Array<{
    name: string;
    description: string;
  }>;
}

export interface ChatInput {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
  language: 'hi' | 'en';
}

export interface ChatOutput {
  content: string;
  quickReplies?: Array<{ label: string; value: string }>;
}

export interface LLMProvider {
  readonly name: string;

  /** Generate a kundli diagnosis from chart data + user context */
  generateDiagnosis(input: DiagnosisInput): Promise<DiagnosisOutput>;

  /** Generate a chat response */
  generateChatResponse(input: ChatInput): Promise<ChatOutput>;
}

export interface LLMUsageMetrics {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  cost: number;
}
