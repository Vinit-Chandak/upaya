'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Relationship } from '@upaya/shared';
import styles from './BirthDetailsCard.module.css';

// Popular Indian cities shown when input is empty
const POPULAR_CITIES = [
  { name: 'Delhi, India', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai, Maharashtra, India', lat: 19.076, lng: 72.8777 },
  { name: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462 },
  { name: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873 },
  { name: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lng: 82.9739 },
  { name: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639 },
  { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad, Telangana, India', lat: 17.385, lng: 78.4867 },
  { name: 'Patna, Bihar, India', lat: 25.6093, lng: 85.1376 },
  { name: 'Bhopal, Madhya Pradesh, India', lat: 23.2599, lng: 77.4126 },
];

const APPROX_OPTIONS_HI = [
  { key: 'morning', label: 'सुबह (6 AM - 12 PM)', time: '09:00' },
  { key: 'afternoon', label: 'दोपहर (12 PM - 4 PM)', time: '14:00' },
  { key: 'evening', label: 'शाम (4 PM - 8 PM)', time: '18:00' },
  { key: 'night', label: 'रात (8 PM - 6 AM)', time: '01:00' },
  { key: 'dontknow', label: 'बिल्कुल नहीं पता', time: '' },
];

const APPROX_OPTIONS_EN = [
  { key: 'morning', label: 'Morning (6 AM - 12 PM)', time: '09:00' },
  { key: 'afternoon', label: 'Afternoon (12 PM - 4 PM)', time: '14:00' },
  { key: 'evening', label: 'Evening (4 PM - 8 PM)', time: '18:00' },
  { key: 'night', label: 'Night (8 PM - 6 AM)', time: '01:00' },
  { key: 'dontknow', label: "Don't know at all", time: '' },
];

const RELATIONSHIP_OPTIONS: { key: Relationship; emoji: string; hi: string; en: string }[] = [
  { key: 'self', emoji: '🙏', hi: 'मेरे लिए', en: 'For Me' },
  { key: 'family', emoji: '👨‍👩‍👦', hi: 'परिवार के लिए', en: 'For Family' },
  { key: 'pet', emoji: '🐾', hi: 'पालतू के लिए', en: 'For My Pet' },
];

interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface BirthDetailsCardProps {
  language: 'hi' | 'en';
  preselectedRelationship?: Relationship;
  onSubmit: (details: {
    personName: string;
    relationship: Relationship;
    dateOfBirth: string;
    timeOfBirth: string | null;
    timeApproximate: boolean;
    placeOfBirthName: string;
    placeOfBirthLat: number;
    placeOfBirthLng: number;
  }) => void;
  disabled?: boolean;
}

export default function BirthDetailsCard({
  language,
  preselectedRelationship,
  onSubmit,
  disabled,
}: BirthDetailsCardProps) {
  const [step, setStep] = useState(1);

  // Step 1: Who
  const [relationship, setRelationship] = useState<Relationship>(preselectedRelationship || 'self');
  const [personName, setPersonName] = useState('');

  // Step 2: When
  const [dob, setDob] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [unknownTime, setUnknownTime] = useState(false);
  const [selectedApprox, setSelectedApprox] = useState<string | null>(null);

  // Step 3: Where
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const placeInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const approxOptions = language === 'hi' ? APPROX_OPTIONS_HI : APPROX_OPTIONS_EN;

  // Search places using OpenStreetMap Nominatim API
  const searchPlaces = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setPlaceResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '8',
          addressdetails: '1',
          'accept-language': language === 'hi' ? 'hi,en' : 'en,hi',
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { 'User-Agent': 'Upaya-App/1.0' } },
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setPlaceResults(
          data.map((item: { display_name: string; lat: string; lon: string }) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          })),
        );
      } catch {
        setPlaceResults(
          POPULAR_CITIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
        );
      } finally {
        setIsSearching(false);
      }
    },
    [language],
  );

  const handlePlaceQueryChange = useCallback(
    (query: string) => {
      setPlaceQuery(query);
      setSelectedPlace(null);
      setShowPlaceResults(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (query.trim().length < 2) {
        setPlaceResults([]);
        return;
      }
      debounceRef.current = setTimeout(() => searchPlaces(query), 350);
    },
    [searchPlaces],
  );

  const handlePlaceSelect = useCallback((city: PlaceResult) => {
    setSelectedPlace(city);
    setPlaceQuery(city.name);
    setShowPlaceResults(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        placeInputRef.current &&
        !placeInputRef.current.parentElement?.contains(e.target as Node)
      ) {
        setShowPlaceResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Step validation
  const step1Valid = personName.trim().length > 0;
  const step2Valid = !!(dob && (unknownTime || timeOfBirth));
  const step3Valid = !!selectedPlace;

  const handleNext = () => {
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2 && step2Valid) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!selectedPlace) return;

    let finalTime: string | null = null;
    let isApproximate = false;

    if (unknownTime) {
      isApproximate = true;
      if (selectedApprox) {
        const opt = approxOptions.find((o) => o.key === selectedApprox);
        finalTime = opt?.time || null;
      }
    } else if (timeOfBirth) {
      const [rawHours, minutes] = timeOfBirth.split(':').map(Number);
      let hours = rawHours;
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      finalTime = `${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`;
    }

    onSubmit({
      personName: personName.trim(),
      relationship,
      dateOfBirth: dob,
      timeOfBirth: finalTime,
      timeApproximate: isApproximate,
      placeOfBirthName: selectedPlace.name,
      placeOfBirthLat: selectedPlace.lat,
      placeOfBirthLng: selectedPlace.lng,
    });
  };

  const displayResults = placeQuery.trim().length >= 2 ? placeResults : POPULAR_CITIES;

  const stepTitles = {
    hi: ['कौन के लिए?', 'जन्म का समय', 'जन्म स्थान'],
    en: ['For whom?', 'Birth Time', 'Place of Birth'],
  };

  const isCurrentStepValid = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  return (
    <div className={styles.card}>
      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        <div className={styles.stepDots}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`${styles.stepDot} ${
                s === step
                  ? styles.stepDotActive
                  : s < step
                    ? styles.stepDotDone
                    : ''
              }`}
            />
          ))}
        </div>
        <span className={styles.stepLabel}>
          {language === 'hi' ? `चरण ${step}/3` : `Step ${step}/3`}
        </span>
      </div>

      {/* Step title */}
      <div className={styles.cardTitle}>
        <span className={styles.cardTitleIcon}>
          {step === 1 ? '👤' : step === 2 ? '🕐' : '📍'}
        </span>
        <span>{stepTitles[language][step - 1]}</span>
      </div>

      {/* ── Step 1: Who ── */}
      {step === 1 && (
        <div className={styles.fieldGroup}>
          {/* Relationship chips */}
          <div className={styles.relChips}>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`${styles.relChip} ${relationship === opt.key ? styles.relChipActive : ''}`}
                onClick={() => setRelationship(opt.key)}
                disabled={disabled}
              >
                {opt.emoji} {language === 'hi' ? opt.hi : opt.en}
              </button>
            ))}
          </div>

          {/* Pet note */}
          {relationship === 'pet' && (
            <p className={styles.petNote}>
              {language === 'hi'
                ? '🐾 Vedic ज्योतिष में पालतू का कल्याण मालिक की कुंडली (6th house) से देखा जाता है।'
                : "🐾 In Vedic astrology, a pet's wellbeing is read through the owner's kundli (6th house)."}
            </p>
          )}

          {/* Name input */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldLabelIcon}>✏️</span>
              {relationship === 'pet'
                ? language === 'hi'
                  ? 'पालतू का नाम'
                  : "Pet's Name"
                : language === 'hi'
                  ? 'नाम'
                  : 'Name'}
            </label>
            <input
              type="text"
              className={styles.fieldInput}
              placeholder={
                relationship === 'pet'
                  ? language === 'hi'
                    ? 'जैसे: टॉमी, शेरू...'
                    : 'E.g. Tommy, Sheru...'
                  : language === 'hi'
                    ? 'जैसे: राहुल, प्रिया...'
                    : 'E.g. Rahul, Priya...'
              }
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              disabled={disabled}
              autoComplete="off"
            />
          </div>

          {relationship === 'pet' && (
            <p className={styles.petOwnerNote}>
              {language === 'hi'
                ? '(अगले step में मालिक के जन्म विवरण भरें)'
                : "(Next: fill in the owner's birth details)"}
            </p>
          )}
        </div>
      )}

      {/* ── Step 2: When ── */}
      {step === 2 && (
        <div className={styles.fieldGroup}>
          {/* Date of Birth */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldLabelIcon}>📅</span>
              {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
            </label>
            <input
              type="date"
              className={styles.fieldInput}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1940-01-01"
              disabled={disabled}
            />
          </div>

          {/* Time of Birth */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldLabelIcon}>🕐</span>
              {language === 'hi' ? 'जन्म का समय' : 'Time of Birth'}
            </label>

            {!unknownTime && (
              <div className={styles.timeRow}>
                <input
                  type="time"
                  className={`${styles.fieldInput} ${styles.timeInput}`}
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  disabled={disabled}
                />
                <div className={styles.ampmToggle}>
                  <button
                    className={`${styles.ampmOption} ${ampm === 'AM' ? styles.ampmOptionActive : ''}`}
                    onClick={() => setAmpm('AM')}
                    type="button"
                    disabled={disabled}
                  >
                    AM
                  </button>
                  <button
                    className={`${styles.ampmOption} ${ampm === 'PM' ? styles.ampmOptionActive : ''}`}
                    onClick={() => setAmpm('PM')}
                    type="button"
                    disabled={disabled}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={unknownTime}
                onChange={(e) => {
                  setUnknownTime(e.target.checked);
                  if (e.target.checked) setTimeOfBirth('');
                }}
                disabled={disabled}
              />
              <span className={styles.checkboxLabel}>
                {language === 'hi'
                  ? 'सही समय नहीं पता? (अनुमानित समय इस्तेमाल करेंगे)'
                  : "Don't know exact time? (We'll use approximate)"}
              </span>
            </label>

            {unknownTime && (
              <div className={styles.approxTimeOptions}>
                {approxOptions.map((opt) => (
                  <button
                    key={opt.key}
                    className={`${styles.approxTimeOption} ${
                      selectedApprox === opt.key ? styles.approxTimeOptionSelected : ''
                    }`}
                    onClick={() => setSelectedApprox(opt.key)}
                    type="button"
                    disabled={disabled}
                  >
                    <input
                      type="radio"
                      className={styles.approxTimeRadio}
                      checked={selectedApprox === opt.key}
                      onChange={() => setSelectedApprox(opt.key)}
                      name="approxTime"
                      disabled={disabled}
                    />
                    {opt.label}
                  </button>
                ))}
                <p className={styles.approxNote}>
                  {language === 'hi'
                    ? 'अनुमानित समय से भी कुंडली बनती है, लेकिन सही समय से ज़्यादा सटीक होती है।'
                    : 'Kundli can be generated with approximate time too, but exact time gives more accurate results.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Where ── */}
      {step === 3 && (
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <span className={styles.fieldLabelIcon}>📍</span>
              {language === 'hi' ? 'जन्म स्थान' : 'Place of Birth'}
            </label>
            <div className={styles.placeSearchWrapper}>
              <input
                ref={placeInputRef}
                type="text"
                className={styles.fieldInput}
                placeholder={
                  language === 'hi' ? 'शहर या गाँव का नाम लिखें...' : 'Type city or town name...'
                }
                value={placeQuery}
                onChange={(e) => handlePlaceQueryChange(e.target.value)}
                onFocus={() => setShowPlaceResults(true)}
                disabled={disabled}
              />

              {showPlaceResults && (
                <div className={styles.placeSearchResults}>
                  {placeQuery.trim().length < 2 && (
                    <div className={styles.popularCitiesLabel}>
                      {language === 'hi' ? 'लोकप्रिय शहर' : 'Popular cities'}
                    </div>
                  )}
                  {isSearching && (
                    <div
                      className={styles.placeResultItem}
                      style={{ color: 'var(--color-neutral-grey-400)', justifyContent: 'center' }}
                    >
                      {language === 'hi' ? 'खोज रहे हैं...' : 'Searching...'}
                    </div>
                  )}
                  {!isSearching &&
                    displayResults.map((city, index) => (
                      <button
                        key={`${city.name}-${index}`}
                        className={styles.placeResultItem}
                        onClick={() => handlePlaceSelect(city)}
                        type="button"
                      >
                        <span className={styles.placeResultIcon}>📍</span>
                        {city.name}
                      </button>
                    ))}
                  {!isSearching &&
                    displayResults.length === 0 &&
                    placeQuery.trim().length >= 2 && (
                      <div
                        className={styles.placeResultItem}
                        style={{ color: 'var(--color-neutral-grey-400)' }}
                      >
                        {language === 'hi' ? 'कोई जगह नहीं मिली' : 'No places found'}
                      </div>
                    )}
                </div>
              )}
            </div>

            {selectedPlace && (
              <div className={styles.selectedPlaceBadge}>
                <span>✓</span> {selectedPlace.name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation row */}
      <div className={styles.navRow}>
        {step > 1 ? (
          <button
            type="button"
            className={styles.btnBack}
            onClick={handleBack}
            disabled={disabled}
          >
            ← {language === 'hi' ? 'वापस' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            className={styles.btnNext}
            onClick={handleNext}
            disabled={disabled || !isCurrentStepValid}
          >
            {language === 'hi' ? 'आगे' : 'Next'} →
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnGenerate}
            onClick={handleSubmit}
            disabled={disabled || !step3Valid}
          >
            {language === 'hi' ? '✨ कुंडली बनाएं' : '✨ Generate Kundli'}
          </button>
        )}
      </div>
    </div>
  );
}
