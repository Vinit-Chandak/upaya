/** Phase 3: Remedy Protocol Types */

export type ProtocolStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type RemedyTaskType = 'mantra' | 'fasting' | 'daan' | 'daily_practice';

export interface RemedyProtocol {
  id: string;
  userId: string;
  reportId: string | null;
  name: string;
  nameHi: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: ProtocolStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RemedyTask {
  id: string;
  protocolId: string;
  name: string;
  nameHi: string;
  type: RemedyTaskType;
  description: string;
  descriptionHi: string;
  frequency: string;
  frequencyHi: string;
  mantraTextRoman: string | null;
  mantraTextDevanagari: string | null;
  mantraAudioUrl: string | null;
  targetCount: number;
  dayOfWeek: string | null;
  createdAt: Date;
}

export interface RemedyCompletion {
  id: string;
  taskId: string;
  userId: string;
  completedDate: string;
  count: number;
  durationSeconds: number | null;
  karmaPoints: number;
  createdAt: Date;
}

export interface Streak {
  id: string;
  userId: string;
  taskId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KarmaPointEntry {
  id: string;
  userId: string;
  points: number;
  source: KarmaSource;
  sourceId: string | null;
  description: string;
  createdAt: Date;
}

export type KarmaSource =
  | 'daily_task'
  | 'puja_completion'
  | 'week_streak'
  | 'milestone_7day'
  | 'milestone_21day'
  | 'milestone_63day'
  | 'mantra_session';

/** Karma points awarded per action */
export const KARMA_POINTS = {
  dailyTask: 10,
  pujaCompletion: 50,
  weekStreak: 100,
  milestone7Day: 50,
  milestone21Day: 150,
  milestone63Day: 500,
  mantraSession: 15,
} as const;

export interface ProtocolWithTasks extends RemedyProtocol {
  tasks: RemedyTaskWithProgress[];
}

export interface RemedyTaskWithProgress extends RemedyTask {
  todayDone: boolean;
  completedCount: number;
  streak: number;
}

export interface WeeklyStatsData {
  days: Array<{ date: string; completed: boolean }>;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  karmaPoints: number;
}

export interface CreateProtocolInput {
  reportId?: string;
  name: string;
  nameHi: string;
  startDate: string;
  totalDays: number;
  tasks: Array<{
    name: string;
    nameHi: string;
    type: RemedyTaskType;
    description: string;
    descriptionHi: string;
    frequency: string;
    frequencyHi: string;
    mantraTextRoman?: string;
    mantraTextDevanagari?: string;
    mantraAudioUrl?: string;
    targetCount: number;
    dayOfWeek?: string;
  }>;
}

export interface CompleteTaskInput {
  count?: number;
  durationSeconds?: number;
}
