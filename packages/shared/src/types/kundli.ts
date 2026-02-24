export type Planet =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  house: HouseNumber;
  degree: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraPada: number;
}

export interface HouseCusp {
  house: HouseNumber;
  sign: ZodiacSign;
  degree: number;
}

export type DoshaType =
  | 'mangal'
  | 'shani'
  | 'rahu_ketu'
  | 'kaal_sarp'
  | 'pitra';

export interface DoshaResult {
  type: DoshaType;
  isPresent: boolean;
  severity: number;
  affectedHouses: HouseNumber[];
  affectedLifeAreas: string[];
  description: string;
}

export type DashaPeriodLevel = 'mahadasha' | 'antardasha' | 'pratyantardasha';

export interface DashaPeriod {
  planet: Planet;
  level: DashaPeriodLevel;
  startDate: Date;
  endDate: Date;
}

export interface KundliData {
  planetaryPositions: PlanetPosition[];
  houseCusps: HouseCusp[];
  doshas: DoshaResult[];
  currentDasha: DashaPeriod;
  dashaSequence: DashaPeriod[];
  ayanamsa: number;
  ascendantSign: ZodiacSign;
  ascendantDegree: number;
}

export interface Kundli {
  id: string;
  userId: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  timeApproximate: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
  planetaryData: KundliData;
  createdAt: Date;
}

export interface GenerateKundliInput {
  dateOfBirth: string;
  timeOfBirth?: string;
  timeApproximate?: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
}

/** Planet display names (used in UI) */
export const PLANET_NAMES: Record<Planet, { hi: string; en: string; symbol: string }> = {
  sun: { hi: 'सूर्य', en: 'Sun', symbol: '☀️' },
  moon: { hi: 'चन्द्रमा', en: 'Moon', symbol: '🌙' },
  mars: { hi: 'मंगल', en: 'Mars', symbol: '♂️' },
  mercury: { hi: 'बुध', en: 'Mercury', symbol: '☿' },
  jupiter: { hi: 'गुरु', en: 'Jupiter', symbol: '♃' },
  venus: { hi: 'शुक्र', en: 'Venus', symbol: '♀' },
  saturn: { hi: 'शनि', en: 'Saturn', symbol: '♄' },
  rahu: { hi: 'राहु', en: 'Rahu', symbol: '☊' },
  ketu: { hi: 'केतु', en: 'Ketu', symbol: '☋' },
};

export const ZODIAC_NAMES: Record<ZodiacSign, { hi: string; en: string }> = {
  aries: { hi: 'मेष', en: 'Aries' },
  taurus: { hi: 'वृषभ', en: 'Taurus' },
  gemini: { hi: 'मिथुन', en: 'Gemini' },
  cancer: { hi: 'कर्क', en: 'Cancer' },
  leo: { hi: 'सिंह', en: 'Leo' },
  virgo: { hi: 'कन्या', en: 'Virgo' },
  libra: { hi: 'तुला', en: 'Libra' },
  scorpio: { hi: 'वृश्चिक', en: 'Scorpio' },
  sagittarius: { hi: 'धनु', en: 'Sagittarius' },
  capricorn: { hi: 'मकर', en: 'Capricorn' },
  aquarius: { hi: 'कुम्भ', en: 'Aquarius' },
  pisces: { hi: 'मीन', en: 'Pisces' },
};
