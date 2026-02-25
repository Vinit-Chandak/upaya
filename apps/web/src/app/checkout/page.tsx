'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

/* ============================================
   Types
   ============================================ */
interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  quantity: number;
  emoji: string;
}

/* ============================================
   Mock Data
   ============================================ */
const ADDRESSES: Address[] = [
  {
    id: 'addr1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    line1: '42, Shiv Colony',
    line2: 'Near Hanuman Mandir',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    isDefault: true,
  },
  {
    id: 'addr2',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    line1: 'B-204, Sunrise Apartments',
    line2: 'Sector 15, Malviya Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110017',
    isDefault: false,
  },
];

const ORDER_ITEMS: OrderItem[] = [
  {
    id: 'p1',
    name: 'नीलम (Blue Sapphire)',
    nameEn: 'Blue Sapphire (Neelam)',
    price: 4999,
    quantity: 1,
    emoji: '💎',
  },
  {
    id: 'p5',
    name: '5 मुखी रुद्राक्ष',
    nameEn: '5 Mukhi Rudraksha',
    price: 999,
    quantity: 1,
    emoji: '📿',
  },
  {
    id: 'p9',
    name: 'श्री यन्त्र',
    nameEn: 'Shree Yantra',
    price: 1999,
    quantity: 1,
    emoji: '🔱',
  },
];

export default function CheckoutPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [selectedAddress, setSelectedAddress] = useState<string>('addr1');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    // Simulate order placement
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderSuccess(true);
    }, 2000);
  };

  /* ============================================
     Order Success State
     ============================================ */
  if (orderSuccess) {
    return (
      <div className={styles.appLayout}>
        <TopBar title="" />

        <main className={styles.mainContent}>
          <div className={styles.successContainer}>
            <div className={styles.successCheckmark}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#10B981" strokeWidth="3" className={styles.successCircle} />
                <path
                  d="M20 33L28 41L44 23"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.successTick}
                />
              </svg>
            </div>
            <h1 className={styles.successTitle}>
              {language === 'hi' ? 'Order Confirmed!' : 'Order Confirmed!'}
            </h1>
            <p className={styles.successText}>
              {language === 'hi'
                ? 'आपका order successfully place हो गया है। आपको email पर confirmation भेजा जाएगा।'
                : 'Your order has been placed successfully. You will receive a confirmation email shortly.'}
            </p>
            <p className={styles.successOrderId}>
              {language === 'hi' ? 'Order ID:' : 'Order ID:'} #UPY{Date.now().toString().slice(-8)}
            </p>

            <div className={styles.successDelivery}>
              <span className={styles.successDeliveryIcon}>🚚</span>
              <div>
                <p className={styles.successDeliveryTitle}>
                  {language === 'hi' ? 'Expected Delivery' : 'Expected Delivery'}
                </p>
                <p className={styles.successDeliveryDate}>
                  {language === 'hi' ? '5-7 working days' : '5-7 working days'}
                </p>
              </div>
            </div>

            <div className={styles.successActions}>
              <Link href="/orders" className={styles.viewOrderBtn}>
                {language === 'hi' ? 'Order Track करें' : 'Track Order'}
              </Link>
              <Link href="/store" className={styles.continueShopBtn}>
                {language === 'hi' ? 'और Shopping करें' : 'Continue Shopping'}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================
     Checkout Form
     ============================================ */
  return (
    <div className={styles.appLayout}>
      <TopBar
        showBack
        title={language === 'hi' ? 'Checkout' : 'Checkout'}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Delivery Address Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? '📍 Delivery Address' : '📍 Delivery Address'}
            </h2>

            <div className={styles.addressList}>
              {ADDRESSES.map((addr) => (
                <label
                  key={addr.id}
                  className={`${styles.addressCard} ${
                    selectedAddress === addr.id ? styles.addressCardSelected : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className={styles.addressRadio}
                  />
                  <div className={styles.addressContent}>
                    <div className={styles.addressHeader}>
                      <span className={styles.addressName}>{addr.name}</span>
                      {addr.isDefault && (
                        <span className={styles.defaultBadge}>
                          {language === 'hi' ? 'Default' : 'Default'}
                        </span>
                      )}
                    </div>
                    <p className={styles.addressLine}>{addr.line1}</p>
                    <p className={styles.addressLine}>{addr.line2}</p>
                    <p className={styles.addressLine}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className={styles.addressPhone}>{addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            <button className={styles.addAddressBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {language === 'hi' ? 'नया Address जोड़ें' : 'Add New Address'}
            </button>
          </section>

          {/* Order Summary Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {language === 'hi' ? '🛒 Order Summary' : '🛒 Order Summary'}
            </h2>

            <div className={styles.orderItemsList}>
              {ORDER_ITEMS.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemLeft}>
                    <span className={styles.orderItemEmoji}>{item.emoji}</span>
                    <div className={styles.orderItemDetail}>
                      <span className={styles.orderItemName}>
                        {language === 'hi' ? item.name : item.nameEn}
                      </span>
                      <span className={styles.orderItemQty}>
                        {language === 'hi' ? `x${item.quantity}` : `x${item.quantity}`}
                      </span>
                    </div>
                  </div>
                  <span className={styles.orderItemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span className={styles.totalValue}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Shipping</span>
                <span className={styles.totalValueFree}>Free</span>
              </div>
              <div className={styles.totalDivider} />
              <div className={styles.totalRow}>
                <span className={styles.totalLabelFinal}>
                  {language === 'hi' ? 'कुल राशि' : 'Total Amount'}
                </span>
                <span className={styles.totalValueFinal}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </section>

          {/* Place Order CTA */}
          <div className={styles.placeOrderWrapper}>
            <button
              className={styles.placeOrderCta}
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <span className={styles.loadingSpinner} />
              ) : null}
              {isPlacingOrder
                ? (language === 'hi' ? 'Processing...' : 'Processing...')
                : (language === 'hi' ? `₹${total.toLocaleString('en-IN')} Pay करें` : `Pay ₹${total.toLocaleString('en-IN')}`)}
            </button>
            <p className={styles.secureNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {language === 'hi' ? 'Secure Payment by Razorpay' : 'Secure Payment by Razorpay'}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
