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
} from '@upaya/shared';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swisseph = require('swisseph');

/**
 * Swiss Ephemeris-based Kundli calculation service.
 *
 * Uses the swisseph npm package (Node.js bindings for Swiss Ephemeris C library)
 * for accurate sidereal planetary position calculations.
 *
 * Configuration:
 * - Ayanamsa: Lahiri (SE_SIDM_LAHIRI) — standard for Vedic astrology
 * - House system: Whole Sign ('W') — most traditional in Jyotish
 * - Ephemeris mode: Moshier (built-in, no data files needed, 0.1 arcsec precision)
 * - Node type: True Node (SE_TRUE_NODE) for Rahu
 * - Timezone: IST (UTC+5:30) — target audience is Indian users
 */

// Configure Lahiri ayanamsa for sidereal calculations
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

// Planet IDs mapped to Swiss Ephemeris constants
// Ketu is not a real body — it's computed as Rahu + 180°
const PLANET_IDS: Array<{ id: number; planet: Planet }> = [
  { id: swisseph.SE_SUN, planet: 'sun' },
  { id: swisseph.SE_MOON, planet: 'moon' },
  { id: swisseph.SE_MARS, planet: 'mars' },
  { id: swisseph.SE_MERCURY, planet: 'mercury' },
  { id: swisseph.SE_JUPITER, planet: 'jupiter' },
  { id: swisseph.SE_VENUS, planet: 'venus' },
  { id: swisseph.SE_SATURN, planet: 'saturn' },
  { id: swisseph.SE_TRUE_NODE, planet: 'rahu' },
];

// Calculation flags: sidereal positions + include speed + use Moshier ephemeris
const CALC_FLAGS: number =
  swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

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

/** Normalize degree to [0, 360) range */
function normalizeDegree(degree: number): number {
  return ((degree % 360) + 360) % 360;
}

/** Convert a sidereal degree to its zodiac sign */
function degreeToSign(degree: number): ZodiacSign {
  return ZODIAC_SIGNS[Math.floor(normalizeDegree(degree) / 30)];
}

/**
 * Determine house number using Whole Sign system.
 * In Whole Sign houses, each zodiac sign corresponds to exactly one house.
 * The sign containing the ascendant is House 1.
 */
function degreeToHouse(planetDegree: number, ascendantDegree: number): HouseNumber {
  const planetSign = Math.floor(normalizeDegree(planetDegree) / 30);
  const ascendantSign = Math.floor(normalizeDegree(ascendantDegree) / 30);
  const house = ((planetSign - ascendantSign + 12) % 12) + 1;
  return house as HouseNumber;
}

/** Get nakshatra and pada from sidereal degree */
function degreeToNakshatra(degree: number): { name: string; pada: number } {
  const normalized = normalizeDegree(degree);
  const nakshatraSpan = 360 / 27; // 13.333...°
  const nakshatraIndex = Math.floor(normalized / nakshatraSpan);
  const padaSpan = nakshatraSpan / 4;
  const pada = Math.floor((normalized % nakshatraSpan) / padaSpan) + 1;
  return {
    name: NAKSHATRAS[nakshatraIndex % 27],
    pada: Math.min(pada, 4),
  };
}

/**
 * Generate kundli data using Swiss Ephemeris with Lahiri ayanamsa.
 */
export async function generateKundli(input: GenerateKundliInput): Promise<KundliData> {
  const { dateOfBirth, timeOfBirth, placeOfBirthLat, placeOfBirthLng } = input;

  // Parse date
  const [year, month, day] = dateOfBirth.split('-').map(Number);

  // Parse time (default to noon if not provided)
  let hours = 12;
  if (timeOfBirth) {
    const [h, m] = timeOfBirth.split(':').map(Number);
    hours = h + m / 60;
  }

  // Convert IST to UTC (IST = UTC+5:30)
  // Note: Target audience is Indian users. For international support,
  // timezone detection based on birth coordinates would be needed.
  const utcHours = hours - 5.5;

  // Calculate Julian Day using Swiss Ephemeris
  const julianDay: number = swisseph.swe_julday(
    year, month, day, utcHours, swisseph.SE_GREG_CAL,
  );

  // Get Lahiri ayanamsa for this date
  const ayanamsa: number = swisseph.swe_get_ayanamsa_ut(julianDay);

  // Get tropical ascendant from house calculation, then convert to sidereal.
  // swe_houses returns tropical values; we subtract ayanamsa for sidereal.
  const housesResult = swisseph.swe_houses(
    julianDay, placeOfBirthLat, placeOfBirthLng, 'W',
  );
  const siderealAscendant = normalizeDegree(
    (housesResult.ascendant as number) - ayanamsa,
  );

  // Calculate sidereal planetary positions for all 8 bodies (Ketu computed separately)
  const planetaryPositions: PlanetPosition[] = [];

  for (const { id, planet } of PLANET_IDS) {
    const result = swisseph.swe_calc_ut(julianDay, id, CALC_FLAGS);

    if (result.error) {
      throw new Error(`Swiss Ephemeris error for ${planet}: ${result.error}`);
    }

    const degree = normalizeDegree(result.longitude as number);
    const nakshatra = degreeToNakshatra(degree);

    planetaryPositions.push({
      planet,
      sign: degreeToSign(degree),
      house: degreeToHouse(degree, siderealAscendant),
      degree: parseFloat(degree.toFixed(4)),
      isRetrograde: (result.longitudeSpeed as number) < 0,
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
    });
  }

  // Add Ketu (180° opposite to Rahu — always retrograde in Vedic astrology)
  const rahuPos = planetaryPositions.find((p) => p.planet === 'rahu')!;
  const ketuDegree = normalizeDegree(rahuPos.degree + 180);
  const ketuNakshatra = degreeToNakshatra(ketuDegree);
  planetaryPositions.push({
    planet: 'ketu',
    sign: degreeToSign(ketuDegree),
    house: degreeToHouse(ketuDegree, siderealAscendant),
    degree: parseFloat(ketuDegree.toFixed(4)),
    isRetrograde: true,
    nakshatra: ketuNakshatra.name,
    nakshatraPada: ketuNakshatra.pada,
  });

  // Build Whole Sign house cusps: each sign = one house, starting from ascendant sign
  const ascendantSignIndex = Math.floor(normalizeDegree(siderealAscendant) / 30);
  const houseCusps: HouseCusp[] = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (ascendantSignIndex + i) % 12;
    return {
      house: (i + 1) as HouseNumber,
      sign: ZODIAC_SIGNS[signIndex],
      degree: parseFloat((signIndex * 30).toFixed(4)),
    };
  });

  // Detect doshas using rule engine
  const doshas = detectDoshas(planetaryPositions);

  // Generate Vimshottari Dasha period based on Moon's nakshatra
  const currentDasha = generateCurrentDasha(planetaryPositions);

  return {
    planetaryPositions,
    houseCusps,
    doshas,
    currentDasha,
    dashaSequence: [currentDasha],
    ayanamsa: parseFloat(ayanamsa.toFixed(6)),
    ascendantSign: degreeToSign(siderealAscendant),
    ascendantDegree: parseFloat(siderealAscendant.toFixed(4)),
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
  // Mars in houses 1, 2, 4, 7, 8, 12 indicates Mangal Dosha (affects marriage)
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
  // Saturn in houses 1, 4, 7, 8, 10, 12 creates challenging influences
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
  // All planets hemmed between Rahu and Ketu indicates life stagnation
  const rahuHouse = getHouse('rahu');
  const ketuHouse = getHouse('ketu');
  if (rahuHouse && ketuHouse) {
    const otherPlanets = positions.filter(
      (p) => p.planet !== 'rahu' && p.planet !== 'ketu',
    );
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
  // Sun and Rahu in the same house indicates ancestral affliction
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
  // Rahu or Ketu in angular houses (1, 4, 7, 10) creates nodal influence
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
 *
 * The Vimshottari Dasha system assigns planetary periods (Mahadashas)
 * based on the nakshatra the Moon occupies at birth. Each of the 27
 * nakshatras is ruled by one of 9 planets in a fixed sequence.
 */
function generateCurrentDasha(positions: PlanetPosition[]): DashaPeriod {
  const moon = positions.find((p) => p.planet === 'moon');
  const nakshatraLords: Planet[] = [
    'ketu', 'venus', 'sun', 'moon', 'mars', 'rahu',
    'jupiter', 'saturn', 'mercury',
  ];

  // Map Moon's nakshatra to its ruling planet (dasha lord)
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
