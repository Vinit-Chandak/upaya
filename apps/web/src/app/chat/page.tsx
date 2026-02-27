'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROBLEM_TYPES, getTranslations, interpolate, detectLanguage, type TranslationKeys, type ProblemType, type ChatMessageType } from '@upaya/shared';
import BirthDetailsCard from './BirthDetailsCard';
import styles from './page.module.css';

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
  | 'exchange_1'      // AI asked qualifying question, waiting for user answer
  | 'exchange_2'      // AI showed curiosity bridge + birth details CTA
  | 'birth_details'   // Birth details form shown
  | 'generating';     // Kundli generation started

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

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemType = (searchParams.get('problem') || 'something_else') as ProblemType;
  const initialMessage = searchParams.get('message') || '';

  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('exchange_1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  const problemInfo = PROBLEM_TYPES[problemType];

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Initialize: load language, send first AI message
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);

    const lang = stored || 'hi';

    const t_lang = getTranslations(lang);
    const qq = t_lang.aiMessages.qualifyingQuestions;

    // For "get_kundli" problem type, skip directly to birth details
    if (problemType === 'get_kundli') {
      const aiMsg: ChatMsg = {
        id: generateId(),
        role: 'assistant',
        content: qq.get_kundli,
        messageType: 'text',
        showBirthDetailsCta: true,
        createdAt: new Date(),
      };
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([aiMsg]);
        setChatPhase('birth_details');
      }, 800);
      return;
    }

    // If user typed a custom message, add it first, then AI responds
    if (initialMessage) {
      const userMsg: ChatMsg = {
        id: generateId(),
        role: 'user',
        content: initialMessage,
        messageType: 'text',
        createdAt: new Date(),
      };
      setMessages([userMsg]);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
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
      }, 1000);
    } else {
      // No initial message — AI starts with qualifying question immediately
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
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
        setMessages([aiMsg]);
      }, 800);
    }
  }, [problemType, initialMessage]);

  // Handle sending a message (from text input)
  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    handleUserReply(text);
  }, [inputValue]);

  // Handle a quick-reply chip tap
  const handleChipTap = useCallback((value: string) => {
    handleUserReply(value);
  }, []);

  // Core reply handler
  const handleUserReply = (text: string) => {
    // Remove quick replies from previous AI messages
    setMessages((prev) =>
      prev.map((m) => (m.quickReplies ? { ...m, quickReplies: undefined } : m))
    );

    // Add user message
    const userMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: text,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Mirror the language the user typed in, not the stored app language
    const replyLang = detectLanguage(text);
    const t = getTranslations(replyLang);

    if (chatPhase === 'exchange_1') {
      // User answered the qualifying question → send curiosity bridge (Exchange 2)
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const cb = t.curiosityBridge;
        const bridgeTemplate = (cb[problemType as keyof typeof cb] as string | undefined) || t.errors.offlineFallback;
        const bridgeText = interpolate(bridgeTemplate, { duration: text, answer: text });
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: bridgeText,
          messageType: 'text',
          showBirthDetailsCta: true,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setChatPhase('exchange_2');
      }, 1000);
    } else if (chatPhase === 'exchange_2' || chatPhase === 'birth_details') {
      // After curiosity bridge, redirect to birth details
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: t.errors.offlineFallback,
          messageType: 'text',
          showBirthDetailsCta: true,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Birth Details CTA clicked → show form
  const handleBirthDetailsCta = () => {
    setChatPhase('birth_details');
    // Add form card as special message
    const formMsg: ChatMsg = {
      id: generateId(),
      role: 'assistant',
      content: '',
      messageType: 'birth_details_form',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, formMsg]);
  };

  // Birth Details submitted → navigate to kundli animation
  const handleBirthDetailsSubmit = (details: {
    dateOfBirth: string;
    timeOfBirth: string | null;
    timeApproximate: boolean;
    placeOfBirth: string;
    placeOfBirthLat: number;
    placeOfBirthLng: number;
  }) => {
    setChatPhase('generating');

    // Show user confirmation message
    const confirmMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: `${details.dateOfBirth} · ${details.timeOfBirth || getTranslations(language).birthDetails.unknownTimeSub} · ${details.placeOfBirth}`,
      messageType: 'text',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);

    // Navigate to kundli animation with details
    const params = new URLSearchParams({
      dob: details.dateOfBirth,
      tob: details.timeOfBirth || '',
      tobApprox: details.timeApproximate ? '1' : '0',
      place: details.placeOfBirth,
      lat: String(details.placeOfBirthLat),
      lng: String(details.placeOfBirthLng),
      problem: problemType,
      lang: language,
    });

    setTimeout(() => {
      router.push(`/chat/kundli-animation?${params.toString()}`);
    }, 500);
  };

  return (
    <div className={styles.chatLayout}>
      {/* Top Bar */}
      <div className={styles.chatTopBar}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="Go back">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <span className={styles.topBarTitle}>{getTranslations(language).chat.aiTitle}</span>

        <span className={styles.problemChipBadge}>
          {problemInfo.emoji} {language === 'hi' ? problemInfo.hi : problemInfo.en}
        </span>

        <button className={styles.overflowButton} aria-label="More options">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        <div className={styles.messagesContainer}>
          {messages.map((msg, index) => {
            const showAvatar =
              msg.role === 'assistant' &&
              (index === 0 || messages[index - 1]?.role !== 'assistant');
            const showTimestamp =
              index === messages.length - 1 ||
              messages[index + 1]?.role !== msg.role;

            // Birth details form card
            if (msg.messageType === 'birth_details_form') {
              return (
                <div key={msg.id} className={`${styles.messageRow} ${styles.messageRowAi}`}>
                  {showAvatar ? (
                    <div className={styles.aiAvatar}>🙏</div>
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                  <BirthDetailsCard
                    language={language}
                    onSubmit={handleBirthDetailsSubmit}
                    disabled={chatPhase === 'generating'}
                  />
                </div>
              );
            }

            return (
              <div key={msg.id}>
                <div
                  className={`${styles.messageRow} ${
                    msg.role === 'assistant' ? styles.messageRowAi : styles.messageRowUser
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <>
                      {showAvatar ? (
                        <div className={styles.aiAvatar}>🙏</div>
                      ) : (
                        <div className={styles.avatarPlaceholder} />
                      )}
                    </>
                  )}

                  <div
                    className={`${styles.messageBubble} ${
                      msg.role === 'assistant' ? styles.aiBubble : styles.userBubble
                    }`}
                  >
                    {msg.content}

                    {/* Quick reply chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className={styles.quickRepliesWrapper}>
                        {msg.quickReplies.map((chip) => (
                          <button
                            key={chip.value}
                            className={styles.quickReplyChip}
                            onClick={() => handleChipTap(chip.value)}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Birth details CTA button */}
                    {msg.showBirthDetailsCta && chatPhase !== 'birth_details' && chatPhase !== 'generating' && (
                      <button className={styles.birthDetailsCta} onClick={handleBirthDetailsCta}>
                        <span className={styles.birthDetailsCtaIcon}>📋</span>
                        <span className={styles.birthDetailsCtaContent}>
                          <span>{getTranslations(language).chat.birthDetailsCta}</span>
                          <span className={styles.birthDetailsCtaSub}>
                            {getTranslations(language).chat.birthDetailsSub}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                {showTimestamp && (
                  <div
                    className={`${styles.messageTimestamp} ${
                      msg.role === 'assistant'
                        ? styles.messageTimestampAi
                        : styles.messageTimestampUser
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {msg.role === 'user' && (
                      <span className={styles.readReceipt}>✓✓</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className={styles.typingIndicator}>
              <div className={styles.aiAvatar}>🙏</div>
              <div className={styles.typingBubble}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className={styles.inputBarWrapper}>
        <div className={styles.inputBar}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={getTranslations(language).chat.inputPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping || chatPhase === 'generating'}
          />
          {inputValue.trim() ? (
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={isTyping || chatPhase === 'generating'}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button className={styles.micButton} aria-label="Voice input">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className={styles.chatLayout} />}>
      <ChatPageContent />
    </Suspense>
  );
}
