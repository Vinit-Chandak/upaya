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
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  colors,
  PROBLEM_TYPES,
  getTranslations,
  detectLanguage,
  type TranslationKeys,
  type ProblemType,
  type ChatMessageType,
  type LocalKundliProfile,
  type Relationship,
} from '@upaya/shared';
import { fp, wp, hp } from '../theme';
import { createChatSession, sendChatMessage, generateKundli, createKundliProfile, ApiError } from '../services/api';
import {
  getLocalProfiles,
  saveLocalProfile,
  saveAnonSessionId,
  saveAnonProfileId,
} from '../services/localProfiles';
import BirthDetailsForm, { type BirthDetailsResult } from '../components/BirthDetailsForm';
import SavedProfilesSheet from '../components/SavedProfilesSheet';

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
  const { durationChips, moneyChips, whoChips, legalChips, familyChips } = t.aiMessages;
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
        { label: whoChips.self, value: whoChips.self },
        { label: whoChips.family, value: whoChips.family },
        { label: whoChips.pet, value: whoChips.pet },
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

// Infer relationship from whoChips answer text
function inferRelationship(text: string, t: TranslationKeys): Relationship {
  const { whoChips } = t.aiMessages;
  if (text === whoChips.family) return 'family';
  if (text === whoChips.pet) return 'pet';
  return 'self';
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDbId, setSessionDbId] = useState<string | null>(null);

  // Birth details flow
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<LocalKundliProfile[]>([]);
  const [preselectedRel, setPreselectedRel] = useState<Relationship>('self');
  const [isSubmittingBirth, setIsSubmittingBirth] = useState(false);

  // Track user's qualifying answer for diagnosis context
  const qualifyingAnswerRef = useRef('');
  // Track last whoChip selection for pre-filling relationship
  const lastWhoChipRef = useRef<string>('');

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

      const t_lang = getTranslations(lang);

      // Load saved profiles for picker
      const profiles = await getLocalProfiles();
      setSavedProfiles(profiles);

      let createdSessionId: string | null = null;
      try {
        const { session } = await createChatSession(problemType, lang);
        createdSessionId = (session as unknown as Record<string, string>).session_id ?? session.sessionId;
        setSessionId(createdSessionId);
        setSessionDbId(session.id);
        // Track this session for anonymous → auth claim
        if (createdSessionId) {
          await saveAnonSessionId(createdSessionId);
        }
      } catch (err) {
        console.warn('[Chat] Failed to create session, continuing offline:', err);
      }

      // get_kundli skips conversation and goes straight to birth details
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

      // Exchange 1 — LLM-powered
      const exchange1Message = initialMessage || (lang === 'hi' ? problemInfo.hi : problemInfo.en);

      if (initialMessage) {
        setMessages([{
          id: generateId(),
          role: 'user',
          content: initialMessage,
          messageType: 'text',
          createdAt: new Date(),
        }]);
      }

      setIsTyping(true);

      if (createdSessionId) {
        try {
          const response = await sendChatMessage(createdSessionId, exchange1Message);
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
          setMessages((prev) => initialMessage ? [...prev, aiMsg] : [aiMsg]);
          return;
        } catch (err) {
          console.warn('[Chat] Exchange 1 LLM failed, using i18n fallback:', err);
        }
      }

      // Fallback: static i18n qualifying question
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
        setMessages((prev) => initialMessage ? [...prev, aiMsg] : [aiMsg]);
      }, 800);
    };
    init();
  }, [problemType, initialMessage]);

  // Ref pattern to avoid stale closures in chip/send callbacks
  const handleUserReplyRef = useRef<((text: string) => void) | null>(null);

  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    handleUserReplyRef.current?.(text);
  }, [inputValue]);

  const handleChipTap = useCallback((value: string) => {
    handleUserReplyRef.current?.(value);
  }, []);

  const handleUserReply = async (text: string) => {
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

    if (chatPhase === 'exchange_1') {
      qualifyingAnswerRef.current = text;
      // Track if user selected a whoChip (for pre-filling relationship)
      const t_curr = getTranslations(language);
      const { whoChips } = t_curr.aiMessages;
      if ([whoChips.self, whoChips.family, whoChips.pet].includes(text)) {
        lastWhoChipRef.current = text;
      }
    }

    setIsTyping(true);

    const showCta = chatPhase === 'exchange_2';

    if (sessionId) {
      try {
        const response = await sendChatMessage(sessionId, text);
        setIsTyping(false);
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: response.aiMessage.content,
          messageType: 'text',
          showBirthDetailsCta: showCta,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (chatPhase === 'exchange_1') {
          setChatPhase('exchange_2');
        }
        return;
      } catch (err) {
        console.warn('[Chat] API call failed, using fallback:', err);
      }
    }

    // Offline fallback
    setTimeout(() => {
      setIsTyping(false);
      const t_reply = getTranslations(detectLanguage(text));
      const fallbackText = showCta
        ? t_reply.errors.offlineFallback
        : t_reply.aiMessages.exchange2Fallback;
      const aiMsg: ChatMsg = {
        id: generateId(),
        role: 'assistant',
        content: fallbackText,
        messageType: 'text',
        showBirthDetailsCta: showCta,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (chatPhase === 'exchange_1') {
        setChatPhase('exchange_2');
      }
    }, 800);
  };

  handleUserReplyRef.current = handleUserReply;

  // ── Birth details CTA tapped ────────────────────────────────────────────────

  const handleBirthDetailsCta = useCallback(async () => {
    setChatPhase('birth_details');

    // Determine pre-selected relationship from context
    const t_curr = getTranslations(language);
    const rel = lastWhoChipRef.current
      ? inferRelationship(lastWhoChipRef.current, t_curr)
      : 'self';
    setPreselectedRel(rel);

    // Reload profiles (may have been added in another session)
    const profiles = await getLocalProfiles();
    setSavedProfiles(profiles);

    if (profiles.length > 0) {
      setShowProfileSheet(true);
    } else {
      setShowBirthForm(true);
    }
  }, [language]);

  // ── Profile selected from sheet — skip form, generate immediately ───────────

  const handleProfileSelected = useCallback(async (profile: LocalKundliProfile) => {
    setShowProfileSheet(false);
    setChatPhase('generating');

    const confirmMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: `${profile.personName} · ${profile.dateOfBirth} · ${profile.placeOfBirthName}`,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);

    try {
      const { kundli } = await generateKundli({
        dateOfBirth: profile.dateOfBirth,
        timeOfBirth: profile.timeOfBirth ?? undefined,
        timeApproximate: profile.timeApproximate,
        placeOfBirthName: profile.placeOfBirthName,
        placeOfBirthLat: profile.placeOfBirthLat,
        placeOfBirthLng: profile.placeOfBirthLng,
      });

      router.push({
        pathname: '/kundli-animation',
        params: {
          kundliId: kundli.id,
          sessionId: sessionDbId || '',
          problemType,
          qualifyingAnswer: qualifyingAnswerRef.current,
          dob: profile.dateOfBirth,
          tob: profile.timeOfBirth || '',
          place: profile.placeOfBirthName,
          lang: language,
          personName: profile.personName,
        },
      });
    } catch (err) {
      setChatPhase('birth_details');
      const t = getTranslations(language);
      Alert.alert(t.common.error, t.errors.kundliGenerationError);
      console.error('[Chat] Kundli generation from profile failed:', err);
    }
  }, [sessionDbId, problemType, language, router]);

  // ── Birth form submitted ────────────────────────────────────────────────────

  const handleBirthFormSubmit = useCallback(async (details: BirthDetailsResult) => {
    setShowBirthForm(false);
    setIsSubmittingBirth(true);
    setChatPhase('generating');

    const confirmMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: `${details.personName} · ${details.dateOfBirth} · ${details.placeOfBirthName}`,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);

    try {
      // 1. Save profile to server (anonymous or authenticated)
      let serverId: string | null = null;
      try {
        const { profile } = await createKundliProfile({
          personName: details.personName,
          relationship: details.relationship,
          dateOfBirth: details.dateOfBirth,
          timeOfBirth: details.timeOfBirth,
          timeApproximate: details.timeApproximate,
          placeOfBirthName: details.placeOfBirthName,
          placeOfBirthLat: details.placeOfBirthLat,
          placeOfBirthLng: details.placeOfBirthLng,
        });
        serverId = profile.id ?? null;
        if (serverId) {
          await saveAnonProfileId(serverId);
        }
      } catch (err) {
        // Non-fatal — profile just won't be saved on server yet; local storage still works
        console.warn('[Chat] Failed to save profile to server:', err);
      }

      // 2. Save profile locally for profile picker
      const localProfile: LocalKundliProfile = {
        localId: generateId(),
        serverId,
        personName: details.personName,
        relationship: details.relationship,
        dateOfBirth: details.dateOfBirth,
        timeOfBirth: details.timeOfBirth,
        timeApproximate: details.timeApproximate,
        placeOfBirthName: details.placeOfBirthName,
        placeOfBirthLat: details.placeOfBirthLat,
        placeOfBirthLng: details.placeOfBirthLng,
        createdAt: new Date().toISOString(),
      };
      await saveLocalProfile(localProfile);

      // 3. Generate kundli (non-fatal — profile is already saved locally)
      let kundliId: string | undefined;
      try {
        const { kundli } = await generateKundli({
          dateOfBirth: details.dateOfBirth,
          timeOfBirth: details.timeOfBirth ?? undefined,
          timeApproximate: details.timeApproximate,
          placeOfBirthName: details.placeOfBirthName,
          placeOfBirthLat: details.placeOfBirthLat,
          placeOfBirthLng: details.placeOfBirthLng,
        });
        kundliId = kundli.id;
      } catch (err) {
        console.warn('[Chat] generateKundli failed (non-fatal), navigating without kundliId:', err);
      }

      // 4. Navigate to kundli animation (with or without kundliId)
      router.push({
        pathname: '/kundli-animation',
        params: {
          kundliId: kundliId || '',
          sessionId: sessionDbId || '',
          problemType,
          qualifyingAnswer: qualifyingAnswerRef.current,
          dob: details.dateOfBirth,
          tob: details.timeOfBirth || '',
          place: details.placeOfBirthName,
          lang: language,
          personName: details.personName,
        },
      });
    } catch (err) {
      setIsSubmittingBirth(false);
      setChatPhase('birth_details');
      const t = getTranslations(language);
      Alert.alert(t.common.error, t.errors.kundliGenerationError);
      console.error('[Chat] Birth form submission failed:', err);
    }
  }, [sessionDbId, problemType, language, router]);

  const t = getTranslations(language);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                        <Text style={styles.birthDetailsCtaText}>{t.chat.birthDetailsCta}</Text>
                        <Text style={styles.birthDetailsCtaSub}>{t.chat.birthDetailsSub}</Text>
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

      {/* Saved Profiles Sheet */}
      <SavedProfilesSheet
        visible={showProfileSheet}
        profiles={savedProfiles}
        language={language}
        onSelectProfile={handleProfileSelected}
        onAddNew={() => { setShowProfileSheet(false); setShowBirthForm(true); }}
        onDismiss={() => { setShowProfileSheet(false); setChatPhase('exchange_2'); }}
      />

      {/* Birth Details Form — full-screen modal */}
      <Modal
        visible={showBirthForm}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowBirthForm(false); setChatPhase('exchange_2'); }}
      >
        <TouchableOpacity
          style={styles.formOverlay}
          activeOpacity={1}
          onPress={() => { setShowBirthForm(false); setChatPhase('exchange_2'); }}
        />
        <View style={styles.formSheet}>
          <View style={styles.formHandleBar} />
          <BirthDetailsForm
            language={language}
            preselectedRel={preselectedRel}
            onSubmit={handleBirthFormSubmit}
            onCancel={() => { setShowBirthForm(false); setChatPhase('exchange_2'); }}
          />
        </View>
      </Modal>
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
  backButton: { padding: wp(6) },
  backArrow: { fontSize: fp(20), color: colors.neutral.grey700 },
  topBarTitle: { flex: 1, fontSize: fp(16), fontWeight: '600', color: colors.secondary.maroon },
  problemBadge: { paddingHorizontal: wp(10), paddingVertical: hp(3), backgroundColor: '#FFF8F0', borderRadius: wp(20) },
  problemBadgeText: { fontSize: fp(11), fontWeight: '500', color: colors.secondary.maroon },
  overflowButton: { padding: wp(6) },
  overflowDots: { fontSize: fp(18), color: colors.neutral.grey500 },

  /* Messages */
  messagesArea: { flex: 1 },
  messagesContent: { paddingHorizontal: wp(12), paddingVertical: hp(12), gap: hp(6) },
  messageRow: { flexDirection: 'row', gap: wp(6), marginBottom: hp(2) },
  messageRowAi: { justifyContent: 'flex-start' },
  messageRowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: wp(32), height: wp(32), borderRadius: wp(16),
    backgroundColor: '#FFF8F0', borderWidth: 1.5, borderColor: colors.accent.goldLight,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  aiAvatarText: { fontSize: fp(14) },
  avatarPlaceholder: { width: wp(32) },
  messageBubble: { paddingHorizontal: wp(12), paddingVertical: hp(8), borderRadius: wp(16), maxWidth: SCREEN_WIDTH * 0.75 },
  aiBubble: { backgroundColor: '#FFF8F0', borderBottomLeftRadius: wp(4) },
  userBubble: { backgroundColor: '#FFF3E0', borderBottomRightRadius: wp(4) },
  messageText: { fontSize: fp(14), lineHeight: fp(14) * 1.5, color: colors.neutral.grey800 },

  /* Quick replies */
  quickRepliesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(6), marginTop: hp(8) },
  quickReplyChip: {
    paddingHorizontal: wp(12), paddingVertical: hp(6),
    borderWidth: 1.5, borderColor: colors.primary.saffronLight,
    borderRadius: wp(20), backgroundColor: colors.neutral.white,
  },
  quickReplyText: { fontSize: fp(12), fontWeight: '500', color: colors.primary.saffronDark },

  /* Birth Details CTA */
  birthDetailsCta: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: hp(8),
    paddingHorizontal: wp(12), paddingVertical: hp(10),
    backgroundColor: colors.primary.saffron, borderRadius: wp(12),
  },
  birthDetailsCtaIcon: { fontSize: fp(18) },
  birthDetailsCtaText: { fontSize: fp(14), fontWeight: '600', color: colors.neutral.white },
  birthDetailsCtaSub: { fontSize: fp(11), color: 'rgba(255,255,255,0.85)' },

  /* Timestamps */
  timestampRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginBottom: hp(4) },
  timestampAi: { justifyContent: 'flex-start', paddingLeft: wp(38) },
  timestampUser: { justifyContent: 'flex-end' },
  timestampText: { fontSize: fp(10), color: colors.neutral.grey400 },
  readReceipt: { fontSize: fp(9), color: colors.neutral.grey400 },

  /* Typing */
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: wp(4), paddingHorizontal: wp(16), paddingVertical: hp(12) },
  typingDot: { width: wp(7), height: wp(7), borderRadius: wp(4), backgroundColor: colors.neutral.grey400 },

  /* Input bar */
  inputBarWrapper: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.neutral.grey100,
    paddingHorizontal: wp(12), paddingVertical: hp(8),
    paddingBottom: Platform.OS === 'ios' ? hp(24) : hp(8),
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    backgroundColor: colors.neutral.grey50, borderWidth: 1.5, borderColor: colors.neutral.grey200,
    borderRadius: wp(24), paddingHorizontal: wp(14), paddingVertical: hp(4),
  },
  input: { flex: 1, fontSize: fp(14), color: colors.neutral.grey800, paddingVertical: hp(6) },
  sendButton: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    backgroundColor: colors.primary.saffron, alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: fp(15), color: colors.neutral.white },
  micButton: { width: wp(34), height: wp(34), borderRadius: wp(17), alignItems: 'center', justifyContent: 'center' },
  micIcon: { fontSize: fp(16) },

  /* Form modal */
  formOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  formSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    maxHeight: '92%',
  },
  formHandleBar: {
    width: wp(40), height: hp(4), backgroundColor: colors.neutral.grey200,
    borderRadius: hp(2), alignSelf: 'center', marginTop: hp(12), marginBottom: hp(4),
  },
});
