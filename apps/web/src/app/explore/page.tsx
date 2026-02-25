'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface ArticleCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  tag: string;
  tagEn: string;
}

interface CategoryCard {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  count: number;
}

const FEATURED_ARTICLES: ArticleCard[] = [
  {
    id: 'a1',
    title: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0915\u094D\u092F\u093E \u0939\u0948? \u091C\u093E\u0928\u093F\u090F \u0914\u0930 \u0909\u092A\u093E\u092F',
    titleEn: 'What is Mangal Dosha? Learn about remedies',
    description: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0936\u093E\u0926\u0940 \u092E\u0947\u0902 \u0926\u0947\u0930\u0940 \u0915\u093E \u0938\u092C\u0938\u0947 \u0906\u092E \u0915\u093E\u0930\u0923 \u092E\u093E\u0928\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964 \u091C\u093E\u0928\u093F\u090F \u0915\u0948\u0938\u0947 \u092A\u0939\u091A\u093E\u0928\u0947\u0902 \u0914\u0930 \u0915\u094D\u092F\u093E remedy \u0915\u0930\u0947\u0902\u0964',
    descriptionEn: 'Mangal Dosha is considered the most common cause of marriage delay. Learn how to identify it and what remedies work.',
    emoji: '\uD83D\uDD34',
    tag: '\u0936\u093E\u0926\u0940',
    tagEn: 'Marriage',
  },
  {
    id: 'a2',
    title: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0938\u0947 \u0915\u0948\u0938\u0947 \u0928\u093F\u092A\u091F\u0947\u0902?',
    titleEn: 'How to deal with Shani Dosha?',
    description: '\u0936\u0928\u093F \u0915\u0940 \u0938\u093E\u0922\u093C\u0947\u0938\u093E\u0924\u0940, \u0927\u0948\u092F\u094D\u092F\u093E, \u092E\u0902\u0924\u094D\u0930 \u0914\u0930 \u0935\u094D\u0930\u0924 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093E\u0928\u0947\u0902\u0964',
    descriptionEn: 'Learn about Shani Sade Sati, patience, mantras and fasting remedies for Saturn afflictions.',
    emoji: '\uD83D\uDFE3',
    tag: '\u0915\u0930\u093F\u092F\u0930',
    tagEn: 'Career',
  },
  {
    id: 'a3',
    title: '\u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E \u0915\u0947 \u092B\u093E\u092F\u0926\u0947',
    titleEn: 'Benefits of Hanuman Chalisa',
    description: '\u0930\u094B\u091C\u093C \u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E \u092A\u0922\u093C\u0928\u0947 \u0938\u0947 \u0915\u094C\u0928-\u0915\u094C\u0928 \u0938\u0947 \u0926\u094B\u0937 \u0926\u0942\u0930 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964',
    descriptionEn: 'Which doshas are remedied by daily Hanuman Chalisa recitation.',
    emoji: '\uD83D\uDCFF',
    tag: 'Daily Practice',
    tagEn: 'Daily Practice',
  },
  {
    id: 'a4',
    title: '\u0928\u0935\u0917\u094D\u0930\u0939 \u092A\u0942\u091C\u093E \u0915\u092C \u0915\u0930\u0935\u093E\u090F\u0902?',
    titleEn: 'When should you do Navagraha Puja?',
    description: '\u0928\u0935\u0917\u094D\u0930\u0939 \u092A\u0942\u091C\u093E planetary balance \u0915\u0947 \u0932\u093F\u090F \u0938\u092C\u0938\u0947 powerful remedies \u092E\u0947\u0902 \u0938\u0947 \u090F\u0915 \u0939\u0948\u0964',
    descriptionEn: 'Navagraha Puja is one of the most powerful remedies for overall planetary balance.',
    emoji: '\uD83D\uDED5',
    tag: '\u092A\u0942\u091C\u093E',
    tagEn: 'Puja',
  },
];

const CATEGORIES: CategoryCard[] = [
  { id: 'c1', name: '\u0926\u094B\u0937 \u0914\u0930 Remedies', nameEn: 'Doshas & Remedies', emoji: '\uD83D\uDD2E', count: 12 },
  { id: 'c2', name: '\u092E\u0902\u0924\u094D\u0930 \u0914\u0930 \u091C\u092A', nameEn: 'Mantras & Chanting', emoji: '\uD83D\uDCFF', count: 8 },
  { id: 'c3', name: '\u092E\u0902\u0926\u093F\u0930 \u0914\u0930 \u0924\u0940\u0930\u094D\u0925', nameEn: 'Temples & Pilgrimage', emoji: '\uD83D\uDED5', count: 15 },
  { id: 'c4', name: '\u0930\u0924\u094D\u0928 \u0914\u0930 \u092F\u0902\u0924\u094D\u0930', nameEn: 'Gemstones & Yantras', emoji: '\uD83D\uDC8E', count: 6 },
  { id: 'c5', name: '\u0935\u094D\u0930\u0924 \u0914\u0930 \u0926\u093E\u0928', nameEn: 'Fasting & Charity', emoji: '\uD83C\uDF7D\uFE0F', count: 9 },
  { id: 'c6', name: '\u0926\u0936\u093E \u0914\u0930 Transit', nameEn: 'Dasha & Transit', emoji: '\u2B50', count: 7 },
];

export default function ExplorePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  return (
    <div className={styles.appLayout}>
      <TopBar title={language === 'hi' ? 'Explore' : 'Explore'} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Search bar */}
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={language === 'hi' ? 'Search remedies, temples, mantras...' : 'Search remedies, temples, mantras...'}
              readOnly
            />
          </div>

          {/* Featured / Trending */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? '\uD83D\uDD25 Trending Articles' : '\uD83D\uDD25 Trending Articles'}
            </h2>

            <div className={styles.articleScroll}>
              {FEATURED_ARTICLES.map((article) => (
                <div key={article.id} className={styles.articleCard}>
                  <div className={styles.articleCardTop}>
                    <span className={styles.articleEmoji}>{article.emoji}</span>
                    <span className={styles.articleTag}>
                      {language === 'hi' ? article.tag : article.tagEn}
                    </span>
                  </div>
                  <h3 className={styles.articleTitle}>
                    {language === 'hi' ? article.title : article.titleEn}
                  </h3>
                  <p className={styles.articleDesc}>
                    {language === 'hi' ? article.description : article.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? '\uD83D\uDCDA Categories' : '\uD83D\uDCDA Categories'}
            </h2>

            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className={styles.categoryCard}>
                  <span className={styles.categoryEmoji}>{cat.emoji}</span>
                  <span className={styles.categoryName}>
                    {language === 'hi' ? cat.name : cat.nameEn}
                  </span>
                  <span className={styles.categoryCount}>
                    {cat.count} {language === 'hi' ? 'articles' : 'articles'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? '\u26A1 Quick Actions' : '\u26A1 Quick Actions'}
            </h2>

            <div className={styles.quickActions}>
              <button className={styles.quickAction} onClick={() => router.push('/chat?problem=get_kundli')}>
                <span className={styles.quickActionIcon}>{'\uD83D\uDCD6'}</span>
                <span className={styles.quickActionText}>
                  {language === 'hi' ? 'Free \u0915\u0941\u0902\u0921\u0932\u0940 \u092C\u0928\u0935\u093E\u090F\u0902' : 'Free Kundli Analysis'}
                </span>
              </button>
              <button className={styles.quickAction} onClick={() => router.push('/home')}>
                <span className={styles.quickActionIcon}>{'\uD83D\uDCAC'}</span>
                <span className={styles.quickActionText}>
                  {language === 'hi' ? 'AI \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0947\u0902' : 'Talk to AI'}
                </span>
              </button>
            </div>
          </section>

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
