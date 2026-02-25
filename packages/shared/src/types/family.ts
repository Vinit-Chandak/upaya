/** Phase 4: Family Kundli Vault Types */

export type FamilyRelationship =
  | 'spouse'
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'other';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: FamilyRelationship;
  kundliId: string | null;
  createdAt: Date;
}

export interface FamilyMemberWithKundli extends FamilyMember {
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  currentDasha: string | null;
}

export interface CreateFamilyMemberInput {
  name: string;
  relationship: FamilyRelationship;
  dateOfBirth: string;
  timeOfBirth?: string;
  timeApproximate?: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
}

export const FAMILY_RELATIONSHIPS: Array<{
  key: FamilyRelationship;
  label: string;
  labelHi: string;
}> = [
  { key: 'spouse', label: 'Spouse', labelHi: 'पति/पत्नी' },
  { key: 'son', label: 'Son', labelHi: 'बेटा' },
  { key: 'daughter', label: 'Daughter', labelHi: 'बेटी' },
  { key: 'father', label: 'Father', labelHi: 'पिताजी' },
  { key: 'mother', label: 'Mother', labelHi: 'माताजी' },
  { key: 'brother', label: 'Brother', labelHi: 'भाई' },
  { key: 'sister', label: 'Sister', labelHi: 'बहन' },
  { key: 'other', label: 'Other', labelHi: 'अन्य' },
];
