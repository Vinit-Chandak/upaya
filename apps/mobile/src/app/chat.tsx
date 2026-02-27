import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, PROBLEM_TYPES, getTranslations, detectLanguage, type TranslationKeys, type ProblemType, type ChatMessageType } from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import { createChatSession, sendChatMessage, generateKundli, ApiError } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---- Types ----

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: ChatMessageType;
  quickReplies?: { label: string; value: string }[];
  showBirthDetailsCta?: boolean;
  createdAt: Date;
}

type ChatPhase =
  | 'exchange_1'
  | 'exchange_2'
  | 'birth_details'
  | 'generating';

// ---- Build qualifying chips from i18n ----

function getChips(
  problemType: string,
  t: TranslationKeys,
): { label: string; value: string }[] | undefined {
  const { durationChips, moneyChips, healthChips, legalChips, familyChips } = t.aiMessages;
  switch (problemType) {
    case 'marriage_delay':
    case 'career_stuck':
      return [
        { label: durationChips.lessThanYear, value: durationChips.lessThanYear },
        { label: durationChips.oneToThreeYears, value: durationChips.oneToThreeYears },
        { label: durationChips.moreThanThreeYears, value: durationChips.moreThanThreeYears },
      ];
    case 'money_problems':
      return [
        { label: moneyChips.sudden, value: moneyChips.sudden },
        { label: moneyChips.gradually, value: moneyChips.gradually },
        { label: moneyChips.always, value: moneyChips.always },
      ];
    case 'health_issues':
      return [
        { label: healthChips.recent, value: healthChips.recent },
        { label: healthChips.fewMonths, value: healthChips.fewMonths },
        { label: healthChips.longTime, value: healthChips.longTime },
      ];
    case 'legal_matters':
      return [
        { label: legalChips.property, value: legalChips.property },
        { label: legalChips.family, value: legalChips.family },
        { label: legalChips.business, value: legalChips.business },
        { label: legalChips.other, value: legalChips.other },
      ];
    case 'family_conflict':
      return [
        { label: familyChips.recent, value: familyChips.recent },
        { label: familyChips.fewMonths, value: familyChips.fewMonths },
        { label: familyChips.longTime, value: familyChips.longTime },
      ];
    default:
      return undefined;
  }
}

// ---- Helpers ----

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---- Component ----

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ problem?: string; message?: string }>();
  const problemType = (params.problem || 'something_else') as ProblemType;
  const initialMessage = params.message || '';

  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('exchange_1');
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDbId, setSessionDbId] = useState<string | null>(null); // UUID PK for diagnosis FK
  const [isSubmittingBirth, setIsSubmittingBirth] = useState(false);

  // Track user's qualifying answer for diagnosis context
  const qualifyingAnswerRef = useRef('');

  // Birth details form state
  const [bdDob, setBdDob] = useState('');
  const [bdTime, setBdTime] = useState('');
  const [bdAmpm, setBdAmpm] = useState<'AM' | 'PM'>('AM');
  const [bdUnknownTime, setBdUnknownTime] = useState(false);
  const [bdApprox, setBdApprox] = useState<string | null>(null);
  const [bdPlace, setBdPlace] = useState('');
  const [bdPlaceLat, setBdPlaceLat] = useState(0);
  const [bdPlaceLng, setBdPlaceLng] = useState(0);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitialized = useRef(false);
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  const problemInfo = PROBLEM_TYPES[problemType];

  // Typing dots animation
  useEffect(() => {
    if (!isTyping) return;
    const anims = [dotAnim1, dotAnim2, dotAnim3];
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isTyping, dotAnim1, dotAnim2, dotAnim3]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showBirthForm, scrollToBottom]);

  // Initialize
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      let lang: 'hi' | 'en' = 'hi';
      try {
        const stored = await AsyncStorage.getItem('upaya_language');
        if (stored === 'hi' || stored === 'en') {
          lang = stored;
          setLanguage(stored);
        }
      } catch { /* default hi */ }

      // Create a real chat session in the backend
      let createdSessionId: string | null = null;
      try {
        const { session } = await createChatSession(problemType, lang);
        createdSessionId = session.session_id ?? session.sessionId;
        setSessionId(createdSessionId);
        setSessionDbId(session.id); // UUID PK — used for diagnosis FK
      } catch (err) {
        console.warn('[Chat] Failed to create session, continuing offline:', err);
      }

      const t_lang = getTranslations(lang);

      if (problemType === 'get_kundli') {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages([{
            id: generateId(),
            role: 'assistant',
            content: t_lang.aiMessages.qualifyingQuestions.get_kundli,
            messageType: 'text',
            showBirthDetailsCta: true,
            createdAt: new Date(),
          }]);
          setChatPhase('birth_details');
        }, 800);
        return;
      }

      if (initialMessage) {
        setMessages([{
          id: generateId(),
          role: 'user',
          content: initialMessage,
          messageType: 'text',
          createdAt: new Date(),
        }]);
      }

      // Exchange 1: Get qualifying question from real API
      setIsTyping(true);
      if (createdSessionId && initialMessage) {
        try {
          const response = await sendChatMessage(createdSessionId, initialMessage);
          setIsTyping(false);
          const chips = getChips(problemType, t_lang);
          const aiMsg: ChatMsg = {
            id: generateId(),
            role: 'assistant',
            content: response.aiMessage.content,
            messageType: 'text',
            quickReplies: chips,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          return;
        } catch (err) {
          console.warn('[Chat] Exchange 1 API failed, using fallback:', err);
        }
      }

      // Fallback: qualifying question from i18n (offline or no session)
      setTimeout(() => {
        setIsTyping(false);
        const qq = t_lang.aiMessages.qualifyingQuestions;
        const qText = (qq[problemType as keyof typeof qq] as string | undefined) || qq.something_else;
        const chips = getChips(problemType, t_lang);
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: qText,
          messageType: 'text',
          quickReplies: chips,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 800);
    };
    init();
  }, [problemType, initialMessage]);

  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    handleUserReply(text);
  }, [inputValue]);

  const handleChipTap = useCallback((value: string) => {
    handleUserReply(value);
  }, []);

  const handleUserReply = async (text: string) => {
    // Remove quick reply chips from previous messages
    setMessages((prev) =>
      prev.map((m) => (m.quickReplies ? { ...m, quickReplies: undefined } : m))
    );

    const userMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Save qualifying answer for diagnosis context
    if (chatPhase === 'exchange_1') {
      qualifyingAnswerRef.current = text;
    }

    setIsTyping(true);

    // Try to get real AI response from backend
    if (sessionId) {
      try {
        const response = await sendChatMessage(sessionId, text);
        setIsTyping(false);
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: response.aiMessage.content,
          messageType: 'text',
          showBirthDetailsCta: true,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (chatPhase === 'exchange_1') {
          setChatPhase('exchange_2');
        }
        return;
      } catch (err) {
        console.warn('[Chat] API call failed, using fallback:', err);
        // Fall through to offline fallback below
      }
    }

    // Offline fallback if no session or API fails
    setTimeout(() => {
      setIsTyping(false);
      const fallbackText = getTranslations(detectLanguage(text)).errors.offlineFallback;
      const aiMsg: ChatMsg = {
        id: generateId(),
        role: 'assistant',
        content: fallbackText,
        messageType: 'text',
        showBirthDetailsCta: true,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (chatPhase === 'exchange_1') {
        setChatPhase('exchange_2');
      }
    }, 800);
  };

  const handleBirthDetailsCta = () => {
    setChatPhase('birth_details');
    setShowBirthForm(true);
  };

  // Popular cities for the place picker
  const POPULAR_CITIES = [
    { name: 'Delhi, India', lat: 28.6139, lng: 77.209 },
    { name: 'Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 },
    { name: 'Lucknow, UP', lat: 26.8467, lng: 80.9462 },
    { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Varanasi, UP', lat: 25.3176, lng: 82.9739 },
    { name: 'Kolkata, WB', lat: 22.5726, lng: 88.3639 },
    { name: 'Chennai, TN', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad, TS', lat: 17.385, lng: 78.4867 },
  ];

  const filteredCities = bdPlace.trim().length > 0
    ? POPULAR_CITIES.filter((c) => c.name.toLowerCase().includes(bdPlace.toLowerCase()))
    : POPULAR_CITIES;

  const isBirthFormValid = bdDob.trim().length > 0 && (bdPlace.trim().length > 0 && bdPlaceLat !== 0) && (bdUnknownTime || bdTime.trim().length > 0);

  const handleBirthSubmit = async () => {
    if (!isBirthFormValid || isSubmittingBirth) return;
    setIsSubmittingBirth(true);
    setChatPhase('generating');
    setShowBirthForm(false);

    const confirmMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: `DOB: ${bdDob}\nTime: ${bdTime || 'Approximate'}\nPlace: ${bdPlace}`,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);

    // Parse DOB from DD/MM/YYYY to YYYY-MM-DD for API
    const dobParts = bdDob.split('/');
    const isoDate = dobParts.length === 3
      ? `${dobParts[2]}-${dobParts[1].padStart(2, '0')}-${dobParts[0].padStart(2, '0')}`
      : bdDob;

    // Parse time to 24hr format for API
    let time24 = bdTime;
    if (bdTime && bdAmpm) {
      const [hStr, mStr] = bdTime.split(':');
      let h = parseInt(hStr, 10);
      const m = mStr || '00';
      if (bdAmpm === 'PM' && h < 12) h += 12;
      if (bdAmpm === 'AM' && h === 12) h = 0;
      time24 = `${h.toString().padStart(2, '0')}:${m}`;
    }

    // Determine approximate time if exact time unknown
    const approxTimeMap: Record<string, string> = {
      morning: '09:00',
      afternoon: '14:00',
      evening: '18:00',
      night: '22:00',
      dontknow: '12:00',
    };
    if (bdUnknownTime && bdApprox) {
      time24 = approxTimeMap[bdApprox] || '12:00';
    } else if (bdUnknownTime) {
      time24 = '12:00';
    }

    try {
      // Call real Kundli API
      const { kundli } = await generateKundli({
        dateOfBirth: isoDate,
        timeOfBirth: time24,
        timeApproximate: bdUnknownTime,
        placeOfBirthName: bdPlace,
        placeOfBirthLat: bdPlaceLat,
        placeOfBirthLng: bdPlaceLng,
      });

      // Navigate with real kundli data
      router.push({
        pathname: '/kundli-animation',
        params: {
          kundliId: kundli.id,
          sessionId: sessionDbId || '', // UUID PK — diagnosis.chat_session_id FK
          problemType,
          qualifyingAnswer: qualifyingAnswerRef.current,
          dob: bdDob,
          tob: bdTime || (bdApprox ? approxTimeMap[bdApprox] : ''),
          place: bdPlace,
          lang: language,
        },
      });
    } catch (err) {
      setIsSubmittingBirth(false);
      setChatPhase('birth_details');
      setShowBirthForm(true);
      const t = getTranslations(language);
      Alert.alert(t.common.error, t.errors.kundliGenerationError);
      console.error('[Chat] Kundli generation failed:', err);
    }
  };

  const t = getTranslations(language);
  const approxTime = t.birthDetails.approximateTime;
  const APPROX_OPTIONS = [
    { key: 'morning', label: approxTime.morning },
    { key: 'afternoon', label: approxTime.afternoon },
    { key: 'evening', label: approxTime.evening },
    { key: 'night', label: approxTime.night },
    { key: 'dontknow', label: approxTime.dontKnow },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t.chat.aiTitle}</Text>
        <View style={styles.problemBadge}>
          <Text style={styles.problemBadgeText}>
            {problemInfo.emoji} {language === 'hi' ? problemInfo.hi : problemInfo.en}
          </Text>
        </View>
        <TouchableOpacity style={styles.overflowButton}>
          <Text style={styles.overflowDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => {
          const showAvatar =
            msg.role === 'assistant' &&
            (index === 0 || messages[index - 1]?.role !== 'assistant');
          const showTimestamp =
            index === messages.length - 1 || messages[index + 1]?.role !== msg.role;

          return (
            <View key={msg.id}>
              <View
                style={[
                  styles.messageRow,
                  msg.role === 'assistant' ? styles.messageRowAi : styles.messageRowUser,
                ]}
              >
                {msg.role === 'assistant' && (
                  showAvatar ? (
                    <View style={styles.aiAvatar}>
                      <Text style={styles.aiAvatarText}>🙏</Text>
                    </View>
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )
                )}

                <View
                  style={[
                    styles.messageBubble,
                    msg.role === 'assistant' ? styles.aiBubble : styles.userBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.content}</Text>

                  {/* Quick reply chips */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <View style={styles.quickRepliesWrapper}>
                      {msg.quickReplies.map((chip) => (
                        <TouchableOpacity
                          key={chip.value}
                          style={styles.quickReplyChip}
                          onPress={() => handleChipTap(chip.value)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quickReplyText}>{chip.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Birth details CTA */}
                  {msg.showBirthDetailsCta && chatPhase !== 'birth_details' && chatPhase !== 'generating' && (
                    <TouchableOpacity
                      style={styles.birthDetailsCta}
                      onPress={handleBirthDetailsCta}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.birthDetailsCtaIcon}>📋</Text>
                      <View>
                        <Text style={styles.birthDetailsCtaText}>
                          {t.chat.birthDetailsCta}
                        </Text>
                        <Text style={styles.birthDetailsCtaSub}>
                          {t.chat.birthDetailsSub}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {showTimestamp && (
                <View
                  style={[
                    styles.timestampRow,
                    msg.role === 'assistant' ? styles.timestampAi : styles.timestampUser,
                  ]}
                >
                  <Text style={styles.timestampText}>{formatTime(msg.createdAt)}</Text>
                  {msg.role === 'user' && <Text style={styles.readReceipt}>✓✓</Text>}
                </View>
              )}
            </View>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarText}>🙏</Text>
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
              {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.typingDot,
                    { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Birth Details Form */}
        {showBirthForm && (
          <View style={[styles.messageRow, styles.messageRowAi]}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.birthFormCard}>
              <View style={styles.birthFormHeader}>
                <Text style={styles.birthFormIcon}>📋</Text>
                <Text style={styles.birthFormTitle}>{t.birthDetails.title}</Text>
              </View>
              <Text style={styles.birthFormSubtitle}>{t.birthDetails.subtitle}</Text>

              {/* DOB */}
              <Text style={styles.fieldLabel}>📅 {t.birthDetails.dateOfBirth}</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.neutral.grey400}
                value={bdDob}
                onChangeText={setBdDob}
                keyboardType="numbers-and-punctuation"
              />

              {/* Time */}
              {!bdUnknownTime && (
                <>
                  <Text style={styles.fieldLabel}>🕐 {t.birthDetails.timeOfBirth}</Text>
                  <View style={styles.timeRow}>
                    <TextInput
                      style={[styles.fieldInput, styles.timeInput]}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.neutral.grey400}
                      value={bdTime}
                      onChangeText={setBdTime}
                      keyboardType="numbers-and-punctuation"
                    />
                    <View style={styles.ampmRow}>
                      <TouchableOpacity
                        style={[styles.ampmButton, bdAmpm === 'AM' && styles.ampmActive]}
                        onPress={() => setBdAmpm('AM')}
                      >
                        <Text style={[styles.ampmText, bdAmpm === 'AM' && styles.ampmTextActive]}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.ampmButton, bdAmpm === 'PM' && styles.ampmActive]}
                        onPress={() => setBdAmpm('PM')}
                      >
                        <Text style={[styles.ampmText, bdAmpm === 'PM' && styles.ampmTextActive]}>PM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {/* Unknown time */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => { setBdUnknownTime(!bdUnknownTime); setBdTime(''); }}
              >
                <View style={[styles.checkbox, bdUnknownTime && styles.checkboxChecked]}>
                  {bdUnknownTime && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{t.birthDetails.unknownTime}</Text>
              </TouchableOpacity>

              {bdUnknownTime && (
                <View style={styles.approxOptions}>
                  {APPROX_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.approxOption, bdApprox === opt.key && styles.approxOptionActive]}
                      onPress={() => setBdApprox(opt.key)}
                    >
                      <View style={[styles.radio, bdApprox === opt.key && styles.radioActive]} />
                      <Text style={[styles.approxText, bdApprox === opt.key && styles.approxTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Place */}
              <Text style={styles.fieldLabel}>📍 {t.birthDetails.placeOfBirth}</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder={t.birthDetails.placeSearch}
                placeholderTextColor={colors.neutral.grey400}
                value={bdPlace}
                onChangeText={(t) => {
                  setBdPlace(t);
                  setBdPlaceLat(0);
                  setBdPlaceLng(0);
                  setShowPlaceDropdown(true);
                }}
                onFocus={() => setShowPlaceDropdown(true)}
              />

              {showPlaceDropdown && (
                <View style={styles.placeDropdown}>
                  {filteredCities.map((city) => (
                    <TouchableOpacity
                      key={city.name}
                      style={styles.placeOption}
                      onPress={() => {
                        setBdPlace(city.name);
                        setBdPlaceLat(city.lat);
                        setBdPlaceLng(city.lng);
                        setShowPlaceDropdown(false);
                      }}
                    >
                      <Text style={styles.placeOptionText}>📍 {city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Generate button */}
              <TouchableOpacity
                style={[styles.generateButton, !isBirthFormValid && styles.generateButtonDisabled]}
                onPress={handleBirthSubmit}
                disabled={!isBirthFormValid || isSubmittingBirth}
                activeOpacity={0.8}
              >
                <Text style={styles.generateButtonText}>{t.birthDetails.generateButton}</Text>
                <Text style={styles.generateButtonSub}>{t.birthDetails.generateButtonSub}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBarWrapper}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={t.chat.inputPlaceholder}
            placeholderTextColor={colors.neutral.grey400}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            editable={!isTyping && chatPhase !== 'generating'}
          />
          {inputValue.trim() ? (
            <TouchableOpacity
              style={[styles.sendButton, (isTyping || chatPhase === 'generating') && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={isTyping || chatPhase === 'generating'}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Text style={styles.micIcon}>🎙</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(12),
    paddingTop: Platform.OS === 'ios' ? hp(50) : hp(30),
    paddingBottom: hp(8),
    backgroundColor: colors.neutral.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey100,
  },
  backButton: {
    padding: wp(6),
  },
  backArrow: {
    fontSize: fp(20),
    color: colors.neutral.grey700,
  },
  topBarTitle: {
    flex: 1,
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.secondary.maroon,
  },
  problemBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(3),
    backgroundColor: '#FFF8F0',
    borderRadius: wp(20),
  },
  problemBadgeText: {
    fontSize: fp(11),
    fontWeight: '500',
    color: colors.secondary.maroon,
  },
  overflowButton: {
    padding: wp(6),
  },
  overflowDots: {
    fontSize: fp(18),
    color: colors.neutral.grey500,
  },

  /* Messages */
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(12),
    gap: hp(6),
  },
  messageRow: {
    flexDirection: 'row',
    gap: wp(6),
    marginBottom: hp(2),
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: colors.accent.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  aiAvatarText: {
    fontSize: fp(14),
  },
  avatarPlaceholder: {
    width: wp(32),
  },
  messageBubble: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(16),
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  aiBubble: {
    backgroundColor: '#FFF8F0',
    borderBottomLeftRadius: wp(4),
  },
  userBubble: {
    backgroundColor: '#FFF3E0',
    borderBottomRightRadius: wp(4),
  },
  messageText: {
    fontSize: fp(14),
    lineHeight: fp(14) * 1.5,
    color: colors.neutral.grey800,
  },

  /* Quick Replies */
  quickRepliesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(6),
    marginTop: hp(8),
  },
  quickReplyChip: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderWidth: 1.5,
    borderColor: colors.primary.saffronLight,
    borderRadius: wp(20),
    backgroundColor: colors.neutral.white,
  },
  quickReplyText: {
    fontSize: fp(12),
    fontWeight: '500',
    color: colors.primary.saffronDark,
  },

  /* Birth Details CTA */
  birthDetailsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginTop: hp(8),
    paddingHorizontal: wp(12),
    paddingVertical: hp(10),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
  },
  birthDetailsCtaIcon: {
    fontSize: fp(18),
  },
  birthDetailsCtaText: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.white,
  },
  birthDetailsCtaSub: {
    fontSize: fp(11),
    color: 'rgba(255,255,255,0.85)',
  },

  /* Timestamps */
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    marginBottom: hp(4),
  },
  timestampAi: {
    justifyContent: 'flex-start',
    paddingLeft: wp(38),
  },
  timestampUser: {
    justifyContent: 'flex-end',
  },
  timestampText: {
    fontSize: fp(10),
    color: colors.neutral.grey400,
  },
  readReceipt: {
    fontSize: fp(9),
    color: colors.neutral.grey400,
  },

  /* Typing */
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
  },
  typingDot: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(4),
    backgroundColor: colors.neutral.grey400,
  },

  /* Birth Form */
  birthFormCard: {
    maxWidth: SCREEN_WIDTH * 0.78,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.accent.goldLight,
    borderRadius: wp(12),
    padding: wp(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  birthFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(2),
  },
  birthFormIcon: {
    fontSize: fp(16),
  },
  birthFormTitle: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.grey800,
  },
  birthFormSubtitle: {
    fontSize: fp(12),
    color: colors.neutral.grey500,
    marginBottom: hp(12),
    lineHeight: fp(12) * 1.4,
  },
  fieldLabel: {
    fontSize: fp(13),
    fontWeight: '500',
    color: colors.neutral.grey700,
    marginTop: hp(8),
    marginBottom: hp(4),
  },
  fieldInput: {
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(8),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    fontSize: fp(14),
    color: colors.neutral.grey800,
  },
  timeRow: {
    flexDirection: 'row',
    gap: wp(8),
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  ampmRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(8),
    overflow: 'hidden',
  },
  ampmButton: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(8),
    backgroundColor: colors.neutral.white,
  },
  ampmActive: {
    backgroundColor: colors.primary.saffron,
  },
  ampmText: {
    fontSize: fp(12),
    fontWeight: '500',
    color: colors.neutral.grey500,
  },
  ampmTextActive: {
    color: colors.neutral.white,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginTop: hp(6),
  },
  checkbox: {
    width: wp(18),
    height: wp(18),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
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
  checkboxLabel: {
    fontSize: fp(12),
    color: colors.neutral.grey600,
    flex: 1,
  },
  approxOptions: {
    gap: hp(4),
    marginTop: hp(6),
  },
  approxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(8),
  },
  approxOptionActive: {
    borderColor: colors.primary.saffron,
    backgroundColor: 'rgba(255,140,0,0.08)',
  },
  radio: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
  },
  radioActive: {
    borderColor: colors.primary.saffron,
    backgroundColor: colors.primary.saffron,
  },
  approxText: {
    fontSize: fp(12),
    color: colors.neutral.grey700,
  },
  approxTextActive: {
    color: colors.primary.saffronDark,
    fontWeight: '500',
  },
  placeDropdown: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: colors.neutral.grey200,
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    maxHeight: hp(150),
  },
  placeOption: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.grey100,
  },
  placeOptionText: {
    fontSize: fp(12),
    color: colors.neutral.grey700,
  },
  generateButton: {
    marginTop: hp(12),
    paddingVertical: hp(12),
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: fp(16),
    fontWeight: '600',
    color: colors.neutral.white,
  },
  generateButtonSub: {
    fontSize: fp(11),
    color: 'rgba(255,255,255,0.85)',
    marginTop: hp(2),
  },

  /* Input Bar */
  inputBarWrapper: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.grey100,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    paddingBottom: Platform.OS === 'ios' ? hp(24) : hp(8),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: colors.neutral.grey50,
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(24),
    paddingHorizontal: wp(14),
    paddingVertical: hp(4),
  },
  input: {
    flex: 1,
    fontSize: fp(14),
    color: colors.neutral.grey800,
    paddingVertical: hp(6),
  },
  sendButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    backgroundColor: colors.primary.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: fp(15),
    color: colors.neutral.white,
  },
  micButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: fp(16),
  },
});
