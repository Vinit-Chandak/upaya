'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PROBLEM_TYPES, getTranslations } from '@upaya/shared';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

function getTimeGreeting(language: 'hi' | 'en'): { emoji: string; text: string } {
  const t = getTranslations(language);
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { emoji: '🌅', text: t.greetings.morning };
  if (hour >= 12 && hour < 17) return { emoji: '☀️', text: t.greetings.afternoon };
  if (hour >= 17 && hour < 21) return { emoji: '🪔', text: t.greetings.evening };
  return { emoji: '🌙', text: t.greetings.night };
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
              <h1 className={styles.mainPrompt}>{getTranslations(language).home.mainPrompt}</h1>
              <p className={styles.mainPromptSub}>{getTranslations(language).home.mainPromptSub}</p>
            </div>

            {/* Problem chips */}
            <div className={styles.chipGrid}>
              {Object.entries(PROBLEM_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  className={styles.chip}
                  onClick={() => handleChipClick(key)}
                >
                  <span className={styles.chipEmoji}>{info.emoji}</span>
                  <span className={styles.chipTextPrimary}>
                    {language === 'hi' ? info.hi : info.en}
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
              placeholder={getTranslations(language).home.inputPlaceholder}
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
          {(() => {
            const t = getTranslations(language);
            return (
              <>
                <div className={styles.welcomeSection}>
                  <h1 className={styles.welcomeText}>
                    {userName
                      ? t.home.greeting.replace('{{name}}', userName)
                      : (language === 'hi' ? 'फिर से स्वागत है 🙏' : 'Welcome back 🙏')}
                  </h1>
                </div>

                {/* Recent Chats */}
                <div className={styles.recentSection}>
                  <h3 className={styles.sectionTitle}>{t.home.returningUser.recent}</h3>
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>{language === 'hi' ? 'कोई हालिया बातचीत नहीं' : 'No recent chats'}</p>
                  </div>
                </div>

                {/* Two CTAs */}
                <div className={styles.ctaRow}>
                  <button className={styles.ctaSecondary}>{t.home.returningUser.continueChat}</button>
                  <button className={styles.ctaPrimary}>{t.home.returningUser.newProblem}</button>
                </div>
              </>
            );
          })()}
        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
