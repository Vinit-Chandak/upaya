'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
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
  specs: string;
  specsEn: string;
  aiReasoning: string;
  aiReasoningEn: string;
  usage: string;
  usageEn: string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  textEn: string;
}

/* ============================================
   Mock Data
   ============================================ */
const PRODUCTS: Record<string, Product> = {
  p1: {
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
    specs: '5.25 Ratti | Sri Lankan Origin | Lab Certified | Silver Ring Setting',
    specsEn: '5.25 Ratti | Sri Lankan Origin | Lab Certified | Silver Ring Setting',
    aiReasoning: 'आपकी कुंडली में शनि 7वें भाव में है और साढ़ेसाती चल रही है। नीलम शनि की शक्ति को balanced करेगा और career + marriage दोनों में सुधार लाएगा।',
    aiReasoningEn: 'Saturn is placed in your 7th house and Sade Sati is active. Blue Sapphire will balance Saturn\'s energy and bring improvement in both career and marriage.',
    usage: 'शनिवार को शाम को, दाहिने हाथ की मध्यमा उंगली (middle finger) में पहनें। पहनने से पहले गंगाजल और दूध से शुद्ध करें। "ॐ शं शनैश्चराय नमः" मंत्र 108 बार जपें।',
    usageEn: 'Wear on Saturday evening on the middle finger of the right hand. Purify with Gangajal and milk before wearing. Chant "Om Sham Shanaischaraya Namah" 108 times.',
  },
  p2: {
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
    specs: '4.50 Ratti | Natural Ceylon | Lab Certified | Gold Ring Setting',
    specsEn: '4.50 Ratti | Natural Ceylon | Lab Certified | Gold Ring Setting',
    aiReasoning: 'आपकी कुंडली में बृहस्पति कमजोर है जो शादी में देरी का मुख्य कारण है। पुखराज बृहस्पति को मजबूत करेगा।',
    aiReasoningEn: 'Jupiter is weak in your chart which is the main cause of marriage delay. Yellow Sapphire will strengthen Jupiter.',
    usage: 'गुरुवार सुबह, तर्जनी (index finger) में पहनें। हल्दी वाले पानी से शुद्ध करें। "ॐ बृं बृहस्पतये नमः" 108 बार जपें।',
    usageEn: 'Wear on Thursday morning on the index finger. Purify with turmeric water. Chant "Om Brim Brihaspataye Namah" 108 times.',
  },
  p5: {
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
    specs: 'Nepal Origin | X-Ray Certified | Natural | Cotton Thread',
    specsEn: 'Nepal Origin | X-Ray Certified | Natural | Cotton Thread',
    aiReasoning: 'यह सबसे शक्तिशाली और universal रुद्राक्ष है। आपकी कुंडली के अनुसार, यह सभी ग्रहों को balance करता है और मानसिक शांति देता है।',
    aiReasoningEn: 'This is the most powerful and universal Rudraksha. According to your chart, it balances all planets and brings mental peace.',
    usage: 'सोमवार सुबह धारण करें। गंगाजल से शुद्ध करें। "ॐ नमः शिवाय" 108 बार जपें। नहाते समय और सोते समय उतार दें।',
    usageEn: 'Wear on Monday morning. Purify with Gangajal. Chant "Om Namah Shivaya" 108 times. Remove while bathing and sleeping.',
  },
  p9: {
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
    specs: 'Copper | Energized | 6x6 inches | With Stand',
    specsEn: 'Copper | Energized | 6x6 inches | With Stand',
    aiReasoning: 'आपकी कुंडली में धन भाव कमजोर है। श्री यन्त्र लक्ष्मी की कृपा बढ़ाता है और आर्थिक स्थिति सुधारता है।',
    aiReasoningEn: 'Your wealth house is weak. Shree Yantra increases Lakshmi\'s blessings and improves financial conditions.',
    usage: 'पूजा स्थान में पूर्व दिशा की ओर रखें। रोज सुबह "ॐ श्रीं ह्रीं श्रीं" मंत्र 11 बार जपें। शुक्रवार को फूल और धूप अर्पित करें।',
    usageEn: 'Place in puja area facing East. Chant "Om Shreem Hreem Shreem" 11 times daily. Offer flowers and incense on Fridays.',
  },
  p12: {
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
    specs: 'Red Coral Ring + Hanuman Yantra + Sacred Thread + Instruction Book',
    specsEn: 'Red Coral Ring + Hanuman Yantra + Sacred Thread + Instruction Book',
    aiReasoning: 'आपकी कुंडली में मंगल दोष पाया गया है। यह complete kit सभी recommended remedies को एक साथ provide करता है।',
    aiReasoningEn: 'Mangal Dosha has been found in your chart. This complete kit provides all recommended remedies together.',
    usage: 'मंगलवार से शुरू करें। Kit में दिए गए instruction booklet को ध्यान से पढ़ें। 21 दिन तक नियमित रूप से पालन करें।',
    usageEn: 'Start on Tuesday. Read the instruction booklet carefully. Follow regularly for 21 days.',
  },
};

const TRUST_SIGNALS = [
  { hi: 'प्राण प्रतिष्ठा certified', en: 'Pran Pratistha Certified', iconName: 'shield' },
  { hi: 'Video certification उपलब्ध', en: 'Video Certification Available', iconName: 'shield' },
  { hi: 'Lab certified genuine', en: 'Lab Certified Genuine', iconName: 'shield' },
  { hi: '7-day return policy', en: '7-Day Return Policy', iconName: 'shield' },
  { hi: 'Free shipping', en: 'Free Shipping', iconName: 'truck' },
];

const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Rajesh K.',
    rating: 5,
    date: '2 weeks ago',
    text: 'बहुत अच्छा product है। पहनने के बाद से काफी positive changes आए हैं। Genuine और well-packaged।',
    textEn: 'Very good product. Many positive changes after wearing it. Genuine and well-packaged.',
  },
  {
    id: 'r2',
    name: 'Priya S.',
    rating: 4,
    date: '1 month ago',
    text: 'Quality बहुत अच्छी है। Delivery समय पर हुई। Certificate भी मिला।',
    textEn: 'Quality is very good. Delivery was on time. Got the certificate too.',
  },
  {
    id: 'r3',
    name: 'Amit V.',
    rating: 5,
    date: '3 weeks ago',
    text: 'AI recommendation के अनुसार लिया था। सच में फर्क पड़ा। बहुत satisfied हूं।',
    textEn: 'Bought based on AI recommendation. It truly made a difference. Very satisfied.',
  },
];

/* ============================================
   Default fallback product
   ============================================ */
const DEFAULT_PRODUCT: Product = {
  id: 'default',
  name: 'Product',
  nameEn: 'Product',
  category: 'general',
  price: 999,
  mrp: 1999,
  discount: 50,
  rating: 4.5,
  reviewCount: 100,
  aiPick: false,
  iconName: 'cart',
  specs: 'Premium Quality | Certified | Free Shipping',
  specsEn: 'Premium Quality | Certified | Free Shipping',
  aiReasoning: 'आपकी कुंडली के अनुसार यह product आपके लिए beneficial है।',
  aiReasoningEn: 'This product is beneficial for you according to your chart.',
  usage: 'विशेषज्ञ की सलाह के अनुसार उपयोग करें।',
  usageEn: 'Use as per expert guidance.',
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const productId = params.id as string;
  const product = PRODUCTS[productId] || DEFAULT_PRODUCT;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: language === 'hi' ? product.name : product.nameEn,
        url: window.location.href,
      });
    }
  };

  const handleAddToCart = () => {
    router.push('/cart');
  };

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title="" />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Image Carousel Placeholder */}
          <div className={styles.imageCarousel}>
            <div className={styles.imageMain}>
              <Icon name={product.iconName} size={48} color="var(--color-accent-gold)" />
            </div>
            <div className={styles.imageDots}>
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  className={`${styles.imageDot} ${activeImage === i ? styles.imageDotActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
            {/* Share button */}
            <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>

          {/* Product Header */}
          <div className={styles.productHeader}>
            <h1 className={styles.productName}>
              {language === 'hi' ? product.name : product.nameEn}
            </h1>
            <p className={styles.productSpecs}>{language === 'hi' ? product.specs : product.specsEn}</p>
            <div className={styles.ratingRow}>
              <span className={styles.ratingStars}><Icon name="star-rating" size={14} color="var(--color-accent-gold)" /> {product.rating}</span>
              <span className={styles.ratingCount}>
                ({product.reviewCount} {language === 'hi' ? 'reviews' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className={styles.priceBlock}>
            <span className={styles.priceMain}>₹{product.price.toLocaleString('en-IN')}</span>
            <span className={styles.priceMrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
            <span className={styles.priceDiscount}>{product.discount}% off</span>
          </div>

          {/* AI Reasoning Box */}
          <div className={styles.aiReasoningBox}>
            <div className={styles.aiReasoningHeader}>
              <Icon name="sparkles" size={20} color="var(--color-accent-gold)" />
              <h3 className={styles.aiReasoningTitle}>
                {language === 'hi' ? 'आपकी कुंडली से क्यों?' : 'Why this product (from your chart)'}
              </h3>
            </div>
            <p className={styles.aiReasoningText}>
              {language === 'hi' ? product.aiReasoning : product.aiReasoningEn}
            </p>
          </div>

          {/* Trust Signals */}
          <div className={styles.trustSignals}>
            {TRUST_SIGNALS.map((signal, i) => (
              <div key={i} className={styles.trustItem}>
                <Icon name={signal.iconName} size={16} color="#10B981" />
                <span className={styles.trustText}>
                  {language === 'hi' ? signal.hi : signal.en}
                </span>
              </div>
            ))}
          </div>

          {/* Usage Instructions */}
          <div className={styles.usageSection}>
            <h3 className={styles.usageSectionTitle}>
              <Icon name="book-open" size={20} color="var(--color-accent-gold)" />{' '}
              {language === 'hi' ? 'पहनने / उपयोग की विधि' : 'Wearing / Usage Instructions'}
            </h3>
            <p className={styles.usageText}>
              {language === 'hi' ? product.usage : product.usageEn}
            </p>
          </div>

          {/* Pran Pratistha Video Placeholder */}
          <div className={styles.videoSection}>
            <h3 className={styles.videoSectionTitle}>
              <Icon name="video" size={20} color="var(--color-accent-gold)" />{' '}
              {language === 'hi' ? 'प्राण प्रतिष्ठा Video' : 'Pran Pratistha Video'}
            </h3>
            <div className={styles.videoPlaceholder}>
              <div className={styles.videoPlayBtn}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <p className={styles.videoCaption}>
                {language === 'hi' ? 'प्राण प्रतिष्ठा विधि देखें' : 'Watch Pran Pratistha Process'}
              </p>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className={styles.reviewsSection}>
            <h3 className={styles.reviewsSectionTitle}>
              <Icon name="chat-bubble" size={20} color="var(--color-accent-gold)" />{' '}
              {language === 'hi' ? 'Customer Reviews' : 'Customer Reviews'}
            </h3>
            <div className={styles.reviewsList}>
              {REVIEWS.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewAvatar}>
                      {review.name.charAt(0)}
                    </span>
                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewName}>{review.name}</span>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <span className={styles.reviewRating}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Icon key={i} name="star-rating" size={12} color="var(--color-accent-gold)" />
                      ))}
                    </span>
                  </div>
                  <p className={styles.reviewText}>
                    {language === 'hi' ? review.text : review.textEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className={styles.stickyBottom}>
        <div className={styles.stickyBottomInner}>
          <div className={styles.stickyPrice}>
            <span className={styles.stickyPriceMain}>₹{product.price.toLocaleString('en-IN')}</span>
            <span className={styles.stickyPriceMrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
          </div>
          <button className={styles.addToCartCta} onClick={handleAddToCart}>
            {language === 'hi' ? 'Cart में डालें' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
