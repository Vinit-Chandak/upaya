'use client';

import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import BottomTabBar from '@/components/BottomTabBar';
import styles from './page.module.css';

interface WalletTransaction {
  id: string;
  type: 'recharge' | 'debit';
  amount: number;
  description: string;
  descriptionHi: string;
  createdAt: string;
}

const RECHARGE_OPTIONS = [
  { amount: 10000, label: '\u20B9100' },
  { amount: 20000, label: '\u20B9200' },
  { amount: 50000, label: '\u20B9500' },
  { amount: 100000, label: '\u20B91,000' },
];

function getMockTransactions(): WalletTransaction[] {
  return [
    {
      id: 'wt1', type: 'recharge', amount: 50000,
      description: 'Wallet recharge', descriptionHi: '\u0935\u0949\u0932\u0947\u091F \u0930\u093F\u091A\u093E\u0930\u094D\u091C',
      createdAt: '25 Feb 2026, 10:30 AM',
    },
    {
      id: 'wt2', type: 'debit', amount: 12000,
      description: 'Pandit consultation - Ramesh Shastri (8 min)', descriptionHi: '\u092A\u0902\u0921\u093F\u0924 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 - \u0930\u092E\u0947\u0936 \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940 (8 min)',
      createdAt: '24 Feb 2026, 3:15 PM',
    },
    {
      id: 'wt3', type: 'recharge', amount: 20000,
      description: 'Wallet recharge', descriptionHi: '\u0935\u0949\u0932\u0947\u091F \u0930\u093F\u091A\u093E\u0930\u094D\u091C',
      createdAt: '22 Feb 2026, 9:00 AM',
    },
    {
      id: 'wt4', type: 'debit', amount: 7500,
      description: 'Pandit consultation - Suresh Joshi (5 min)', descriptionHi: '\u092A\u0902\u0921\u093F\u0924 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 - \u0938\u0941\u0930\u0947\u0936 \u091C\u094B\u0936\u0940 (5 min)',
      createdAt: '20 Feb 2026, 5:45 PM',
    },
  ];
}

export default function WalletPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [balance, setBalance] = useState(50500);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedRecharge, setSelectedRecharge] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    setTransactions(getMockTransactions());
  }, []);

  const toggleLanguage = () => {
    const nl = language === 'hi' ? 'en' : 'hi';
    setLanguage(nl);
    localStorage.setItem('upaya_language', nl);
  };

  const t = (hi: string, en: string) => (language === 'hi' ? hi : en);
  const formatPrice = (paise: number) => `\u20B9${(paise / 100).toLocaleString('en-IN')}`;

  const handleRecharge = useCallback(() => {
    if (!selectedRecharge) return;
    setBalance((prev) => prev + selectedRecharge);
    setTransactions((prev) => [
      {
        id: `wt-new-${Date.now()}`,
        type: 'recharge',
        amount: selectedRecharge,
        description: 'Wallet recharge',
        descriptionHi: '\u0935\u0949\u0932\u0947\u091F \u0930\u093F\u091A\u093E\u0930\u094D\u091C',
        createdAt: 'Just now',
      },
      ...prev,
    ]);
    setSelectedRecharge(null);
  }, [selectedRecharge]);

  return (
    <div className={styles.appLayout}>
      <TopBar title={t('\u0935\u0949\u0932\u0947\u091F', 'Wallet')} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Balance Card */}
          <div className={styles.balanceCard}>
            <p className={styles.balanceLabel}>{t('\u0909\u092A\u0932\u092C\u094D\u0927 \u0936\u0947\u0937', 'Available Balance')}</p>
            <h2 className={styles.balanceAmount}>{formatPrice(balance)}</h2>
            <p className={styles.balanceNote}>
              {t('\u092A\u0902\u0921\u093F\u0924 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902', 'Use for pandit consultations')}
            </p>
          </div>

          {/* Quick Recharge */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('\u091C\u0932\u094D\u0926\u0940 \u0930\u093F\u091A\u093E\u0930\u094D\u091C \u0915\u0930\u0947\u0902', 'Quick Recharge')}</h3>
            <div className={styles.rechargeGrid}>
              {RECHARGE_OPTIONS.map((opt) => (
                <button
                  key={opt.amount}
                  className={`${styles.rechargeChip} ${selectedRecharge === opt.amount ? styles.rechargeChipActive : ''}`}
                  onClick={() => setSelectedRecharge(opt.amount)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {selectedRecharge && (
              <button className={styles.rechargeBtn} onClick={handleRecharge}>
                {t(`${formatPrice(selectedRecharge)} \u091C\u094B\u0921\u093C\u0947\u0902`, `Add ${formatPrice(selectedRecharge)}`)}
              </button>
            )}
          </div>

          {/* Transaction History */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{t('\u0932\u0947\u0928-\u0926\u0947\u0928', 'Transactions')}</h3>
            <div className={styles.txList}>
              {transactions.map((tx) => (
                <div key={tx.id} className={styles.txCard}>
                  <div className={styles.txLeft}>
                    <span className={styles.txIcon}>
                      {tx.type === 'recharge' ? '\u2B06\uFE0F' : '\u2B07\uFE0F'}
                    </span>
                    <div className={styles.txInfo}>
                      <span className={styles.txDesc}>{t(tx.descriptionHi, tx.description)}</span>
                      <span className={styles.txDate}>{tx.createdAt}</span>
                    </div>
                  </div>
                  <span className={`${styles.txAmount} ${tx.type === 'recharge' ? styles.txAmountPositive : styles.txAmountNegative}`}>
                    {tx.type === 'recharge' ? '+' : '-'}{formatPrice(tx.amount)}
                  </span>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>{'\uD83D\uDCB3'}</span>
                <p className={styles.emptyText}>{t('\u0915\u094B\u0908 \u0932\u0947\u0928-\u0926\u0947\u0928 \u0928\u0939\u0940\u0902', 'No transactions yet')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomTabBar language={language} />
    </div>
  );
}
