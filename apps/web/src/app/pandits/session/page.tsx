'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

interface ChatMessage {
  role: 'user' | 'pandit' | 'system';
  content: string;
  timestamp: string;
}

interface SessionData {
  panditName: string;
  panditNameHi: string;
  type: 'chat' | 'call';
  pricePerMin: number;
  startTime: Date;
  isActive: boolean;
}

function getMockSession(): SessionData {
  return {
    panditName: 'Pandit Ramesh Shastri',
    panditNameHi: '\u092A\u0902\u0921\u093F\u0924 \u0930\u092E\u0947\u0936 \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940',
    type: 'chat',
    pricePerMin: 1500,
    startTime: new Date(),
    isActive: true,
  };
}

function getMockMessages(): ChatMessage[] {
  return [
    {
      role: 'system',
      content: 'Session started. AI brief shared with pandit.',
      timestamp: new Date().toISOString(),
    },
    {
      role: 'pandit',
      content: 'Namaste! I\'ve reviewed your kundli analysis. I can see the Mangal dosha in your 7th house. Let\'s discuss your concerns.',
      timestamp: new Date(Date.now() - 30000).toISOString(),
    },
  ];
}

export default function PanditSessionPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [session] = useState<SessionData>(getMockSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [walletBalance] = useState(50000); // ₹500 in paise
  const [showEndModal, setShowEndModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [summary, setSummary] = useState<{ keyPoints: string[]; newRemedies: { name: string; nameHi: string }[]; timelineGuidance: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setMessages(getMockMessages());
  }, []);

  // Timer
  useEffect(() => {
    if (session.isActive && !sessionEnded) {
      timerRef.current = setInterval(() => {
        setElapsedMinutes(Math.ceil((Date.now() - session.startTime.getTime()) / 60000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.isActive, session.startTime, sessionEnded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);

  const currentCost = elapsedMinutes * session.pricePerMin;
  const remainingBalance = Math.max(0, walletBalance - currentCost);
  const remainingMinutes = Math.floor(remainingBalance / session.pricePerMin);
  const isLowBalance = remainingMinutes <= 2;

  const sendMessage = useCallback(() => {
    if (!input.trim() || sessionEnded) return;
    const msg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');

    // Simulate pandit response
    setTimeout(() => {
      const reply: ChatMessage = {
        role: 'pandit',
        content: language === 'hi'
          ? '\u0906\u092A\u0915\u0940 \u092C\u093E\u0924 \u0938\u092E\u091D \u0930\u0939\u093E \u0939\u0942\u0901\u0964 \u0906\u092A\u0915\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092E\u0947\u0902 \u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0915\u0947 \u0915\u093E\u0930\u0923 7\u0935\u0947\u0902 \u092D\u093E\u0935 \u092E\u0947\u0902 \u0915\u0941\u091B \u0930\u0941\u0915\u093E\u0935\u091F \u0906 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0932\u0947\u0915\u093F\u0928 \u091A\u093F\u0902\u0924\u093E \u0928 \u0915\u0930\u0947\u0902 - \u092F\u0939 \u0909\u092A\u093E\u092F\u094B\u0902 \u0938\u0947 \u0920\u0940\u0915 \u0939\u094B \u0938\u0915\u0924\u093E \u0939\u0948\u0964'
          : 'I understand your concern. The Mangal dosha in your 7th house is creating some temporary blockages. But don\'t worry - with the right remedies, this is highly responsive to correction.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  }, [input, language, sessionEnded]);

  const handleEndSession = () => {
    setShowEndModal(true);
  };

  const confirmEndSession = () => {
    setSessionEnded(true);
    setShowEndModal(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Simulate AI summary generation
    setTimeout(() => {
      setSummary({
        keyPoints: [
          'Mangal dosha confirmed in 7th house affecting marriage prospects',
          'Current remedy protocol is on the right track',
          'Additional Hanuman Chalisa recommended on Tuesdays',
        ],
        newRemedies: [
          { name: 'Hanuman Chalisa on Tuesday', nameHi: '\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E' },
          { name: 'Donate red lentils on Tuesday', nameHi: '\u092E\u0902\u0917\u0932\u0935\u093E\u0930 \u0932\u093E\u0932 \u092E\u0938\u0942\u0930 \u0926\u093E\u0928' },
        ],
        timelineGuidance: 'Continue current remedies for 21 more days. Improvement expected within 3 months.',
      });
    }, 1500);
  };

  const formatPrice = (paise: number) => `\u20B9${Math.round(paise / 100)}`;

  return (
    <div className={styles.appLayout}>
      <TopBar
        title={t(session.panditNameHi, session.panditName)}
        showBack
        onLanguageToggle={toggleLanguage}
      />

      {/* Session Info Bar */}
      {!sessionEnded && (
        <div className={`${styles.sessionBar} ${isLowBalance ? styles.sessionBarWarning : ''}`}>
          <div className={styles.sessionBarLeft}>
            <span className={styles.sessionTimer}>{'\u23F1\uFE0F'} {elapsedMinutes} min</span>
            <span className={styles.sessionCost}>{formatPrice(currentCost)}</span>
          </div>
          <div className={styles.sessionBarRight}>
            <span className={styles.sessionBalance}>
              {t('\u0936\u0947\u0937', 'Bal')}: {formatPrice(remainingBalance)}
              {isLowBalance && ` (${remainingMinutes} min ${t('\u092C\u091A\u0947', 'left')})`}
            </span>
            <button className={styles.endBtn} onClick={handleEndSession}>
              {t('\u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902', 'End')}
            </button>
          </div>
        </div>
      )}

      <main className={styles.mainContent}>
        <div className={styles.chatContainer}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : msg.role === 'system' ? styles.msgRowSystem : ''}`}
            >
              {msg.role === 'system' ? (
                <div className={styles.systemMsg}>{msg.content}</div>
              ) : (
                <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubblePandit}`}>
                  <p className={styles.msgText}>{msg.content}</p>
                  <span className={styles.msgTime}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Summary after session ends */}
          {sessionEnded && summary && (
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>{'\uD83D\uDCCB'} {t('Session \u0938\u093E\u0930\u093E\u0902\u0936', 'Session Summary')}</h3>

              <div className={styles.summarySection}>
                <h4 className={styles.summarySubTitle}>{t('\u092E\u0941\u0916\u094D\u092F \u092C\u093F\u0902\u0926\u0941', 'Key Points')}</h4>
                <ul className={styles.summaryList}>
                  {summary.keyPoints.map((kp, i) => (
                    <li key={i} className={styles.summaryListItem}>{kp}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.summarySection}>
                <h4 className={styles.summarySubTitle}>{t('\u0928\u090F \u0909\u092A\u093E\u092F', 'New Remedies')}</h4>
                {summary.newRemedies.map((r, i) => (
                  <div key={i} className={styles.summaryRemedy}>
                    <span>{'\uD83D\uDCFF'}</span>
                    <span>{t(r.nameHi, r.name)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.summarySection}>
                <h4 className={styles.summarySubTitle}>{t('\u0938\u092E\u092F \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928', 'Timeline')}</h4>
                <p className={styles.summaryText}>{summary.timelineGuidance}</p>
              </div>

              <div className={styles.summaryCost}>
                <span>{t('\u0915\u0941\u0932 \u0932\u093E\u0917\u0924', 'Total cost')}: <strong>{formatPrice(currentCost)}</strong></span>
                <span>{t('\u0905\u0935\u0927\u093F', 'Duration')}: <strong>{elapsedMinutes} min</strong></span>
              </div>

              {/* Rating */}
              <div className={styles.ratingSection}>
                <p className={styles.ratingPrompt}>{t('\u0905\u092A\u0928\u093E \u0905\u0928\u0941\u092D\u0935 \u0915\u0948\u0938\u093E \u0930\u0939\u093E?', 'How was your experience?')}</p>
                <div className={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`${styles.ratingStar} ${star <= rating ? styles.ratingStarActive : ''}`}
                      onClick={() => setRating(star)}
                    >
                      {'\u2B50'}
                    </button>
                  ))}
                </div>
              </div>

              <button className={styles.backToRemediesBtn} onClick={() => router.push('/remedies')}>
                {t('\u0909\u092A\u093E\u092F \u091F\u094D\u0930\u0948\u0915\u0930 \u092A\u0930 \u091C\u093E\u090F\u0902', 'Go to Remedy Tracker')}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      {!sessionEnded && (
        <div className={styles.inputBar}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('\u0905\u092A\u0928\u093E \u0938\u0935\u093E\u0932 \u092A\u0942\u091B\u0947\u0902...', 'Type your message...')}
          />
          <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
            {'\u2191'}
          </button>
        </div>
      )}

      {/* End Session Modal */}
      {showEndModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t('Session \u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902?', 'End Session?')}</h3>
            <p className={styles.modalText}>
              {t(
                `\u0915\u0941\u0932 \u0932\u093E\u0917\u0924: ${formatPrice(currentCost)} (${elapsedMinutes} min)`,
                `Total cost: ${formatPrice(currentCost)} (${elapsedMinutes} min)`
              )}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowEndModal(false)}>
                {t('\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902', 'Cancel')}
              </button>
              <button className={styles.modalConfirm} onClick={confirmEndSession}>
                {t('\u0939\u093E\u0901, \u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902', 'Yes, End Session')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
