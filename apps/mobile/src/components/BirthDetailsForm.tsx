/**
 * BirthDetailsForm — 3-step form for collecting birth details.
 *
 * Step 1/3 — WHO    : Person name + relationship (self/family/pet)
 * Step 2/3 — WHEN   : Date of birth (native picker) + time (native picker or approximate)
 * Step 3/3 — WHERE  : Birth place with autocomplete
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, getTranslations } from '@upaya/shared';
import type { Relationship } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BirthDetailsResult {
  personName: string;
  relationship: Relationship;
  dateOfBirth: string;        // YYYY-MM-DD
  timeOfBirth: string | null; // HH:MM in 24h, null if unknown
  timeApproximate: boolean;
  placeOfBirthName: string;
  placeOfBirthLat: number;
  placeOfBirthLng: number;
}

interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  language: 'hi' | 'en';
  preselectedRel?: Relationship;
  onSubmit: (result: BirthDetailsResult) => void;
  onCancel?: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const POPULAR_CITIES: PlaceResult[] = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
];

const APPROX_KEY_TO_TIME: Record<string, string> = {
  morning: '09:00',
  afternoon: '14:00',
  evening: '18:00',
  night: '22:00',
  dontknow: '12:00',
};

// Default birth date for picker (1 Jan 1990)
const DEFAULT_DATE = new Date(1990, 0, 1);
const MIN_DATE = new Date(1940, 0, 1);
const MAX_DATE = new Date();

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatTimeDisplay(date: Date): string {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BirthDetailsForm({ language, preselectedRel, onSubmit, onCancel }: Props) {
  const t = getTranslations(language);
  const bd = t.birthDetails;

  const [step, setStep] = useState(1);

  // Step 1
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>(preselectedRel || 'self');

  // Step 2 — native date/time pickers
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pickerDate, setPickerDate] = useState<Date>(DEFAULT_DATE); // temp while picker is open
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [pickerTime, setPickerTime] = useState<Date>(new Date(0, 0, 0, 8, 0)); // 8:00 AM default
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [unknownTime, setUnknownTime] = useState(false);
  const [approxKey, setApproxKey] = useState<string | null>(null);

  // Step 3
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>(POPULAR_CITIES);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (preselectedRel) setRelationship(preselectedRel);
  }, [preselectedRel]);

  // ── Place search ──────────────────────────────────────────────────────────

  const searchPlaces = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setPlaceResults(POPULAR_CITIES);
        return;
      }
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query + ' India',
          format: 'json',
          limit: '8',
          addressdetails: '1',
          'accept-language': language === 'hi' ? 'hi,en' : 'en,hi',
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { 'User-Agent': 'Upaya-App/1.0' } },
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        const results: PlaceResult[] = data.map(
          (item: { display_name: string; lat: string; lon: string }) => ({
            name: item.display_name.split(',').slice(0, 2).join(',').trim(),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }),
        );
        setPlaceResults(
          results.length > 0
            ? results
            : POPULAR_CITIES.filter((c) =>
                c.name.toLowerCase().includes(query.toLowerCase()),
              ),
        );
      } catch {
        setPlaceResults(
          POPULAR_CITIES.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase()),
          ),
        );
      } finally {
        setIsSearching(false);
      }
    },
    [language],
  );

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (placeQuery.trim().length === 0) {
      setPlaceResults(POPULAR_CITIES);
      return;
    }
    searchTimer.current = setTimeout(() => searchPlaces(placeQuery), 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [placeQuery, searchPlaces]);

  // ── Validation ────────────────────────────────────────────────────────────

  const isStep1Valid = personName.trim().length > 0;
  const isStep2Valid = selectedDate !== null && (unknownTime || selectedTime !== null);
  const isStep3Valid = selectedPlace !== null;

  // ── Date picker handlers ──────────────────────────────────────────────────

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (_event.type === 'set' && date) {
        setSelectedDate(date);
        setPickerDate(date);
      }
    } else {
      // iOS: update temp picker value in real-time
      if (date) setPickerDate(date);
    }
  };

  const confirmIOSDate = () => {
    setSelectedDate(pickerDate);
    setShowDatePicker(false);
  };

  const onTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (_event.type === 'set' && date) {
        setSelectedTime(date);
        setPickerTime(date);
      }
    } else {
      if (date) setPickerTime(date);
    }
  };

  const confirmIOSTime = () => {
    setSelectedTime(pickerTime);
    setShowTimePicker(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (!isStep3Valid || !selectedPlace || !selectedDate) return;

    let finalTime: string | null = null;
    if (unknownTime) {
      finalTime = APPROX_KEY_TO_TIME[approxKey || 'dontknow'] ?? '12:00';
    } else if (selectedTime) {
      finalTime = timeToHHMM(selectedTime);
    }

    onSubmit({
      personName: personName.trim(),
      relationship,
      dateOfBirth: dateToISO(selectedDate),
      timeOfBirth: finalTime,
      timeApproximate: unknownTime,
      placeOfBirthName: selectedPlace.name,
      placeOfBirthLat: selectedPlace.lat,
      placeOfBirthLng: selectedPlace.lng,
    });
  }

  const approxOptions = [
    { key: 'morning', label: bd.approximateTime.morning },
    { key: 'afternoon', label: bd.approximateTime.afternoon },
    { key: 'evening', label: bd.approximateTime.evening },
    { key: 'night', label: bd.approximateTime.night },
    { key: 'dontknow', label: bd.approximateTime.dontKnow },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        <Text style={styles.stepLabel}>
          {bd.step.replace('{{current}}', String(step)).replace('{{total}}', '3')}
        </Text>
        <View style={styles.progressTrack}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.progressSegment, s <= step && styles.progressSegmentActive]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: WHO ── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>{bd.whoTitle}</Text>

            {/* Relationship chips */}
            <View style={styles.relationshipRow}>
              {(['self', 'family', 'pet'] as Relationship[]).map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[styles.relChip, relationship === rel && styles.relChipActive]}
                  onPress={() => setRelationship(rel)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.relChipText, relationship === rel && styles.relChipTextActive]}>
                    {bd.relationship[rel]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Pet note */}
            {relationship === 'pet' && (
              <View style={styles.petNote}>
                <Text style={styles.petNoteText}>ℹ️  {bd.petNote}</Text>
              </View>
            )}

            {/* Person name */}
            <Text style={styles.fieldLabel}>{bd.personName}</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder={relationship === 'pet' ? bd.petNamePlaceholder : bd.personNamePlaceholder}
              placeholderTextColor={colors.neutral.grey400}
              value={personName}
              onChangeText={setPersonName}
              autoFocus
              returnKeyType="next"
            />
          </View>
        )}

        {/* ── Step 2: WHEN ── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>{bd.whenTitle}</Text>

            {/* Date of Birth — native picker trigger */}
            <Text style={styles.fieldLabel}>📅  {bd.dateOfBirth}</Text>
            <TouchableOpacity
              style={[styles.pickerButton, selectedDate && styles.pickerButtonFilled]}
              onPress={() => {
                setPickerDate(selectedDate || DEFAULT_DATE);
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={selectedDate ? styles.pickerButtonValue : styles.pickerButtonPlaceholder}
              >
                {selectedDate ? formatDateDisplay(selectedDate) : bd.dateFormat}
              </Text>
              <Text style={styles.pickerButtonIcon}>📅</Text>
            </TouchableOpacity>

            {/* Android date picker (dialog) */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={MAX_DATE}
                minimumDate={MIN_DATE}
              />
            )}

            {/* iOS date picker (spinner in modal) */}
            {Platform.OS === 'ios' && (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <TouchableOpacity
                  style={styles.pickerModalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDatePicker(false)}
                />
                <View style={styles.pickerModal}>
                  <View style={styles.pickerModalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerModalCancel}>
                        {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerModalTitle}>
                      {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
                    </Text>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={styles.pickerModalDone}>
                        {language === 'hi' ? 'हो गया' : 'Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={MAX_DATE}
                    minimumDate={MIN_DATE}
                    style={styles.iosPicker}
                    locale={language === 'hi' ? 'hi-IN' : 'en-IN'}
                  />
                </View>
              </Modal>
            )}

            {/* Time of Birth — native picker trigger */}
            {!unknownTime && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: hp(12) }]}>
                  🕐  {bd.timeOfBirth}
                </Text>
                <TouchableOpacity
                  style={[styles.pickerButton, selectedTime && styles.pickerButtonFilled]}
                  onPress={() => {
                    setPickerTime(selectedTime || new Date(0, 0, 0, 8, 0));
                    setShowTimePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={selectedTime ? styles.pickerButtonValue : styles.pickerButtonPlaceholder}
                  >
                    {selectedTime ? formatTimeDisplay(selectedTime) : bd.timeFormat}
                  </Text>
                  <Text style={styles.pickerButtonIcon}>🕐</Text>
                </TouchableOpacity>

                {/* Android time picker (dialog) */}
                {showTimePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={pickerTime}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                    is24Hour={false}
                  />
                )}

                {/* iOS time picker (spinner in modal) */}
                {Platform.OS === 'ios' && (
                  <Modal
                    visible={showTimePicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowTimePicker(false)}
                  >
                    <TouchableOpacity
                      style={styles.pickerModalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowTimePicker(false)}
                    />
                    <View style={styles.pickerModal}>
                      <View style={styles.pickerModalHeader}>
                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                          <Text style={styles.pickerModalCancel}>
                            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.pickerModalTitle}>
                          {language === 'hi' ? 'जन्म का समय' : 'Time of Birth'}
                        </Text>
                        <TouchableOpacity onPress={confirmIOSTime}>
                          <Text style={styles.pickerModalDone}>
                            {language === 'hi' ? 'हो गया' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={pickerTime}
                        mode="time"
                        display="spinner"
                        onChange={onTimeChange}
                        is24Hour={false}
                        style={styles.iosPicker}
                      />
                    </View>
                  </Modal>
                )}
              </>
            )}

            {/* Unknown time checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setUnknownTime(!unknownTime);
                setSelectedTime(null);
                setApproxKey(null);
              }}
            >
              <View style={[styles.checkbox, unknownTime && styles.checkboxChecked]}>
                {unknownTime && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <View style={styles.checkboxTextGroup}>
                <Text style={styles.checkboxLabel}>{bd.unknownTime}</Text>
                <Text style={styles.checkboxSub}>{bd.unknownTimeSub}</Text>
              </View>
            </TouchableOpacity>

            {unknownTime && (
              <>
                <View style={styles.approxOptions}>
                  {approxOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.approxOption,
                        approxKey === opt.key && styles.approxOptionActive,
                      ]}
                      onPress={() => setApproxKey(opt.key)}
                    >
                      <View style={[styles.radio, approxKey === opt.key && styles.radioActive]} />
                      <Text
                        style={[
                          styles.approxText,
                          approxKey === opt.key && styles.approxTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.approxNote}>{bd.approximateNote}</Text>
              </>
            )}
          </View>
        )}

        {/* ── Step 3: WHERE ── */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>{bd.whereTitle}</Text>

            <Text style={styles.fieldLabel}>📍  {bd.placeOfBirth}</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder={bd.placeSearch}
              placeholderTextColor={colors.neutral.grey400}
              value={placeQuery}
              onChangeText={(q) => {
                setPlaceQuery(q);
                setSelectedPlace(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoFocus
              returnKeyType="search"
            />

            {selectedPlace && (
              <View style={styles.selectedPlaceBadge}>
                <Text style={styles.selectedPlaceText}>✅  {selectedPlace.name}</Text>
              </View>
            )}

            {showDropdown && !selectedPlace && (
              <View style={styles.dropdown}>
                {isSearching ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator size="small" color={colors.primary.saffron} />
                    <Text style={styles.dropdownLoadingText}>{bd.placeSearching}</Text>
                  </View>
                ) : placeResults.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>{bd.placeNoResults}</Text>
                ) : (
                  placeResults.map((place, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedPlace(place);
                        setPlaceQuery(place.name);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>📍  {place.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBackButton}
          onPress={() => (step > 1 ? setStep(step - 1) : onCancel?.())}
        >
          <Text style={styles.navBackText}>
            {step === 1 ? t.common.cancel : `← ${t.common.back}`}
          </Text>
        </TouchableOpacity>

        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.navNextButton,
              !((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid)) &&
                styles.navNextDisabled,
            ]}
            onPress={() => setStep(step + 1)}
            disabled={!((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid))}
          >
            <Text style={styles.navNextText}>{t.common.next} →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.generateButton, !isStep3Valid && styles.generateButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isStep3Valid}
            activeOpacity={0.8}
          >
            <Text style={styles.generateButtonText}>{bd.generateButton}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    maxHeight: '90%',
  },

  /* Progress */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
    paddingBottom: hp(8),
    gap: wp(10),
  },
  stepLabel: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    minWidth: wp(48),
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: wp(4),
  },
  progressSegment: {
    flex: 1,
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: colors.neutral.grey100,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary.saffron,
  },

  /* Scroll area */
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: wp(16),
    paddingBottom: hp(8),
  },

  /* Step title */
  stepTitle: {
    fontSize: fp(18),
    fontWeight: '700',
    color: colors.secondary.maroon,
    marginBottom: hp(16),
    marginTop: hp(4),
  },

  /* Relationship chips */
  relationshipRow: {
    flexDirection: 'row',
    gap: wp(8),
    marginBottom: hp(12),
  },
  relChip: {
    flex: 1,
    paddingVertical: hp(8),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(10),
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  relChipActive: {
    borderColor: colors.primary.saffron,
    backgroundColor: 'rgba(255,140,0,0.08)',
  },
  relChipText: {
    fontSize: fp(13),
    color: colors.neutral.grey600,
    fontWeight: '500',
  },
  relChipTextActive: {
    color: colors.primary.saffronDark,
    fontWeight: '600',
  },

  /* Pet note */
  petNote: {
    backgroundColor: '#FFF8F0',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.saffron,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(8),
    marginBottom: hp(10),
  },
  petNoteText: {
    fontSize: fp(12),
    color: colors.neutral.grey700,
    lineHeight: fp(12) * 1.5,
  },

  /* Fields */
  fieldLabel: {
    fontSize: fp(13),
    fontWeight: '600',
    color: colors.neutral.grey700,
    marginBottom: hp(6),
    marginTop: hp(6),
  },
  fieldInput: {
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(10),
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    fontSize: fp(15),
    color: colors.neutral.grey800,
  },

  /* Picker button (replaces TextInput for date/time) */
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(10),
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
  },
  pickerButtonFilled: {
    borderColor: colors.primary.saffronLight,
    backgroundColor: '#FFF8F0',
  },
  pickerButtonPlaceholder: {
    fontSize: fp(15),
    color: colors.neutral.grey400,
  },
  pickerButtonValue: {
    fontSize: fp(15),
    color: colors.neutral.grey800,
    fontWeight: '500',
  },
  pickerButtonIcon: {
    fontSize: fp(16),
  },

  /* iOS picker modal */
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pickerModal: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: wp(16),
    borderTopRightRadius: wp(16),
    paddingBottom: hp(24),
  },
  pickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey200,
  },
  pickerModalTitle: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  pickerModalCancel: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
  },
  pickerModalDone: {
    fontSize: fp(14),
    fontWeight: '700',
    color: colors.primary.saffron,
  },
  iosPicker: {
    height: hp(200),
  },

  /* Unknown time checkbox */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(10),
    marginTop: hp(12),
  },
  checkbox: {
    width: wp(20),
    height: wp(20),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
    borderRadius: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(1),
  },
  checkboxChecked: {
    backgroundColor: colors.primary.saffron,
    borderColor: colors.primary.saffron,
  },
  checkboxMark: {
    fontSize: fp(11),
    color: colors.neutral.white,
    fontWeight: '700',
  },
  checkboxTextGroup: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey700,
  },
  checkboxSub: {
    fontSize: fp(11),
    color: colors.neutral.grey400,
    marginTop: hp(1),
  },

  /* Approx options */
  approxOptions: {
    gap: hp(6),
    marginTop: hp(10),
  },
  approxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(10),
  },
  approxOptionActive: {
    borderColor: colors.primary.saffron,
    backgroundColor: 'rgba(255,140,0,0.08)',
  },
  radio: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
  },
  radioActive: {
    borderColor: colors.primary.saffron,
    backgroundColor: colors.primary.saffron,
  },
  approxText: {
    fontSize: fp(13),
    color: colors.neutral.grey700,
  },
  approxTextActive: {
    color: colors.primary.saffronDark,
    fontWeight: '500',
  },
  approxNote: {
    fontSize: fp(11),
    color: colors.neutral.grey500,
    marginTop: hp(8),
    fontStyle: 'italic',
    lineHeight: fp(11) * 1.4,
  },

  /* Place dropdown */
  dropdown: {
    marginTop: hp(4),
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(10),
    maxHeight: hp(200),
    overflow: 'hidden',
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    padding: wp(12),
  },
  dropdownLoadingText: {
    fontSize: fp(13),
    color: colors.neutral.grey500,
  },
  dropdownEmpty: {
    padding: wp(12),
    fontSize: fp(13),
    color: colors.neutral.grey400,
  },
  dropdownItem: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey100,
  },
  dropdownItemText: {
    fontSize: fp(13),
    color: colors.neutral.grey700,
  },

  /* Selected place badge */
  selectedPlaceBadge: {
    marginTop: hp(6),
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    backgroundColor: 'rgba(72, 187, 120, 0.12)',
    borderRadius: wp(8),
  },
  selectedPlaceText: {
    fontSize: fp(13),
    color: '#276749',
    fontWeight: '500',
  },

  /* Navigation */
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    paddingBottom: Platform.OS === 'ios' ? hp(28) : hp(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.grey100,
    gap: wp(10),
  },
  navBackButton: {
    paddingVertical: hp(10),
    paddingHorizontal: wp(16),
  },
  navBackText: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    fontWeight: '500',
  },
  navNextButton: {
    flex: 1,
    paddingVertical: hp(12),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    alignItems: 'center',
  },
  navNextDisabled: {
    opacity: 0.4,
  },
  navNextText: {
    fontSize: fp(15),
    fontWeight: '700',
    color: colors.neutral.white,
  },
  generateButton: {
    flex: 1,
    paddingVertical: hp(12),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: fp(15),
    fontWeight: '700',
    color: colors.neutral.white,
  },
});
