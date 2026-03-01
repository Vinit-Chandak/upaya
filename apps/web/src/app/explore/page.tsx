'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

type ExploreTab = 'temples' | 'pujas' | 'store' | 'pandits';

interface TemplePujaCard {
  id: string;
  pujaName: string;
  pujaNameEn: string;
  templeName: string;
  templeNameEn: string;
  city: string;
  price: number;
  iconName: string;
  rating: number;
}

interface StoreProduct {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  iconName: string;
  tag: string;
  tagEn: string;
}

interface StoreCategory {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
}

interface PanditCard {
  id: string;
  name: string;
  nameEn: string;
  specialization: string;
  specializationEn: string;
  experience: number;
  rating: number;
  languages: string;
  languagesEn: string;
  price: number;
  iconName: string;
}

interface ArticleCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  iconName: string;
  tag: string;
  tagEn: string;
}

interface CategoryCard {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  count: number;
}

const FEATURED_PUJAS: TemplePujaCard[] = [
  {
    id: 'tp1',
    pujaName: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E',
    pujaNameEn: 'Mangal Dosha Nivaran Puja',
    templeName: '\u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930',
    templeNameEn: 'Mangalnath Temple',
    city: 'Ujjain',
    price: 2100,
    iconName: 'diya',
    rating: 4.8,
  },
  {
    id: 'tp2',
    pujaName: '\u0928\u0935\u0917\u094D\u0930\u0939 \u0936\u093E\u0902\u0924\u093F \u092A\u0942\u091C\u093E',
    pujaNameEn: 'Navagraha Shanti Puja',
    templeName: '\u0915\u093E\u0932 \u092D\u0948\u0930\u0935 \u092E\u0902\u0926\u093F\u0930',
    templeNameEn: 'Kal Bhairav Temple',
    city: 'Ujjain',
    price: 1800,
    iconName: 'temple-silhouette',
    rating: 4.7,
  },
  {
    id: 'tp3',
    pujaName: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E',
    pujaNameEn: 'Shani Dosha Nivaran Puja',
    templeName: '\u0936\u0928\u093F \u092E\u0902\u0926\u093F\u0930',
    templeNameEn: 'Shani Temple',
    city: 'Shingnapur',
    price: 1500,
    iconName: 'sparkles',
    rating: 4.6,
  },
];

const FEATURED_ARTICLES: ArticleCard[] = [
  {
    id: 'a1',
    title: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0915\u094D\u092F\u093E \u0939\u0948? \u091C\u093E\u0928\u093F\u090F \u0914\u0930 \u0909\u092A\u093E\u092F',
    titleEn: 'What is Mangal Dosha? Learn about remedies',
    description: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0936\u093E\u0926\u0940 \u092E\u0947\u0902 \u0926\u0947\u0930\u0940 \u0915\u093E \u0938\u092C\u0938\u0947 \u0906\u092E \u0915\u093E\u0930\u0923 \u092E\u093E\u0928\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964',
    descriptionEn: 'Mangal Dosha is considered the most common cause of marriage delay.',
    iconName: 'gemstone',
    tag: '\u0936\u093E\u0926\u0940',
    tagEn: 'Marriage',
  },
  {
    id: 'a2',
    title: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0938\u0947 \u0915\u0948\u0938\u0947 \u0928\u093F\u092A\u091F\u0947\u0902?',
    titleEn: 'How to deal with Shani Dosha?',
    description: '\u0936\u0928\u093F \u0915\u0940 \u0938\u093E\u0922\u093C\u0947\u0938\u093E\u0924\u0940, \u0927\u0948\u092F\u094D\u092F\u093E, \u092E\u0902\u0924\u094D\u0930 \u0914\u0930 \u0935\u094D\u0930\u0924 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093E\u0928\u0947\u0902\u0964',
    descriptionEn: 'Learn about Shani Sade Sati, patience, mantras and fasting remedies.',
    iconName: 'gemstone',
    tag: '\u0915\u0930\u093F\u092F\u0930',
    tagEn: 'Career',
  },
  {
    id: 'a3',
    title: '\u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E \u0915\u0947 \u092B\u093E\u092F\u0926\u0947',
    titleEn: 'Benefits of Hanuman Chalisa',
    description: '\u0930\u094B\u091C\u093C \u0939\u0928\u0941\u092E\u093E\u0928 \u091A\u093E\u0932\u0940\u0938\u093E \u092A\u0922\u093C\u0928\u0947 \u0938\u0947 \u0915\u094C\u0928-\u0915\u094C\u0928 \u0938\u0947 \u0926\u094B\u0937 \u0926\u0942\u0930 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964',
    descriptionEn: 'Which doshas are remedied by daily Hanuman Chalisa recitation.',
    iconName: 'mala',
    tag: 'Daily Practice',
    tagEn: 'Daily Practice',
  },
  {
    id: 'a4',
    title: '\u0928\u0935\u0917\u094D\u0930\u0939 \u092A\u0942\u091C\u093E \u0915\u092C \u0915\u0930\u0935\u093E\u090F\u0902?',
    titleEn: 'When should you do Navagraha Puja?',
    description: '\u0928\u0935\u0917\u094D\u0930\u0939 \u092A\u0942\u091C\u093E planetary balance \u0915\u0947 \u0932\u093F\u090F \u0938\u092C\u0938\u0947 powerful remedies \u092E\u0947\u0902 \u0938\u0947 \u090F\u0915 \u0939\u0948\u0964',
    descriptionEn: 'Navagraha Puja is one of the most powerful remedies for planetary balance.',
    iconName: 'temple-silhouette',
    tag: '\u092A\u0942\u091C\u093E',
    tagEn: 'Puja',
  },
];

const CATEGORIES: CategoryCard[] = [
  { id: 'c1', name: '\u0926\u094B\u0937 \u0914\u0930 Remedies', nameEn: 'Doshas & Remedies', iconName: 'sparkles', count: 12 },
  { id: 'c2', name: '\u092E\u0902\u0924\u094D\u0930 \u0914\u0930 \u091C\u092A', nameEn: 'Mantras & Chanting', iconName: 'mala', count: 8 },
  { id: 'c3', name: '\u092E\u0902\u0926\u093F\u0930 \u0914\u0930 \u0924\u0940\u0930\u094D\u0925', nameEn: 'Temples & Pilgrimage', iconName: 'temple-silhouette', count: 15 },
  { id: 'c4', name: '\u0930\u0924\u094D\u0928 \u0914\u0930 \u092F\u0902\u0924\u094D\u0930', nameEn: 'Gemstones & Yantras', iconName: 'gemstone', count: 6 },
  { id: 'c5', name: '\u0935\u094D\u0930\u0924 \u0914\u0930 \u0926\u093E\u0928', nameEn: 'Fasting & Charity', iconName: 'diya', count: 9 },
  { id: 'c6', name: '\u0926\u0936\u093E \u0914\u0930 Transit', nameEn: 'Dasha & Transit', iconName: 'star-rating', count: 7 },
];

const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'sp1',
    name: '\u0928\u0940\u0932\u092E \u0930\u0924\u094D\u0928 (Blue Sapphire)',
    nameEn: 'Blue Sapphire (Neelam)',
    description: '\u0936\u0928\u093F \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F certified \u0928\u0940\u0932\u092E',
    descriptionEn: 'Certified Neelam for Shani dosha remedy',
    price: 4500,
    originalPrice: 6000,
    iconName: 'gemstone',
    tag: 'Recommended',
    tagEn: 'Recommended',
  },
  {
    id: 'sp2',
    name: '5 \u092E\u0941\u0916\u0940 \u0930\u0941\u0926\u094D\u0930\u093E\u0915\u094D\u0937',
    nameEn: '5 Mukhi Rudraksha',
    description: '\u0938\u092E\u0938\u094D\u0924 \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0947 \u0936\u093E\u0902\u0924\u093F \u0915\u0947 \u0932\u093F\u090F original Rudraksha',
    descriptionEn: 'Original Rudraksha for peace of all planets',
    price: 1200,
    originalPrice: 1800,
    iconName: 'mala',
    tag: 'Bestseller',
    tagEn: 'Bestseller',
  },
  {
    id: 'sp3',
    name: '\u0936\u094D\u0930\u0940 \u092F\u0902\u0924\u094D\u0930',
    nameEn: 'Shree Yantra',
    description: '\u0927\u0928 \u0914\u0930 \u0938\u092E\u0943\u0926\u094D\u0927\u093F \u0915\u0947 \u0932\u093F\u090F energized Shree Yantra',
    descriptionEn: 'Energized Shree Yantra for wealth and prosperity',
    price: 2500,
    originalPrice: 3500,
    iconName: 'sparkles',
    tag: 'Popular',
    tagEn: 'Popular',
  },
  {
    id: 'sp4',
    name: '\u092E\u0902\u0917\u0932 Remedy Kit',
    nameEn: 'Mangal Remedy Kit',
    description: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0915\u0947 \u0932\u093F\u090F complete remedy kit',
    descriptionEn: 'Complete kit for Mangal dosha remedy',
    price: 999,
    originalPrice: 1499,
    iconName: 'diya',
    tag: 'Kit',
    tagEn: 'Kit',
  },
];

const STORE_CATEGORIES: StoreCategory[] = [
  { id: 'sc1', name: '\u0930\u0924\u094D\u0928 (Gemstones)', nameEn: 'Gemstones', iconName: 'gemstone' },
  { id: 'sc2', name: '\u0930\u0941\u0926\u094D\u0930\u093E\u0915\u094D\u0937', nameEn: 'Rudraksha', iconName: 'mala' },
  { id: 'sc3', name: '\u092F\u0902\u0924\u094D\u0930', nameEn: 'Yantras', iconName: 'sparkles' },
  { id: 'sc4', name: 'Remedy Kits', nameEn: 'Remedy Kits', iconName: 'diya' },
  { id: 'sc5', name: '\u092A\u0942\u091C\u093E Items', nameEn: 'Puja Items', iconName: 'temple-silhouette' },
  { id: 'sc6', name: '\u0926\u093E\u0928 \u0938\u0947\u0935\u093E', nameEn: 'Daan Seva', iconName: 'namaste-hands' },
];

const POPULAR_PRODUCTS: StoreProduct[] = [
  {
    id: 'pp1',
    name: '\u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u0917\u094D\u0930\u0939 \u0936\u093E\u0902\u0924\u093F Kit',
    nameEn: 'Complete Graha Shanti Kit',
    description: '9 \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0940 \u0936\u093E\u0902\u0924\u093F \u0915\u0947 \u0932\u093F\u090F \u0938\u092D\u0940 \u091C\u0930\u0942\u0930\u0940 \u0938\u093E\u092E\u0917\u094D\u0930\u0940',
    descriptionEn: 'All essential items for peace of 9 planets',
    price: 3999,
    originalPrice: 5999,
    iconName: 'star-rating',
    tag: 'Top Rated',
    tagEn: 'Top Rated',
  },
  {
    id: 'pp2',
    name: 'Coral (\u092E\u0942\u0901\u0917\u093E) Ring',
    nameEn: 'Red Coral (Moonga) Ring',
    description: '\u092E\u0902\u0917\u0932 \u0917\u094D\u0930\u0939 \u0915\u094B \u092E\u091C\u092C\u0942\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F certified \u092E\u0942\u0901\u0917\u093E',
    descriptionEn: 'Certified Moonga to strengthen Mars in your chart',
    price: 3500,
    originalPrice: 4500,
    iconName: 'gemstone',
    tag: 'Trending',
    tagEn: 'Trending',
  },
];

const MOCK_PANDITS: PanditCard[] = [
  {
    id: 'p1',
    name: '\u092A\u0902\u0921\u093F\u0924 \u0930\u093E\u092E\u0915\u0943\u0937\u094D\u0923 \u0936\u0930\u094D\u092E\u093E',
    nameEn: 'Pandit Ramkrishna Sharma',
    specialization: '\u0935\u0948\u0926\u093F\u0915 \u0915\u0930\u094D\u092E\u0915\u093E\u0902\u0921 \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E',
    specializationEn: 'Vedic Karmakand Specialist',
    experience: 25,
    rating: 4.9,
    languages: '\u0939\u093F\u0902\u0926\u0940, \u0938\u0902\u0938\u094D\u0915\u0943\u0924, English',
    languagesEn: 'Hindi, Sanskrit, English',
    price: 1100,
    iconName: 'user-profile',
  },
  {
    id: 'p2',
    name: '\u0906\u091A\u093E\u0930\u094D\u092F \u0935\u093F\u0928\u092F \u0924\u094D\u0930\u093F\u092A\u093E\u0920\u0940',
    nameEn: 'Acharya Vinay Tripathi',
    specialization: '\u091C\u094D\u092F\u094B\u0924\u093F\u0937 \u0914\u0930 \u0935\u093E\u0938\u094D\u0924\u0941',
    specializationEn: 'Jyotish & Vastu',
    experience: 18,
    rating: 4.7,
    languages: '\u0939\u093F\u0902\u0926\u0940, English',
    languagesEn: 'Hindi, English',
    price: 800,
    iconName: 'user-profile',
  },
  {
    id: 'p3',
    name: '\u092A\u0902\u0921\u093F\u0924 \u0938\u0941\u0930\u0947\u0936 \u0926\u0940\u0915\u094D\u0937\u093F\u0924',
    nameEn: 'Pandit Suresh Dikshit',
    specialization: '\u0928\u0935\u0917\u094D\u0930\u0939 \u092A\u0942\u091C\u093E \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E',
    specializationEn: 'Navagraha Puja Expert',
    experience: 15,
    rating: 4.8,
    languages: '\u0939\u093F\u0902\u0926\u0940, \u092E\u0930\u093E\u0920\u0940',
    languagesEn: 'Hindi, Marathi',
    price: 900,
    iconName: 'user-profile',
  },
];

const TABS: { key: ExploreTab; label: string; labelHi: string }[] = [
  { key: 'temples', label: 'Temples', labelHi: 'मंदिर' },
  { key: 'pujas', label: 'Pujas', labelHi: 'पूजा' },
  { key: 'store', label: 'Store', labelHi: 'दुकान' },
  { key: 'pandits', label: 'Pandits', labelHi: 'पंडित' },
];

export default function ExplorePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<ExploreTab>('temples');

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
      <TopBar title={language === 'hi' ? 'खोजें' : 'Explore'} onLanguageToggle={toggleLanguage} language={language} />

      {/* Horizontal Tab Bar */}
      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {language === 'hi' ? tab.labelHi : tab.label}
            </button>
          ))}
        </div>
      </div>

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
              placeholder={language === 'hi' ? 'उपाय, मंदिर, मंत्र खोजें...' : 'Search remedies, temples, mantras...'}
              readOnly
            />
          </div>

          {/* =========== TEMPLES TAB =========== */}
          {activeTab === 'temples' && (
            <>
              {/* Book a Puja */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="diya" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? '\u092A\u0942\u091C\u093E Book \u0915\u0930\u0947\u0902' : 'Book a Puja'}
                </h2>
                <div className={styles.pujaScroll}>
                  {FEATURED_PUJAS.map((puja) => (
                    <div
                      key={puja.id}
                      className={styles.pujaCard}
                      onClick={() => router.push('/puja')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.pujaCardTop}>
                        <Icon name={puja.iconName} size={24} color="var(--color-accent-gold)" />
                        <span className={styles.pujaRating}>{puja.rating}</span>
                      </div>
                      <h3 className={styles.pujaCardName}>
                        {language === 'hi' ? puja.pujaName : puja.pujaNameEn}
                      </h3>
                      <span className={styles.pujaCardTemple}>
                        {language === 'hi' ? puja.templeName : puja.templeNameEn} · {puja.city}
                      </span>
                      <span className={styles.pujaCardPrice}>
                        ₹{puja.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending Articles */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="fire" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? 'चर्चित लेख' : 'Trending Articles'}
                </h2>
                <div className={styles.articleScroll}>
                  {FEATURED_ARTICLES.map((article) => (
                    <div key={article.id} className={styles.articleCard}>
                      <div className={styles.articleCardTop}>
                        <Icon name={article.iconName} size={20} color="var(--color-accent-gold)" />
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
                  <Icon name="book-open" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
                </h2>
                <div className={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <div key={cat.id} className={styles.categoryCard}>
                      <Icon name={cat.iconName} size={20} color="var(--color-accent-gold)" />
                      <span className={styles.categoryName}>
                        {language === 'hi' ? cat.name : cat.nameEn}
                      </span>
                      <span className={styles.categoryCount}>
                        {cat.count} {language === 'hi' ? 'लेख' : 'articles'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="sparkles" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'}
                </h2>
                <div className={styles.quickActions}>
                  <button className={styles.quickAction} onClick={() => router.push('/chat?problem=get_kundli')}>
                    <span className={styles.quickActionIcon}><Icon name="book-open" size={20} color="var(--color-accent-gold)" /></span>
                    <span className={styles.quickActionText}>
                      {language === 'hi' ? 'Free \u0915\u0941\u0902\u0921\u0932\u0940 \u092C\u0928\u0935\u093E\u090F\u0902' : 'Free Kundli Analysis'}
                    </span>
                  </button>
                  <button className={styles.quickAction} onClick={() => router.push('/home')}>
                    <span className={styles.quickActionIcon}><Icon name="chat-bubble" size={20} color="var(--color-accent-gold)" /></span>
                    <span className={styles.quickActionText}>
                      {language === 'hi' ? 'AI \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0947\u0902' : 'Talk to AI'}
                    </span>
                  </button>
                  <button className={styles.quickAction} onClick={() => router.push('/seva')}>
                    <span className={styles.quickActionIcon}><Icon name="namaste-hands" size={20} color="var(--color-accent-gold)" /></span>
                    <span className={styles.quickActionText}>
                      {language === 'hi' ? '\u0926\u093E\u0928 \u0938\u0947\u0935\u093E' : 'Daan Seva'}
                    </span>
                  </button>
                  <button className={styles.quickAction} onClick={() => router.push('/muhurta')}>
                    <span className={styles.quickActionIcon}><Icon name="calendar" size={20} color="var(--color-accent-gold)" /></span>
                    <span className={styles.quickActionText}>
                      {language === 'hi' ? '\u0936\u0941\u092D \u092E\u0941\u0939\u0942\u0930\u094D\u0924' : 'Muhurta Planner'}
                    </span>
                  </button>
                  <button className={styles.quickAction} onClick={() => router.push('/subscriptions')}>
                    <span className={styles.quickActionIcon}><Icon name="star-rating" size={20} color="var(--color-accent-gold)" /></span>
                    <span className={styles.quickActionText}>
                      {language === 'hi' ? '\u0938\u092C\u094D\u0938\u0915\u094D\u0930\u093F\u092A\u094D\u0936\u0928' : 'Subscriptions'}
                    </span>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* =========== PUJAS TAB =========== */}
          {activeTab === 'pujas' && (
            <>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="diya" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? 'Featured \u092A\u0942\u091C\u093E\u090F\u0902' : 'Featured Pujas'}
                </h2>
                <div className={styles.pujaGrid}>
                  {FEATURED_PUJAS.map((puja) => (
                    <div
                      key={puja.id}
                      className={styles.pujaGridCard}
                      onClick={() => router.push('/puja')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.pujaCardTop}>
                        <Icon name={puja.iconName} size={24} color="var(--color-accent-gold)" />
                        <span className={styles.pujaRating}>{puja.rating}</span>
                      </div>
                      <h3 className={styles.pujaCardName}>
                        {language === 'hi' ? puja.pujaName : puja.pujaNameEn}
                      </h3>
                      <span className={styles.pujaCardTemple}>
                        {language === 'hi' ? puja.templeName : puja.templeNameEn} · {puja.city}
                      </span>
                      <span className={styles.pujaCardPrice}>
                        ₹{puja.price.toLocaleString('en-IN')}
                      </span>
                      <button className={styles.bookPujaButton}>
                        {language === 'hi' ? 'Book \u0915\u0930\u0947\u0902' : 'Book Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Puja Categories */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="temple-silhouette" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? '\u092A\u0942\u091C\u093E Categories' : 'Puja Categories'}
                </h2>
                <div className={styles.categoryGrid}>
                  {[
                    { id: 'pc1', name: '\u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923', nameEn: 'Dosha Nivaran', iconName: 'sparkles', count: 8 },
                    { id: 'pc2', name: '\u0917\u094D\u0930\u0939 \u0936\u093E\u0902\u0924\u093F', nameEn: 'Graha Shanti', iconName: 'star-rating', count: 9 },
                    { id: 'pc3', name: '\u0936\u093E\u0926\u0940 \u092A\u0942\u091C\u093E', nameEn: 'Marriage Puja', iconName: 'marriage', count: 5 },
                    { id: 'pc4', name: '\u0915\u0930\u093F\u092F\u0930 \u092A\u0942\u091C\u093E', nameEn: 'Career Puja', iconName: 'briefcase', count: 6 },
                    { id: 'pc5', name: '\u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u092A\u0942\u091C\u093E', nameEn: 'Health Puja', iconName: 'heart-pulse', count: 4 },
                    { id: 'pc6', name: '\u0927\u0928 \u092A\u094D\u0930\u093E\u092A\u094D\u0924\u093F', nameEn: 'Wealth Puja', iconName: 'coin-stack', count: 7 },
                  ].map((cat) => (
                    <div key={cat.id} className={styles.categoryCard}>
                      <Icon name={cat.iconName} size={20} color="var(--color-accent-gold)" />
                      <span className={styles.categoryName}>
                        {language === 'hi' ? cat.name : cat.nameEn}
                      </span>
                      <span className={styles.categoryCount}>{cat.count} pujas</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* =========== STORE TAB =========== */}
          {activeTab === 'store' && (
            <>
              {/* Recommended for Your Chart */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    <Icon name="sparkles" size={20} color="var(--color-accent-gold)" />{' '}
                    {language === 'hi' ? '\u0906\u092A\u0915\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u0915\u0947 \u0932\u093F\u090F Recommended' : 'Recommended for Your Chart'}
                  </h2>
                </div>
                <div className={styles.productScroll}>
                  {STORE_PRODUCTS.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productCardTop}>
                        <Icon name={product.iconName} size={24} color="var(--color-accent-gold)" />
                        <span className={styles.productTag}>
                          {language === 'hi' ? product.tag : product.tagEn}
                        </span>
                      </div>
                      <h3 className={styles.productName}>
                        {language === 'hi' ? product.name : product.nameEn}
                      </h3>
                      <p className={styles.productDesc}>
                        {language === 'hi' ? product.description : product.descriptionEn}
                      </p>
                      <div className={styles.productPriceRow}>
                        <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                        <span className={styles.productOriginalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Category Chips */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="cart" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
                </h2>
                <div className={styles.storeCategoryChips}>
                  {STORE_CATEGORIES.map((cat) => (
                    <button key={cat.id} className={styles.storeCategoryChip} onClick={() => router.push('/store')}>
                      <Icon name={cat.iconName} size={20} color="var(--color-accent-gold)" />
                      <span className={styles.storeCategoryLabel}>
                        {language === 'hi' ? cat.name : cat.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Popular This Week */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="fire" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? '\u0907\u0938 \u0939\u092B\u094D\u0924\u0947 Popular' : 'Popular This Week'}
                </h2>
                <div className={styles.popularProducts}>
                  {POPULAR_PRODUCTS.map((product) => (
                    <div key={product.id} className={styles.popularCard}>
                      <div className={styles.popularCardLeft}>
                        <Icon name={product.iconName} size={28} color="var(--color-accent-gold)" />
                      </div>
                      <div className={styles.popularCardRight}>
                        <span className={styles.popularTag}>
                          {language === 'hi' ? product.tag : product.tagEn}
                        </span>
                        <h3 className={styles.popularName}>
                          {language === 'hi' ? product.name : product.nameEn}
                        </h3>
                        <p className={styles.popularDesc}>
                          {language === 'hi' ? product.description : product.descriptionEn}
                        </p>
                        <div className={styles.productPriceRow}>
                          <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                          <span className={styles.productOriginalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* View Full Store CTA */}
              <button className={styles.viewStoreButton} onClick={() => router.push('/store')}>
                {language === 'hi' ? 'Siddha Store \u0926\u0947\u0916\u0947\u0902 \u2192' : 'View Full Store \u2192'}
              </button>
            </>
          )}

          {/* =========== PANDITS TAB =========== */}
          {activeTab === 'pandits' && (
            <>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Icon name="user-profile" size={20} color="var(--color-accent-gold)" />{' '}
                  {language === 'hi' ? '\u0935\u0947\u0930\u093F\u092B\u093E\u0907\u0921 \u092A\u0902\u0921\u093F\u0924' : 'Verified Pandits'}
                </h2>
                <div className={styles.panditList}>
                  {MOCK_PANDITS.map((pandit) => (
                    <div key={pandit.id} className={styles.panditCard}>
                      <div className={styles.panditCardHeader}>
                        <Icon name={pandit.iconName} size={28} color="var(--color-accent-gold)" />
                        <div className={styles.panditInfo}>
                          <h3 className={styles.panditName}>
                            {language === 'hi' ? pandit.name : pandit.nameEn}
                          </h3>
                          <span className={styles.panditSpecialization}>
                            {language === 'hi' ? pandit.specialization : pandit.specializationEn}
                          </span>
                        </div>
                        <div className={styles.panditRating}>
                          <span className={styles.panditRatingValue}>{pandit.rating}</span>
                        </div>
                      </div>
                      <div className={styles.panditMeta}>
                        <span className={styles.panditMetaItem}>
                          {pandit.experience} {language === 'hi' ? '\u0938\u093E\u0932 \u0905\u0928\u0941\u092D\u0935' : 'yrs exp'}
                        </span>
                        <span className={styles.panditMetaDot}>&middot;</span>
                        <span className={styles.panditMetaItem}>
                          {language === 'hi' ? pandit.languages : pandit.languagesEn}
                        </span>
                      </div>
                      <div className={styles.panditFooter}>
                        <span className={styles.panditPrice}>
                          ₹{pandit.price.toLocaleString('en-IN')}/{language === 'hi' ? '\u092A\u0942\u091C\u093E' : 'puja'}
                        </span>
                        <button className={styles.panditBookButton} onClick={() => router.push('/pandits')}>
                          {language === 'hi' ? 'Book \u0915\u0930\u0947\u0902' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* View All Pandits CTA */}
              <button className={styles.viewStoreButton} onClick={() => router.push('/pandits')}>
                {language === 'hi' ? '\u0938\u092D\u0940 \u092A\u0902\u0921\u093F\u0924 \u0926\u0947\u0916\u0947\u0902 \u2192' : 'View All Pandits \u2192'}
              </button>
            </>
          )}

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
