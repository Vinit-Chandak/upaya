'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

/* ============================================
   Types
   ============================================ */
interface CartItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  mrp: number;
  quantity: number;
  emoji: string;
}

/* ============================================
   Mock Cart Data
   ============================================ */
const INITIAL_CART: CartItem[] = [
  {
    id: 'p1',
    name: 'नीलम (Blue Sapphire)',
    nameEn: 'Blue Sapphire (Neelam)',
    price: 4999,
    mrp: 7999,
    quantity: 1,
    emoji: '💎',
  },
  {
    id: 'p5',
    name: '5 मुखी रुद्राक्ष',
    nameEn: '5 Mukhi Rudraksha',
    price: 999,
    mrp: 1999,
    quantity: 1,
    emoji: '📿',
  },
  {
    id: 'p9',
    name: 'श्री यन्त्र',
    nameEn: 'Shree Yantra',
    price: 1999,
    mrp: 3499,
    quantity: 1,
    emoji: '🔱',
  },
];

export default function CartPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalSavings = totalMrp - subtotal;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const isEmpty = cartItems.length === 0;

  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'Cart' : 'Cart'}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {isEmpty ? (
            /* Empty Cart State */
            <div className={styles.emptyState}>
              <span className={styles.emptyEmoji}>🛒</span>
              <h2 className={styles.emptyTitle}>
                {language === 'hi' ? 'आपका Cart खाली है' : 'Your Cart is Empty'}
              </h2>
              <p className={styles.emptyText}>
                {language === 'hi'
                  ? 'अपनी कुंडली के अनुसार recommended products देखें'
                  : 'Browse products recommended for your chart'}
              </p>
              <Link href="/store" className={styles.shopNowBtn}>
                {language === 'hi' ? 'Shop करें' : 'Shop Now'}
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items Header */}
              <div className={styles.cartHeader}>
                <h2 className={styles.cartHeaderTitle}>
                  {language === 'hi'
                    ? `${cartItems.length} items Cart में`
                    : `${cartItems.length} items in Cart`}
                </h2>
              </div>

              {/* Cart Items List */}
              <div className={styles.cartList}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div
                      className={styles.cartItemImage}
                      onClick={() => router.push(`/store/${item.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles.cartItemEmoji}>{item.emoji}</span>
                    </div>

                    <div className={styles.cartItemInfo}>
                      <h3
                        className={styles.cartItemName}
                        onClick={() => router.push(`/store/${item.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        {language === 'hi' ? item.name : item.nameEn}
                      </h3>
                      <div className={styles.cartItemPricing}>
                        <span className={styles.cartItemPrice}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className={styles.cartItemMrp}>
                          ₹{item.mrp.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className={styles.cartItemActions}>
                        <div className={styles.quantityControl}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => handleQuantityChange(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className={styles.quantityValue}>{item.quantity}</span>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => handleQuantityChange(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Remove item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          <span>{language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={styles.orderSummary}>
                <h3 className={styles.summaryTitle}>
                  {language === 'hi' ? 'Order Summary' : 'Order Summary'}
                </h3>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'Subtotal' : 'Subtotal'}
                  </span>
                  <span className={styles.summaryValue}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'Shipping' : 'Shipping'}
                  </span>
                  <span className={styles.summaryValueFree}>
                    {language === 'hi' ? 'Free' : 'Free'}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabelSaving}>
                    {language === 'hi' ? 'आपकी बचत' : 'You Save'}
                  </span>
                  <span className={styles.summaryValueSaving}>
                    -₹{totalSavings.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabelTotal}>
                    {language === 'hi' ? 'Total' : 'Total'}
                  </span>
                  <span className={styles.summaryValueTotal}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className={styles.checkoutCtaWrapper}>
                <button
                  className={styles.checkoutCta}
                  onClick={() => router.push('/checkout')}
                >
                  {language === 'hi' ? 'Checkout करें' : 'Proceed to Checkout'}
                </button>
              </div>

              {/* Continue Shopping Link */}
              <div className={styles.continueShoppingWrapper}>
                <Link href="/store" className={styles.continueShoppingLink}>
                  {language === 'hi' ? '← और Shopping करें' : '← Continue Shopping'}
                </Link>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
