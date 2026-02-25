/** Phase 3: Notification Types */

export type NotificationType =
  | 'transit_alert'
  | 'festival_remedy'
  | 'remedy_reminder'
  | 'streak_alert'
  | 'puja_update'
  | 'prasad_shipping'
  | 'check_in'
  | 'dasha_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  dataJson: Record<string, unknown> | null;
  read: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  remedyReminders: boolean;
  transitAlerts: boolean;
  festivalRemedies: boolean;
  pujaUpdates: boolean;
  promotional: boolean;
  reminderTimeMorning: string;
  reminderTimeEvening: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotificationSettingsInput {
  remedyReminders?: boolean;
  transitAlerts?: boolean;
  festivalRemedies?: boolean;
  pujaUpdates?: boolean;
  promotional?: boolean;
  reminderTimeMorning?: string;
  reminderTimeEvening?: string;
}
