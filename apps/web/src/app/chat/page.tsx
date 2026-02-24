'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PROBLEM_TYPES, type ProblemType, type ChatMessageType } from '@upaya/shared';
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

// ---- Qualifying question chip sets per problem type ----

const QUALIFYING_CHIPS: Record<string, { label: string; value: string }[]> = {
  marriage_delay: [
    { label: '< 1 saal', value: '< 1 saal' },
    { label: '1-3 saal', value: '1-3 saal' },
    { label: '3+ saal', value: '3+ saal' },
  ],
  career_stuck: [
    { label: '< 1 saal', value: '< 1 saal' },
    { label: '1-3 saal', value: '1-3 saal' },
    { label: '3+ saal', value: '3+ saal' },
  ],
  money_problems: [
    { label: 'Sudden', value: 'Suddenly' },
    { label: 'Gradually', value: 'Gradually' },
    { label: 'Always', value: 'Always been' },
  ],
  health_issues: [
    { label: 'Recently', value: 'Recently' },
    { label: 'Few months', value: 'Few months' },
    { label: 'Long time', value: 'Long time' },
  ],
  legal_matters: [
    { label: 'Property', value: 'Property' },
    { label: 'Family', value: 'Family' },
    { label: 'Business', value: 'Business' },
    { label: 'Other', value: 'Other' },
  ],
  family_conflict: [
    { label: 'Recently', value: 'Recently' },
    { label: 'Few months', value: 'Few months' },
    { label: 'Years', value: 'Years' },
  ],
};

// ---- Qualifying questions per language and problem type ----

const QUALIFYING_QUESTIONS: Record<string, Record<string, string>> = {
  hi: {
    marriage_delay:
      'शादी में देरी — मैं समझ सकता हूँ यह कितना मुश्किल है, आपके लिए भी और family के लिए भी।\n\nमुझे थोड़ा और बताएं — कब से यह चल रहा है?',
    career_stuck:
      'करियर में रुकावट — मैं समझता हूँ कि effort लगाने के बाद भी progress न हो तो कितना frustrating होता है।\n\nकब से same position में हैं?',
    money_problems:
      'पैसों की problem — मैं समझता हूँ यह कितना stressful होता है।\n\nयह sudden हुआ या धीरे-धीरे?',
    health_issues:
      'स्वास्थ्य की चिंता — मैं समझता हूँ यह कितना परेशान करने वाला है।\n\nकब से यह health issue है?',
    legal_matters:
      'कानूनी मामला — मैं समझता हूँ यह कितना तनावपूर्ण होता है।\n\nकिस type का matter है?',
    family_conflict:
      'परिवार में तनाव — मैं समझता हूँ यह कितना दिल दुखाने वाला है।\n\nकब से यह tension है?',
    get_kundli: 'ज़रूर! आपकी कुंडली बनाने के लिए मुझे birth details चाहिए।',
    something_else: 'बिल्कुल, मैं सुन रहा हूँ। थोड़ा और बताएं — क्या problem है?',
  },
  en: {
    marriage_delay:
      "Marriage delay — I understand how difficult this must be, for you and your family.\n\nTell me a bit more — how long has this been going on?",
    career_stuck:
      "Career stuck — I understand how frustrating it is when progress doesn't come despite your efforts.\n\nHow long have you been in the same position?",
    money_problems:
      "Money problems — I understand how stressful this can be.\n\nDid this happen suddenly or gradually?",
    health_issues:
      "Health concerns — I understand how worrying this must be.\n\nHow long have you been dealing with this health issue?",
    legal_matters:
      "Legal matters — I understand how stressful this can be.\n\nWhat type of matter is it?",
    family_conflict:
      "Family tension — I understand how heartbreaking this can be.\n\nHow long has this tension been going on?",
    get_kundli: 'Of course! I need your birth details to generate your kundli.',
    something_else: "Of course, I'm listening. Tell me more — what's the problem?",
  },
};

// ---- Curiosity bridge templates ----

const CURIOSITY_BRIDGES: Record<string, Record<string, string>> = {
  hi: {
    marriage_delay:
      '{{answer}} से रिश्ते आके टूटना — यह एक specific pattern है जो बहुत cases में दिखता है।\n\n💡 अक्सर यह तब होता है जब कोई planetary combination directly 7th house (marriage house) को affect कर रहा हो। यह permanent नहीं होता — सही remedies से इसके effects significantly कम होते हैं।\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ कि कौनसा ग्रह यह कर रहा है और क्या remedy सबसे effective होगी।',
    career_stuck:
      '{{answer}} से करियर में रुकावट — despite effort — यह अक्सर तब होता है जब 10th house (career house) या उसके lord पे कोई ग्रह pressure डाल रहा हो। यह temporary phase होता है और specific remedies से breakthrough possible है।\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ कि कौनसा ग्रह यह कर रहा है और क्या remedy सबसे effective होगी।',
    money_problems:
      'Financial instability का pattern अक्सर 2nd house (wealth) या 11th house (income) के planets से जुड़ा होता है। कुंडली से पता चलता है कि कौनसा ग्रह pressure डाल रहा है और कैसे fix करना है।\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ।',
    health_issues:
      'Health issues frequently connect to 6th house afflictions in the chart. Understanding which planet is causing this helps identify the most effective remedies — both spiritual and practical.\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ।',
    legal_matters:
      'कानूनी विवाद अक्सर 6th house (litigation) या 8th house में planetary combinations से linked होते हैं। कुंडली analysis से पता चलता है कि कब favorable period आएगा और कौनसी remedies case के outcome को positively influence कर सकती हैं।',
    family_conflict:
      'Family में ongoing tension अक्सर 4th house (domestic peace) पे ग्रह influence से होती है। Specific remedies से घर का माहौल significantly improve हो सकता है।\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ।',
    something_else:
      'मैं समझता हूँ। आपकी कुंडली से बहुत कुछ पता चल सकता है — कौनसा ग्रह यह situation बना रहा है और क्या remedy सबसे effective होगी।',
  },
  en: {
    marriage_delay:
      "Proposals falling through for {{answer}} — this is a specific pattern seen in many cases.\n\n💡 This often happens when a planetary combination is directly affecting the 7th house (marriage house). It's not permanent — the right remedies can significantly reduce its effects.\n\nI can confirm from your exact kundli which planet is causing this and what remedy would be most effective.",
    career_stuck:
      "Career stuck for {{answer}} — despite effort — this often happens when a planet is putting pressure on the 10th house (career house) or its lord. This is a temporary phase and a breakthrough is possible with specific remedies.\n\nI can confirm from your exact kundli which planet is causing this.",
    money_problems:
      'Financial instability patterns are often connected to planets in the 2nd house (wealth) or 11th house (income). Your kundli can reveal which planet is creating pressure and how to address it.',
    health_issues:
      'Health issues frequently connect to 6th house afflictions in the chart. Understanding which planet is causing this helps identify the most effective remedies — both spiritual and practical.',
    legal_matters:
      'Legal disputes are often linked to planetary combinations in the 6th house (litigation) or 8th house. Kundli analysis can reveal when favorable periods will come and which remedies can positively influence the outcome.',
    family_conflict:
      'Ongoing family tension often stems from planetary influence on the 4th house (domestic peace). Specific remedies can significantly improve the household environment.',
    something_else:
      "I understand. Your kundli can reveal a lot — which planet is creating this situation and what remedy would be most effective.",
  },
};

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

    // For "get_kundli" problem type, skip directly to birth details
    if (problemType === 'get_kundli') {
      const aiMsg: ChatMsg = {
        id: generateId(),
        role: 'assistant',
        content: QUALIFYING_QUESTIONS[lang].get_kundli,
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

      // AI responds with qualifying question
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const qText = QUALIFYING_QUESTIONS[lang][problemType] || QUALIFYING_QUESTIONS[lang].something_else;
        const chips = QUALIFYING_CHIPS[problemType] || undefined;
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
        const qText = QUALIFYING_QUESTIONS[lang][problemType] || QUALIFYING_QUESTIONS[lang].something_else;
        const chips = QUALIFYING_CHIPS[problemType] || undefined;
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

    if (chatPhase === 'exchange_1') {
      // User answered the qualifying question → send curiosity bridge (Exchange 2)
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const bridgeTemplate =
          CURIOSITY_BRIDGES[language][problemType] ||
          CURIOSITY_BRIDGES[language].something_else;
        const bridgeText = bridgeTemplate.replace('{{answer}}', text);
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
      // After curiosity bridge, any user message is freeform chat
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const followUp =
          language === 'hi'
            ? 'मैं समझता हूँ। आपकी कुंडली से और detail पता चलेगी। नीचे birth details दें और हम आगे बढ़ते हैं।'
            : 'I understand. Your kundli will reveal more details. Please share your birth details below so we can proceed.';
        const aiMsg: ChatMsg = {
          id: generateId(),
          role: 'assistant',
          content: followUp,
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
      content:
        language === 'hi'
          ? `DOB: ${details.dateOfBirth}\nTime: ${details.timeOfBirth || 'Approximate'}\nPlace: ${details.placeOfBirth}`
          : `DOB: ${details.dateOfBirth}\nTime: ${details.timeOfBirth || 'Approximate'}\nPlace: ${details.placeOfBirth}`,
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

        <span className={styles.topBarTitle}>Upaya AI</span>

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
                          <span>
                            {language === 'hi' ? 'अपनी Birth Details दें' : 'Share your Birth Details'}
                          </span>
                          <span className={styles.birthDetailsCtaSub}>
                            {language === 'hi' ? '2 minute में कुंडली तैयार' : 'Kundli ready in 2 minutes'}
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
            placeholder={
              language === 'hi'
                ? 'अपनी बात यहाँ लिखें...'
                : 'Type here...'
            }
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
