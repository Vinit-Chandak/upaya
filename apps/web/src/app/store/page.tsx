'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

/* ============================================
   Types
   ============================================ */
interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviewCount: number;
  aiPick: boolean;
  iconName: string;
  tag?: string;
  tagEn?: string;
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  count: number;
}

/* ============================================
   Mock Data
   ============================================ */
const STORE_TABS = [
  { key: 'temples', href: '/puja', hi: 'Temples', en: 'Temples' },
  { key: 'pujas', href: '/booking', hi: 'Pujas', en: 'Pujas' },
  { key: 'store', href: '/store', hi: 'Store', en: 'Store' },
  { key: 'pandits', href: '/pandits', hi: 'Pandits', en: 'Pandits' },
];

const CATEGORIES: Category[] = [
  { id: 'gemstones', name: 'रत्न', nameEn: 'Gemstones', iconName: 'gemstone', count: 24 },
  { id: 'rudraksha', name: 'रुद्राक्ष', nameEn: 'Rudraksha', iconName: 'mala', count: 18 },
  { id: 'yantras', name: 'यन्त्र', nameEn: 'Yantras', iconName: 'trident', count: 12 },
  { id: 'remedy-kits', name: 'Remedy Kits', nameEn: 'Remedy Kits', iconName: 'prasad-box', count: 9 },
  { id: 'puja-items', name: 'पूजा सामग्री', nameEn: 'Puja Items', iconName: 'diya', count: 31 },
  { id: 'daan-seva', name: 'दान सेवा', nameEn: 'Daan Seva', iconName: 'gift', count: 7 },
];

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'नीलम (Blue Sapphire)',
    nameEn: 'Blue Sapphire (Neelam)',
    category: 'gemstones',
    price: 4999,
    mrp: 7999,
    discount: 38,
    rating: 4.8,
    reviewCount: 234,
    aiPick: true,
    iconName: 'gemstone',
    tag: 'शनि दोष',
    tagEn: 'Shani Dosha',
  },
  {
    id: 'p2',
    name: 'पुखराज (Yellow Sapphire)',
    nameEn: 'Yellow Sapphire (Pukhraj)',
    category: 'gemstones',
    price: 5499,
    mrp: 8999,
    discount: 39,
    rating: 4.9,
    reviewCount: 189,
    aiPick: true,
    iconName: 'gemstone',
    tag: 'गुरु दोष',
    tagEn: 'Guru Dosha',
  },
  {
    id: 'p3',
    name: 'मूंगा (Red Coral)',
    nameEn: 'Red Coral (Moonga)',
    category: 'gemstones',
    price: 2999,
    mrp: 4999,
    discount: 40,
    rating: 4.7,
    reviewCount: 312,
    aiPick: false,
    iconName: 'gemstone',
    tag: 'मंगल दोष',
    tagEn: 'Mangal Dosha',
  },
  {
    id: 'p4',
    name: 'गोमेद (Hessonite)',
    nameEn: 'Hessonite (Gomed)',
    category: 'gemstones',
    price: 3499,
    mrp: 5999,
    discount: 42,
    rating: 4.6,
    reviewCount: 98,
    aiPick: false,
    iconName: 'gemstone',
  },
  {
    id: 'p5',
    name: '5 मुखी रुद्राक्ष',
    nameEn: '5 Mukhi Rudraksha',
    category: 'rudraksha',
    price: 999,
    mrp: 1999,
    discount: 50,
    rating: 4.9,
    reviewCount: 567,
    aiPick: true,
    iconName: 'mala',
    tag: 'सर्व दोष',
    tagEn: 'All Doshas',
  },
  {
    id: 'p6',
    name: '7 मुखी रुद्राक्ष',
    nameEn: '7 Mukhi Rudraksha',
    category: 'rudraksha',
    price: 2499,
    mrp: 3999,
    discount: 38,
    rating: 4.8,
    reviewCount: 203,
    aiPick: false,
    iconName: 'mala',
    tag: 'शनि दोष',
    tagEn: 'Shani Dosha',
  },
  {
    id: 'p7',
    name: '1 मुखी रुद्राक्ष',
    nameEn: '1 Mukhi Rudraksha',
    category: 'rudraksha',
    price: 11999,
    mrp: 18999,
    discount: 37,
    rating: 5.0,
    reviewCount: 45,
    aiPick: true,
    iconName: 'mala',
    tag: 'सूर्य दोष',
    tagEn: 'Surya Dosha',
  },
  {
    id: 'p8',
    name: '4 मुखी रुद्राक्ष',
    nameEn: '4 Mukhi Rudraksha',
    category: 'rudraksha',
    price: 1499,
    mrp: 2499,
    discount: 40,
    rating: 4.7,
    reviewCount: 156,
    aiPick: false,
    iconName: 'mala',
  },
  {
    id: 'p9',
    name: 'श्री यन्त्र',
    nameEn: 'Shree Yantra',
    category: 'yantras',
    price: 1999,
    mrp: 3499,
    discount: 43,
    rating: 4.8,
    reviewCount: 421,
    aiPick: true,
    iconName: 'trident',
    tag: 'धन प्राप्ति',
    tagEn: 'Wealth',
  },
  {
    id: 'p10',
    name: 'नवग्रह यन्त्र',
    nameEn: 'Navagraha Yantra',
    category: 'yantras',
    price: 2499,
    mrp: 4499,
    discount: 44,
    rating: 4.7,
    reviewCount: 178,
    aiPick: false,
    iconName: 'trident',
    tag: 'ग्रह शांति',
    tagEn: 'Planet Peace',
  },
  {
    id: 'p11',
    name: 'हनुमान यन्त्र',
    nameEn: 'Hanuman Yantra',
    category: 'yantras',
    price: 1499,
    mrp: 2999,
    discount: 50,
    rating: 4.9,
    reviewCount: 289,
    aiPick: false,
    iconName: 'trident',
  },
  {
    id: 'p12',
    name: 'मंगल दोष निवारण Kit',
    nameEn: 'Mangal Dosha Nivaran Kit',
    category: 'remedy-kits',
    price: 1299,
    mrp: 2199,
    discount: 41,
    rating: 4.6,
    reviewCount: 134,
    aiPick: true,
    iconName: 'prasad-box',
    tag: 'मंगल दोष',
    tagEn: 'Mangal Dosha',
  },
  {
    id: 'p13',
    name: 'शनि शांति Kit',
    nameEn: 'Shani Shanti Kit',
    category: 'remedy-kits',
    price: 1499,
    mrp: 2499,
    discount: 40,
    rating: 4.7,
    reviewCount: 98,
    aiPick: false,
    iconName: 'prasad-box',
    tag: 'शनि दोष',
    tagEn: 'Shani Dosha',
  },
  {
    id: 'p14',
    name: 'राहु-केतु शांति Kit',
    nameEn: 'Rahu-Ketu Shanti Kit',
    category: 'remedy-kits',
    price: 1799,
    mrp: 2999,
    discount: 40,
    rating: 4.5,
    reviewCount: 76,
    aiPick: false,
    iconName: 'prasad-box',
  },
];

const RECOMMENDED_IDS = ['p1', 'p5', 'p9', 'p2', 'p7', 'p12'];
const POPULAR_IDS = ['p5', 'p9', 'p1', 'p12'];

export default function StorePage() {
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

  const recommended = RECOMMENDED_IDS.map((id) => PRODUCTS.find((p) => p.id === id)!);
  const popular = POPULAR_IDS.map((id) => PRODUCTS.find((p) => p.id === id)!);

  return (
    <div className={styles.appLayout}>
      <TopBar
        title={language === 'hi' ? 'Siddha Store' : 'Siddha Store'}
        onLanguageToggle={toggleLanguage}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Store Sub-Tabs */}
          <div className={styles.storeTabs}>
            {STORE_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`${styles.storeTab} ${tab.key === 'store' ? styles.storeTabActive : ''}`}
              >
                {language === 'hi' ? tab.hi : tab.en}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={language === 'hi' ? 'रत्न, रुद्राक्ष, यन्त्र खोजें...' : 'Search gemstones, rudraksha, yantras...'}
              readOnly
            />
            <Link href="/cart" className={styles.cartIconBtn} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
          </div>

          {/* Recommended for Your Chart */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Icon name="star-rating" size={20} color="var(--color-accent-gold)" />{' '}
                {language === 'hi' ? 'आपकी कुंडली के अनुसार' : 'Recommended for Your Chart'}
              </h2>
            </div>
            <div className={styles.productScroll}>
              {recommended.map((product) => (
                <div
                  key={product.id}
                  className={styles.productCard}
                  onClick={() => router.push(`/store/${product.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {product.aiPick && (
                    <span className={styles.aiPickBadge}>
                      <Icon name="sparkles" size={14} color="var(--color-accent-gold)" /> AI Pick
                    </span>
                  )}
                  <div className={styles.productImagePlaceholder}>
                    <Icon name={product.iconName} size={32} color="var(--color-accent-gold)" />
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>
                      {language === 'hi' ? product.name : product.nameEn}
                    </h3>
                    {product.tag && (
                      <span className={styles.productTag}>
                        {language === 'hi' ? product.tag : product.tagEn}
                      </span>
                    )}
                    <div className={styles.productRating}>
                      <span className={styles.ratingStars}><Icon name="star-rating" size={14} color="var(--color-accent-gold)" /> {product.rating}</span>
                      <span className={styles.reviewCount}>({product.reviewCount})</span>
                    </div>
                    <div className={styles.productPricing}>
                      <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                      <span className={styles.productMrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
                      <span className={styles.productDiscount}>{product.discount}% off</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories Grid */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Icon name="clipboard" size={20} color="var(--color-accent-gold)" />{' '}
              {language === 'hi' ? 'Categories' : 'Categories'}
            </h2>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className={styles.categoryCard}>
                  <Icon name={cat.iconName} size={24} color="var(--color-accent-gold)" />
                  <span className={styles.categoryName}>
                    {language === 'hi' ? cat.name : cat.nameEn}
                  </span>
                  <span className={styles.categoryCount}>
                    {cat.count} {language === 'hi' ? 'items' : 'items'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Popular This Week */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Icon name="fire" size={20} color="var(--color-accent-gold)" />{' '}
              {language === 'hi' ? 'इस हफ्ते Popular' : 'Popular This Week'}
            </h2>
            <div className={styles.popularList}>
              {popular.map((product) => (
                <div
                  key={product.id}
                  className={styles.popularCard}
                  onClick={() => router.push(`/store/${product.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.popularImagePlaceholder}>
                    <Icon name={product.iconName} size={28} color="var(--color-accent-gold)" />
                  </div>
                  <div className={styles.popularInfo}>
                    <h3 className={styles.popularName}>
                      {language === 'hi' ? product.name : product.nameEn}
                    </h3>
                    <div className={styles.popularRating}>
                      <span><Icon name="star-rating" size={14} color="var(--color-accent-gold)" /> {product.rating}</span>
                      <span className={styles.popularReviewCount}>({product.reviewCount})</span>
                    </div>
                    <div className={styles.popularPricing}>
                      <span className={styles.popularPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                      <span className={styles.popularMrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
                      <span className={styles.popularDiscount}>{product.discount}% off</span>
                    </div>
                  </div>
                  <button
                    className={styles.addToCartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/cart');
                    }}
                  >
                    {language === 'hi' ? 'Cart में डालें' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <BottomTabBar language={language} />
    </div>
  );
}
