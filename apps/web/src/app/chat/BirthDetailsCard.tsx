'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './BirthDetailsCard.module.css';

// Popular Indian cities for suggestions
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

// Approximate time options
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

interface BirthDetailsCardProps {
  language: 'hi' | 'en';
  onSubmit: (details: {
    dateOfBirth: string;
    timeOfBirth: string | null;
    timeApproximate: boolean;
    placeOfBirth: string;
    placeOfBirthLat: number;
    placeOfBirthLng: number;
  }) => void;
  disabled?: boolean;
}

export default function BirthDetailsCard({ language, onSubmit, disabled }: BirthDetailsCardProps) {
  const [dob, setDob] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [unknownTime, setUnknownTime] = useState(false);
  const [selectedApprox, setSelectedApprox] = useState<string | null>(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [showPlaceResults, setShowPlaceResults] = useState(false);

  const placeInputRef = useRef<HTMLInputElement>(null);

  const approxOptions = language === 'hi' ? APPROX_OPTIONS_HI : APPROX_OPTIONS_EN;

  // Filter cities based on query
  const filteredCities = placeQuery.trim().length > 0
    ? POPULAR_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(placeQuery.toLowerCase())
      )
    : POPULAR_CITIES;

  // Is form valid?
  const isValid = dob && selectedPlace && (unknownTime || timeOfBirth);

  const handlePlaceFocus = () => {
    setShowPlaceResults(true);
  };

  const handlePlaceSelect = useCallback(
    (city: { name: string; lat: number; lng: number }) => {
      setSelectedPlace(city);
      setPlaceQuery(city.name);
      setShowPlaceResults(false);
    },
    []
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placeInputRef.current && !placeInputRef.current.parentElement?.contains(e.target as Node)) {
        setShowPlaceResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (!isValid || !selectedPlace) return;

    let finalTime: string | null = null;
    let isApproximate = false;

    if (unknownTime) {
      isApproximate = true;
      if (selectedApprox) {
        const opt = approxOptions.find((o) => o.key === selectedApprox);
        finalTime = opt?.time || null;
      }
    } else if (timeOfBirth) {
      // Convert to 24h format
      const [rawHours, minutes] = timeOfBirth.split(':').map(Number);
      let hours = rawHours;
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      finalTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    onSubmit({
      dateOfBirth: dob,
      timeOfBirth: finalTime,
      timeApproximate: isApproximate,
      placeOfBirth: selectedPlace.name,
      placeOfBirthLat: selectedPlace.lat,
      placeOfBirthLng: selectedPlace.lng,
    });
  };

  return (
    <div className={styles.card}>
      {/* Title */}
      <div className={styles.cardTitle}>
        <span className={styles.cardTitleIcon}>📋</span>
        <span>{language === 'hi' ? 'Birth Details' : 'Birth Details'}</span>
      </div>
      <p className={styles.cardSubtitle}>
        {language === 'hi'
          ? 'Accurate कुंडली के लिए ये details ज़रूरी हैं:'
          : 'These details are needed for an accurate kundli:'}
      </p>

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

          {/* Unknown time checkbox */}
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={unknownTime}
              onChange={(e) => {
                setUnknownTime(e.target.checked);
                if (e.target.checked) {
                  setTimeOfBirth('');
                }
              }}
              disabled={disabled}
            />
            <span className={styles.checkboxLabel}>
              {language === 'hi'
                ? 'Exact time नहीं पता? (Approximate use करेंगे)'
                : "Don't know exact time? (We'll use approximate)"}
            </span>
          </label>

          {/* Approximate time options */}
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
                  ? 'Approximate time से भी कुंडली बनती है, लेकिन exact time से ज़्यादा accurate होती है।'
                  : 'Kundli can be generated with approximate time too, but exact time gives more accurate results.'}
              </p>
            </div>
          )}
        </div>

        {/* Place of Birth */}
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
              placeholder={language === 'hi' ? 'शहर/गाँव खोजें...' : 'Search city/town...'}
              value={placeQuery}
              onChange={(e) => {
                setPlaceQuery(e.target.value);
                setSelectedPlace(null);
                setShowPlaceResults(true);
              }}
              onFocus={handlePlaceFocus}
              disabled={disabled}
            />

            {showPlaceResults && (
              <div className={styles.placeSearchResults}>
                {placeQuery.trim().length === 0 && (
                  <div className={styles.popularCitiesLabel}>
                    {language === 'hi' ? 'लोकप्रिय शहर' : 'Popular cities'}
                  </div>
                )}
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    className={styles.placeResultItem}
                    onClick={() => handlePlaceSelect(city)}
                    type="button"
                  >
                    <span className={styles.placeResultIcon}>📍</span>
                    {city.name}
                  </button>
                ))}
                {filteredCities.length === 0 && placeQuery.trim().length > 0 && (
                  <div className={styles.placeResultItem} style={{ color: 'var(--color-neutral-grey-400)' }}>
                    {language === 'hi' ? 'कोई result नहीं मिला' : 'No results found'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        className={styles.generateButton}
        onClick={handleSubmit}
        disabled={!isValid || disabled}
      >
        {language === 'hi' ? '✨ मेरी कुंडली बनाएं' : '✨ Generate My Kundli'}
        <span className={styles.generateButtonSub}>
          {language === 'hi' ? 'Generate My Kundli' : 'मेरी कुंडली बनाएं'}
        </span>
      </button>
    </div>
  );
}
