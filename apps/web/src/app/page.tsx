import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Splash / Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <span className={styles.logoSymbol}>✦</span>
            <h1 className={styles.logoText}>UPAYA</h1>
            <span className={styles.logoSymbol}>✦</span>
          </div>
          <p className={styles.tagline}>आपका spiritual problem solver</p>
          <p className={styles.taglineEn}>Your spiritual problem solver</p>
        </div>
      </section>

      {/* Language Selection */}
      <section className={styles.languageSection}>
        <div className={styles.container}>
          <h2 className={styles.languageTitle}>
            <span className={styles.namaste}>🙏</span> Namaste / Welcome
          </h2>
          <p className={styles.languageSubtitle}>अपनी भाषा चुनें</p>
          <p className={styles.languageSubtitleEn}>Choose your preferred language</p>

          <div className={styles.languageOptions}>
            <button className={styles.languageCard}>
              <span className={styles.languageFlag}>🇮🇳</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>हिन्दी</span>
                <span className={styles.languageSub}>Hindi</span>
              </div>
            </button>

            <button className={styles.languageCard}>
              <span className={styles.languageFlag}>🇬🇧</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>English</span>
                <span className={styles.languageSub}>अंग्रेज़ी</span>
              </div>
            </button>

            <button className={`${styles.languageCard} ${styles.languageCardDisabled}`} disabled>
              <span className={styles.languageFlag}>🔜</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>தமிழ்</span>
                <span className={styles.languageSub}>Coming Soon</span>
              </div>
            </button>

            <button className={`${styles.languageCard} ${styles.languageCardDisabled}`} disabled>
              <span className={styles.languageFlag}>🔜</span>
              <div className={styles.languageInfo}>
                <span className={styles.languageName}>తెలుగు</span>
                <span className={styles.languageSub}>Coming Soon</span>
              </div>
            </button>
          </div>

          <p className={styles.changeAnytime}>
            आप इसे कभी भी Settings में बदल सकते हैं
          </p>
        </div>
      </section>

      {/* Problem Chips Preview */}
      <section className={styles.problemsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionHeading}>आज आपको क्या परेशान कर रहा है?</h2>
          <p className={styles.sectionSubHeading}>Tell me what&apos;s worrying you today</p>

          <div className={styles.chipGrid}>
            {[
              { emoji: '💍', hi: 'शादी में देरी', en: 'Marriage Delay' },
              { emoji: '💼', hi: 'करियर में रुकावट', en: 'Career Stuck' },
              { emoji: '💰', hi: 'पैसे की समस्या', en: 'Money Problems' },
              { emoji: '🏥', hi: 'स्वास्थ्य समस्या', en: 'Health Issues' },
              { emoji: '⚖️', hi: 'कानूनी विवाद', en: 'Legal Matters' },
              { emoji: '👨‍👩‍👧‍👦', hi: 'पारिवारिक कलह', en: 'Family Conflict' },
              { emoji: '📖', hi: 'कुंडली बनवाएं', en: 'Get My Kundli' },
              { emoji: '🔮', hi: 'कुछ और पूछना है', en: 'Something Else' },
            ].map((chip) => (
              <button
                key={chip.en}
                className={`${styles.chip} ${chip.en === 'Get My Kundli' ? styles.chipGold : ''}`}
              >
                <span className={styles.chipEmoji}>{chip.emoji}</span>
                <span className={styles.chipTextHi}>{chip.hi}</span>
                <span className={styles.chipTextEn}>{chip.en}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            {[
              { icon: '📊', label: 'Kundlis analyzed' },
              { icon: '🛕', label: 'Temples verified' },
              { icon: '📹', label: 'Video proof of every puja' },
              { icon: '📦', label: 'Prasad delivered home' },
              { icon: '🔒', label: '100% Private & Secure' },
              { icon: '🙏', label: 'Pandit verified' },
            ].map((badge) => (
              <div key={badge.label} className={styles.trustBadge}>
                <span className={styles.trustIcon}>{badge.icon}</span>
                <span className={styles.trustLabel}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <button className={styles.ctaButton}>
            🙏 शुरू करें / Get Started
          </button>
          <p className={styles.ctaSub}>Free कुंडली analysis · No login required</p>
        </div>
      </section>
    </main>
  );
}
