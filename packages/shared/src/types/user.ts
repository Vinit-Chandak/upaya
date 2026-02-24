export type Language = 'hi' | 'en';

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  language: Language;
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  phone?: string;
  email?: string;
  name?: string;
  language: Language;
  firebaseUid: string;
}
