'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

const PROBLEM_CHIPS = [
  { key: 'marriage_delay', emoji: '💍', hi: 'शादी में देरी', en: 'Marriage Delay' },
  { key: 'career_stuck', emoji: '💼', hi: 'करियर में रुकावट', en: 'Career Stuck' },
  { key: 'money_problems', emoji: '💰', hi: 'पैसे की समस्या', en: 'Money Problems' },
  { key: 'health_issues', emoji: '🏥', hi: 'स्वास्थ्य समस्या', en: 'Health Issues' },
  { key: 'legal_matters', emoji: '⚖️', hi: 'कानूनी विवाद', en: 'Legal Matters' },
  { key: 'family_conflict', emoji: '👨‍👩‍👧‍👦', hi: 'पारिवारिक कलह', en: 'Family Conflict' },
  { key: 'get_kundli', emoji: '📖', hi: 'कुंडली बनवाएं', en: 'Get My Kundli' },
  { key: 'something_else', emoji: '🔮', hi: 'कुछ और पूछना है', en: 'Something Else' },
];

/**
 * Greeting illustration based on time of day
 */
function getTimeGreeting(language: 'hi' | 'en'): { emoji: string; text: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { emoji: '🌅', text: language === 'hi' ? 'शुभ प्रभात' : 'Good Morning' };
  } else if (hour >= 12 && hour < 17) {
    return { emoji: '☀️', text: language === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon' };
  } else if (hour >= 17 && hour < 21) {
    return { emoji: '🪔', text: language === 'hi' ? 'शुभ संध्या' : 'Good Evening' };
  } else {
    return { emoji: '🌙', text: language === 'hi' ? 'शुभ रात्रि' : 'Good Night' };
  }
}

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [inputValue, setInputValue] = useState('');
  const [hasHistory] = useState(false); // Will be set from API/storage in future
  const [userName] = useState<string | null>(null); // Will be set from auth in future

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const handleChipClick = (chipKey: string) => {
    router.push(`/chat?problem=${chipKey}`);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const encoded = encodeURIComponent(inputValue.trim());
    router.push(`/chat?problem=something_else&message=${encoded}`);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const timeGreeting = getTimeGreeting(language);

  // First-time user view (no chat history)
  if (!hasHistory) {
    return (
      <div className={styles.appLayout}>
        <TopBar onLanguageToggle={toggleLanguage} language={language} />

        <main className={styles.mainContent}>
          <div className={styles.container}>
            {/* Time-based illustration */}
            <div className={styles.illustration}>
              <span className={styles.illustrationEmoji}>{timeGreeting.emoji}</span>
              <p className={styles.greetingText}>{timeGreeting.text}</p>
            </div>

            {/* Main prompt */}
            <div className={styles.promptSection}>
              <h1 className={styles.mainPrompt}>
                {language === 'hi'
                  ? 'आज आपको क्या परेशान कर रहा है?'
                  : "Tell me what's worrying you today"}
              </h1>
              <p className={styles.mainPromptSub}>
                {language === 'hi'
                  ? "Tell me what's worrying you today"
                  : 'आज आपको क्या परेशान कर रहा है?'}
              </p>
            </div>

            {/* Problem chips */}
            <div className={styles.chipGrid}>
              {PROBLEM_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  className={styles.chip}
                  onClick={() => handleChipClick(chip.key)}
                >
                  <span className={styles.chipEmoji}>{chip.emoji}</span>
                  <span className={styles.chipTextPrimary}>
                    {language === 'hi' ? chip.hi : chip.en}
                  </span>
                  <span className={styles.chipTextSecondary}>
                    {language === 'hi' ? chip.en : chip.hi}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Input bar (bottom-pinned) */}
        <div className={styles.inputBarWrapper}>
          <div className={styles.inputBar}>
            <input
              type="text"
              className={styles.input}
              placeholder={
                language === 'hi'
                  ? 'अपनी बात यहाँ लिखें... / Type your concern here...'
                  : 'Type your concern here... / अपनी बात यहाँ लिखें...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {inputValue.trim() ? (
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            ) : (
              <button className={styles.micButton} aria-label="Voice input">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <BottomTabBar language={language} />
      </div>
    );
  }

  // Returning user view (has chat history)
  return (
    <div className={styles.appLayout}>
      <TopBar onLanguageToggle={toggleLanguage} language={language} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Welcome message */}
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeText}>
              {language === 'hi'
                ? `फिर से स्वागत है${userName ? `, ${userName}` : ''} 🙏`
                : `Welcome back${userName ? `, ${userName}` : ''} 🙏`}
            </h1>
          </div>

          {/* Active Remedy Plan Progress Card (placeholder) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📿</span>
              <h3 className={styles.cardTitle}>
                {language === 'hi' ? 'आपका चालू उपाय योजना' : 'Your Active Remedy Plan'}
              </h3>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '35%' }} />
            </div>
            <p className={styles.cardMeta}>
              {language === 'hi' ? '63 में से 8वाँ दिन · 35% पूरा' : 'Day 8 of 63 · 35% complete'}
            </p>
          </div>

          {/* Transit Alert Card (placeholder) */}
          <div className={styles.alertCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>⚡</span>
              <h3 className={styles.cardTitle}>
                {language === 'hi' ? 'ग्रह गोचर सूचना' : 'Transit Alert'}
              </h3>
            </div>
            <p className={styles.alertText}>
              {language === 'hi'
                ? 'राहु गोचर 12 दिन में — सुरक्षात्मक उपाय उपलब्ध हैं'
                : 'Rahu transit in 12 days — protective remedies available'}
            </p>
          </div>

          {/* Recent Chats */}
          <div className={styles.recentSection}>
            <h3 className={styles.sectionTitle}>
              {language === 'hi' ? 'हाल की बातचीत' : 'Recent conversations'}
            </h3>
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {language === 'hi' ? 'कोई हालिया बातचीत नहीं' : 'No recent chats'}
              </p>
            </div>
          </div>

          {/* Two CTAs */}
          <div className={styles.ctaRow}>
            <button className={styles.ctaSecondary}>
              {language === 'hi' ? 'पिछली बातचीत जारी रखें' : 'Continue last chat'}
            </button>
            <button className={styles.ctaPrimary}>
              {language === 'hi' ? 'नई समस्या' : 'New Problem'}
            </button>
          </div>
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
