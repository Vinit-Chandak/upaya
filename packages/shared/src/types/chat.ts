export type ProblemType =
  | 'marriage_delay'
  | 'career_stuck'
  | 'money_problems'
  | 'health_issues'
  | 'legal_matters'
  | 'family_conflict'
  | 'get_kundli'
  | 'something_else';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type ChatMessageType =
  | 'text'
  | 'quick_reply'
  | 'birth_details_form'
  | 'diagnosis_card'
  | 'remedy_card'
  | 'paywall_card'
  | 'report_card'
  | 'cta_button';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  messageType: ChatMessageType;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string | null;
  sessionId: string;
  problemType: ProblemType | null;
  language: 'hi' | 'en';
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickReplyOption {
  label: string;
  value: string;
}

export interface SendMessageInput {
  sessionId: string;
  content: string;
  messageType?: ChatMessageType;
  metadata?: Record<string, unknown>;
}

/** Problem type display info */
export const PROBLEM_TYPES: Record<
  ProblemType,
  { hi: string; en: string; emoji: string }
> = {
  marriage_delay: { hi: 'शादी में देरी', en: 'Marriage Delay', emoji: '💍' },
  career_stuck: { hi: 'करियर में रुकावट', en: 'Career Stuck', emoji: '💼' },
  money_problems: { hi: 'पैसे की समस्या', en: 'Money Problems', emoji: '💰' },
  health_issues: { hi: 'स्वास्थ्य समस्या', en: 'Health Issues', emoji: '🏥' },
  legal_matters: { hi: 'कानूनी विवाद', en: 'Legal Matters', emoji: '⚖️' },
  family_conflict: { hi: 'पारिवारिक कलह', en: 'Family Conflict', emoji: '👨‍👩‍👧‍👦' },
  get_kundli: { hi: 'कुंडली बनवाएं', en: 'Get My Kundli', emoji: '📖' },
  something_else: { hi: 'कुछ और पूछना है', en: 'Something Else', emoji: '🔮' },
};
