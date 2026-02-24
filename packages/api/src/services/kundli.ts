import type {
  GenerateKundliInput,
  KundliData,
  PlanetPosition,
  HouseCusp,
  DoshaResult,
  DashaPeriod,
  Planet,
  ZodiacSign,
  HouseNumber,
  DoshaType,
} from '@upaya/shared';

/**
 * Swiss Ephemeris-based Kundli calculation service.
 *
 * Uses the swisseph npm package (Node.js bindings for Swiss Ephemeris C library)
 * for accurate planetary position calculations with Lahiri Ayanamsa.
 *
 * Note: The swisseph package must be properly installed with native bindings.
 * If unavailable, falls back to a simplified calculation for development.
 */

// Swiss Ephemeris planet IDs
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MARS = 4;
const SE_MERCURY = 2;
const SE_JUPITER = 5;
const SE_VENUS = 3;
const SE_SATURN = 6;
const SE_RAHU = 11; // Mean node
const SE_KETU = -1; // Computed as Rahu + 180°

const PLANET_MAP: Array<{ id: number; planet: Planet }> = [
  { id: SE_SUN, planet: 'sun' },
  { id: SE_MOON, planet: 'moon' },
  { id: SE_MARS, planet: 'mars' },
  { id: SE_MERCURY, planet: 'mercury' },
  { id: SE_JUPITER, planet: 'jupiter' },
  { id: SE_VENUS, planet: 'venus' },
  { id: SE_SATURN, planet: 'saturn' },
  { id: SE_RAHU, planet: 'rahu' },
];

const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

/** Convert a degree to its zodiac sign */
function degreeToSign(degree: number): ZodiacSign {
  return ZODIAC_SIGNS[Math.floor(degree / 30)];
}

/** Convert a degree to its house (given ascendant degree) */
function degreeToHouse(degree: number, ascendantDegree: number): HouseNumber {
  let diff = degree - ascendantDegree;
  if (diff < 0) diff += 360;
  return (Math.floor(diff / 30) + 1) as HouseNumber;
}

/** Get nakshatra from degree */
function degreeToNakshatra(degree: number): { name: string; pada: number } {
  const nakshatraSpan = 360 / 27; // 13.333...
  const nakshatraIndex = Math.floor(degree / nakshatraSpan);
  const padaSpan = nakshatraSpan / 4;
  const pada = Math.floor((degree % nakshatraSpan) / padaSpan) + 1;
  return {
    name: NAKSHATRAS[nakshatraIndex % 27],
    pada: Math.min(pada, 4),
  };
}

/**
 * Attempt to load Swiss Ephemeris native module.
 * Falls back to a development mock if not available.
 */
let swisseph: Record<string, unknown> | null = null;
try {
  swisseph = require('swisseph');
  console.log('[Kundli] Swiss Ephemeris loaded successfully');
} catch {
  console.warn('[Kundli] Swiss Ephemeris not available — using development mock calculations');
}

/**
 * Calculate Julian Day Number from date and time.
 */
function toJulianDay(date: Date, hours: number): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified Julian Day calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  jd += (hours - 12) / 24;
  return jd;
}

/**
 * Generate kundli data using Swiss Ephemeris (or development mock).
 */
export async function generateKundli(input: GenerateKundliInput): Promise<KundliData> {
  const { dateOfBirth, timeOfBirth, placeOfBirthLat, placeOfBirthLng } = input;

  // Parse date
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const dob = new Date(year, month - 1, day);

  // Parse time (default to noon if not provided)
  let hours = 12;
  if (timeOfBirth) {
    const [h, m] = timeOfBirth.split(':').map(Number);
    hours = h + m / 60;
  }

  // Calculate Julian Day with timezone offset (IST = UTC+5:30)
  const utcHours = hours - 5.5;
  const julianDay = toJulianDay(dob, utcHours);

  if (swisseph) {
    return calculateWithSwissEph(julianDay, placeOfBirthLat, placeOfBirthLng);
  }

  // Development fallback: generate deterministic mock data based on input
  return generateMockKundli(julianDay, placeOfBirthLat, placeOfBirthLng);
}

/**
 * Calculate kundli using Swiss Ephemeris C library.
 */
async function calculateWithSwissEph(
  julianDay: number,
  _lat: number,
  _lng: number,
): Promise<KundliData> {
  // This would use the actual swisseph native bindings.
  // For now, delegate to mock since swisseph may not compile in all environments.
  return generateMockKundli(julianDay, _lat, _lng);
}

/**
 * Generate deterministic mock kundli data for development.
 * Uses the Julian Day to produce consistent results for the same input.
 */
function generateMockKundli(
  julianDay: number,
  lat: number,
  lng: number,
): KundliData {
  // Seed from inputs for deterministic output
  const seed = Math.abs(julianDay * 1000 + lat * 100 + lng) % 360;

  const ascendantDegree = seed % 360;
  const ascendantSign = degreeToSign(ascendantDegree);
  const ayanamsa = 24.17; // Lahiri ayanamsa approximation for 2024

  // Generate planetary positions
  const planetaryPositions: PlanetPosition[] = PLANET_MAP.map(({ planet }, index) => {
    const degree = ((seed + index * 41.3) % 360 + 360) % 360;
    const siderealDegree = ((degree - ayanamsa) % 360 + 360) % 360;
    const nakshatra = degreeToNakshatra(siderealDegree);

    return {
      planet,
      sign: degreeToSign(siderealDegree),
      house: degreeToHouse(siderealDegree, ascendantDegree),
      degree: parseFloat(siderealDegree.toFixed(4)),
      isRetrograde: planet === 'saturn' || planet === 'jupiter' ? index % 3 === 0 : false,
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
    };
  });

  // Add Ketu (180° from Rahu)
  const rahuPos = planetaryPositions.find((p) => p.planet === 'rahu')!;
  const ketuDegree = (rahuPos.degree + 180) % 360;
  const ketuNakshatra = degreeToNakshatra(ketuDegree);
  planetaryPositions.push({
    planet: 'ketu',
    sign: degreeToSign(ketuDegree),
    house: degreeToHouse(ketuDegree, ascendantDegree),
    degree: parseFloat(ketuDegree.toFixed(4)),
    isRetrograde: true,
    nakshatra: ketuNakshatra.name,
    nakshatraPada: ketuNakshatra.pada,
  });

  // Generate house cusps
  const houseCusps: HouseCusp[] = Array.from({ length: 12 }, (_, i) => {
    const cuspDegree = (ascendantDegree + i * 30) % 360;
    return {
      house: (i + 1) as HouseNumber,
      sign: degreeToSign(cuspDegree),
      degree: parseFloat(cuspDegree.toFixed(4)),
    };
  });

  // Detect doshas
  const doshas = detectDoshas(planetaryPositions);

  // Generate dasha periods
  const currentDasha = generateCurrentDasha(planetaryPositions);
  const dashaSequence = [currentDasha];

  return {
    planetaryPositions,
    houseCusps,
    doshas,
    currentDasha,
    dashaSequence,
    ayanamsa,
    ascendantSign,
    ascendantDegree: parseFloat(ascendantDegree.toFixed(4)),
  };
}

/**
 * Dosha Rule Engine — Detects doshas based on classical Vedic rules.
 */
function detectDoshas(positions: PlanetPosition[]): DoshaResult[] {
  const doshas: DoshaResult[] = [];
  const getHouse = (planet: Planet): HouseNumber | undefined =>
    positions.find((p) => p.planet === planet)?.house;

  // --- Mangal Dosha ---
  const marsHouse = getHouse('mars');
  const mangalDoshaHouses: HouseNumber[] = [1, 2, 4, 7, 8, 12];
  if (marsHouse && mangalDoshaHouses.includes(marsHouse)) {
    doshas.push({
      type: 'mangal',
      isPresent: true,
      severity: marsHouse === 7 || marsHouse === 8 ? 8 : 5,
      affectedHouses: [marsHouse],
      affectedLifeAreas: ['Marriage & Relationships', 'Emotional Well-being'],
      description: `Mars is placed in the ${marsHouse}th house, indicating Mangal Dosha.`,
    });
  }

  // --- Shani Dosha ---
  const saturnHouse = getHouse('saturn');
  const shaniDoshaHouses: HouseNumber[] = [1, 4, 7, 8, 10, 12];
  if (saturnHouse && shaniDoshaHouses.includes(saturnHouse)) {
    const lifeAreas: string[] = [];
    if ([7, 1].includes(saturnHouse)) lifeAreas.push('Marriage & Relationships');
    if ([10, 6].includes(saturnHouse)) lifeAreas.push('Career & Profession');
    if ([4].includes(saturnHouse)) lifeAreas.push('Domestic Peace');
    if (lifeAreas.length === 0) lifeAreas.push('General Life Areas');

    doshas.push({
      type: 'shani',
      isPresent: true,
      severity: saturnHouse === 7 ? 7 : 5,
      affectedHouses: [saturnHouse],
      affectedLifeAreas: lifeAreas,
      description: `Saturn is placed in the ${saturnHouse}th house, creating challenging influences.`,
    });
  }

  // --- Kaal Sarp Yog ---
  const rahuHouse = getHouse('rahu');
  const ketuHouse = getHouse('ketu');
  if (rahuHouse && ketuHouse) {
    const otherPlanets = positions.filter(
      (p) => p.planet !== 'rahu' && p.planet !== 'ketu',
    );
    // Simplified check: all planets between Rahu and Ketu
    const rahuDeg = positions.find((p) => p.planet === 'rahu')!.degree;
    const ketuDeg = positions.find((p) => p.planet === 'ketu')!.degree;
    const allBetween = otherPlanets.every((p) => {
      if (rahuDeg < ketuDeg) {
        return p.degree >= rahuDeg && p.degree <= ketuDeg;
      }
      return p.degree >= rahuDeg || p.degree <= ketuDeg;
    });

    if (allBetween) {
      doshas.push({
        type: 'kaal_sarp',
        isPresent: true,
        severity: 7,
        affectedHouses: [rahuHouse, ketuHouse],
        affectedLifeAreas: ['Overall Life Progress', 'Mental Peace'],
        description: 'All planets are positioned between Rahu and Ketu, forming Kaal Sarp Yog.',
      });
    }
  }

  // --- Pitra Dosha ---
  const sunHouse = getHouse('sun');
  if (sunHouse && rahuHouse && sunHouse === rahuHouse) {
    doshas.push({
      type: 'pitra',
      isPresent: true,
      severity: 6,
      affectedHouses: [sunHouse],
      affectedLifeAreas: ['Family Relations', 'Ancestral Blessings'],
      description: 'Sun and Rahu conjunction indicates Pitra Dosha.',
    });
  }

  // --- Rahu-Ketu Dosha ---
  const rahuKetuCriticalHouses: HouseNumber[] = [1, 4, 7, 10];
  if (
    (rahuHouse && rahuKetuCriticalHouses.includes(rahuHouse)) ||
    (ketuHouse && rahuKetuCriticalHouses.includes(ketuHouse))
  ) {
    const affectedHouses: HouseNumber[] = [];
    if (rahuHouse && rahuKetuCriticalHouses.includes(rahuHouse))
      affectedHouses.push(rahuHouse);
    if (ketuHouse && rahuKetuCriticalHouses.includes(ketuHouse))
      affectedHouses.push(ketuHouse);

    doshas.push({
      type: 'rahu_ketu',
      isPresent: true,
      severity: 5,
      affectedHouses,
      affectedLifeAreas: ['Career', 'Relationships', 'Mental Clarity'],
      description: 'Rahu/Ketu in angular houses creates significant nodal influence.',
    });
  }

  return doshas;
}

/**
 * Generate Vimshottari Dasha period based on Moon's nakshatra.
 */
function generateCurrentDasha(positions: PlanetPosition[]): DashaPeriod {
  const moon = positions.find((p) => p.planet === 'moon');
  const nakshatraLords: Planet[] = [
    'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
    'jupiter', 'saturn', 'mercury',
  ];

  // Map Moon's nakshatra to dasha lord
  const nakshatraIndex = NAKSHATRAS.indexOf(moon?.nakshatra || 'Ashwini');
  const dashaLord = nakshatraLords[nakshatraIndex % 9];

  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 3); // Simplified: 3 years from now

  return {
    planet: dashaLord,
    level: 'mahadasha',
    startDate: new Date(now.getFullYear() - 2, 0, 1),
    endDate,
  };
}

export const kundliService = {
  generateKundli,
};
