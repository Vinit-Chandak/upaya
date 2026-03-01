'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

type BookingStep = 1 | 2 | 3;

interface SankalpForm {
  fullName: string;
  fatherName: string;
  gotra: string;
  gotraUnknown: boolean;
  wish: string;
}

interface DateOption {
  date: string;
  label: string;
  day: string;
  isRecommended: boolean;
  muhurtaQuality: 'good' | 'average';
}

const COMMON_GOTRAS = [
  'भारद्वाज', 'कश्यप', 'वशिष्ठ', 'गौतम', 'अत्रि',
  'जमदग्नि', 'विश्वामित्र', 'अगस्त्य', 'शांडिल्य', 'पाराशर',
];

function generateDates(): DateOption[] {
  const dates: DateOption[] = [];
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 3; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const day = d.getDay();
    // Tuesday and Saturday good for Mangal
    const isGood = day === 2 || day === 6;
    dates.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      day: dayNames[day],
      isRecommended: i === 3 && isGood,
      muhurtaQuality: isGood ? 'good' : 'average',
    });
  }
  return dates;
}

function BookingFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pujaId = searchParams.get('pujaId') || 'p1';
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [step, setStep] = useState<BookingStep>(1);
  const [sankalp, setSankalp] = useState<SankalpForm>({
    fullName: '',
    fatherName: '',
    gotra: '',
    gotraUnknown: false,
    wish: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [showGotraList, setShowGotraList] = useState(false);

  const dates = useMemo(() => generateDates(), []);
  const recommendedDate = dates.find((d) => d.muhurtaQuality === 'good') || dates[0];

  // Mock address
  const [hasAddress] = useState(true);
  const [addressSummary] = useState('Rohit Kumar, 45/B Sector 12, Noida, UP 201301');

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    if (!selectedDate && recommendedDate) {
      setSelectedDate(recommendedDate.date);
    }
  }, [recommendedDate, selectedDate]);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  const canProceedStep1 = sankalp.fullName.trim().length > 0;
  const canProceedStep2 = selectedDate.length > 0;

  const handleGoNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const handlePayment = () => {
    // In production, call the booking + payment API
    const selectedDateObj = dates.find((d) => d.date === selectedDate);
    router.push(
      `/booking/confirmation?pujaId=${pujaId}&date=${selectedDate}&dateLabel=${encodeURIComponent(selectedDateObj?.label || '')}&name=${encodeURIComponent(sankalp.fullName)}`,
    );
  };

  const stepTitle = step === 1
    ? (language === 'hi' ? 'संकल्प Details' : 'Sankalp Details')
    : step === 2
      ? (language === 'hi' ? 'Date चुनें' : 'Select Date')
      : (language === 'hi' ? 'Review & Pay' : 'Review & Pay');

  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={stepTitle} onLanguageToggle={toggleLanguage} />

      <main className={styles.mainContent}>
        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          <div className={styles.stepRow}>
            {[1, 2, 3].map((s) => (
              <div key={s} className={styles.stepItem}>
                <div className={`${styles.stepCircle} ${s <= step ? styles.stepCircleActive : ''} ${s < step ? styles.stepCircleDone : ''}`}>
                  {s < step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                  ) : (
                    <span>{s}</span>
                  )}
                </div>
                <span className={`${styles.stepLabel} ${s <= step ? styles.stepLabelActive : ''}`}>
                  {s === 1 ? (language === 'hi' ? 'संकल्प' : 'Sankalp')
                    : s === 2 ? (language === 'hi' ? 'Date' : 'Date')
                    : (language === 'hi' ? 'Pay' : 'Pay')}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.stepProgress}>
            <div className={styles.stepProgressFill} style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        <div className={styles.container}>
          {/* Step 1: Sankalp Details */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <p className={styles.stepDescription}>
                {language === 'hi'
                  ? 'ये details पूजा के दौरान आपकी personal प्रार्थना (संकल्प) में बोली जाती हैं।'
                  : 'These details are spoken during the puja as your personal prayer (sankalp).'}
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {language === 'hi' ? 'पूरा नाम (पूजा के अनुसार)' : 'Full Name (as per puja)'}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={sankalp.fullName}
                  onChange={(e) => setSankalp({ ...sankalp, fullName: e.target.value })}
                  placeholder={language === 'hi' ? 'अपना पूरा नाम लिखें' : 'Enter your full name'}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {language === 'hi' ? 'पिता का नाम' : "Father's Name"}
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={sankalp.fatherName}
                  onChange={(e) => setSankalp({ ...sankalp, fatherName: e.target.value })}
                  placeholder={language === 'hi' ? 'पिता का नाम लिखें' : "Enter father's name"}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {language === 'hi' ? 'गोत्र (अगर पता हो)' : 'Gotra (if known)'}
                </label>
                <div className={styles.gotraWrapper}>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={sankalp.gotra}
                    onChange={(e) => {
                      setSankalp({ ...sankalp, gotra: e.target.value, gotraUnknown: false });
                      setShowGotraList(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowGotraList(true)}
                    placeholder={language === 'hi' ? 'चुनें या लिखें...' : 'Select or type...'}
                    disabled={sankalp.gotraUnknown}
                  />
                  {showGotraList && !sankalp.gotraUnknown && (
                    <div className={styles.gotraDropdown}>
                      {COMMON_GOTRAS.filter((g) =>
                        sankalp.gotra ? g.toLowerCase().includes(sankalp.gotra.toLowerCase()) : true,
                      ).map((g) => (
                        <button
                          key={g}
                          className={styles.gotraOption}
                          onClick={() => {
                            setSankalp({ ...sankalp, gotra: g });
                            setShowGotraList(false);
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={sankalp.gotraUnknown}
                    onChange={(e) =>
                      setSankalp({ ...sankalp, gotraUnknown: e.target.checked, gotra: '' })
                    }
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    {language === 'hi'
                      ? 'मुझे अपना गोत्र नहीं पता (सामान्य संकल्प use होगा)'
                      : "Don't know my gotra (general sankalp will be used)"}
                  </span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {language === 'hi' ? 'आपकी इच्छा / संकल्प' : 'Your Wish / Sankalp'}
                </label>
                <textarea
                  className={styles.formTextarea}
                  value={sankalp.wish}
                  onChange={(e) => setSankalp({ ...sankalp, wish: e.target.value })}
                  placeholder={
                    language === 'hi'
                      ? 'जैसे: शादी में आ रही बाधा दूर हो, करियर में तरक्की मिले...'
                      : 'E.g.: Remove obstacles in marriage, career progress...'
                  }
                  rows={3}
                />
                <p className={styles.formHint}>
                  {language === 'hi'
                    ? 'यह इच्छा पंडित जी द्वारा संकल्प में बोली जाएगी'
                    : 'This wish will be spoken by the pandit during sankalp'}
                </p>
              </div>

              <button
                className={`${styles.nextButton} ${!canProceedStep1 ? styles.nextButtonDisabled : ''}`}
                onClick={handleGoNext}
                disabled={!canProceedStep1}
              >
                {language === 'hi' ? 'आगे: Date चुनें' : 'Next: Select Date'}
              </button>
            </div>
          )}

          {/* Step 2: Date Selection */}
          {step === 2 && (
            <div className={styles.stepContent}>
              {/* AI recommended date */}
              <div className={styles.recommendedSection}>
                <h3 className={styles.recommendedTitle}>
                  <Icon name="sparkles" size={18} color="var(--color-accent-gold)" />
                  {language === 'hi' ? 'AI Recommended Date:' : 'AI Recommended Date:'}
                </h3>
                <button
                  className={`${styles.dateCard} ${selectedDate === recommendedDate.date ? styles.dateCardSelected : ''} ${styles.dateCardRecommended}`}
                  onClick={() => setSelectedDate(recommendedDate.date)}
                >
                  <div className={styles.dateCardLeft}>
                    <span className={styles.dateLabel}>{recommendedDate.label}</span>
                    <span className={styles.dateDay}>{recommendedDate.day}</span>
                  </div>
                  <span className={styles.muhurtaBadge}>
                    {language === 'hi' ? 'अच्छा muhurta' : 'Good muhurta'}
                  </span>
                </button>
              </div>

              {/* Other dates */}
              <div className={styles.otherDatesSection}>
                <h3 className={styles.otherDatesTitle}>
                  {language === 'hi' ? 'Other available dates:' : 'Other available dates:'}
                </h3>
                <div className={styles.dateGrid}>
                  {dates.filter((d) => d.date !== recommendedDate.date).map((d) => (
                    <button
                      key={d.date}
                      className={`${styles.dateCard} ${selectedDate === d.date ? styles.dateCardSelected : ''}`}
                      onClick={() => setSelectedDate(d.date)}
                    >
                      <div className={styles.dateCardLeft}>
                        <span className={styles.dateLabel}>{d.label}</span>
                        <span className={styles.dateDay}>{d.day}</span>
                      </div>
                      <span className={`${styles.muhurtaDot} ${d.muhurtaQuality === 'good' ? styles.muhurtaDotGood : styles.muhurtaDotAvg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.muhurtaLegend}>
                <span className={styles.legendItem}>
                  <span className={`${styles.muhurtaDot} ${styles.muhurtaDotGood}`} />
                  {language === 'hi' ? 'अच्छा muhurta' : 'Good muhurta'}
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.muhurtaDot} ${styles.muhurtaDotAvg}`} />
                  {language === 'hi' ? 'सामान्य muhurta' : 'Average muhurta'}
                </span>
              </div>

              <button
                className={`${styles.nextButton} ${!canProceedStep2 ? styles.nextButtonDisabled : ''}`}
                onClick={handleGoNext}
                disabled={!canProceedStep2}
              >
                {language === 'hi' ? 'आगे: Review & Pay' : 'Next: Review & Pay'}
              </button>
            </div>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <div className={styles.stepContent}>
              {/* Order Summary Card */}
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>
                  {language === 'hi' ? 'Order Summary' : 'Order Summary'}
                </h3>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'पूजा' : 'Puja'}
                  </span>
                  <span className={styles.summaryValue}>
                    {language === 'hi' ? 'मंगल दोष निवारण पूजा' : 'Mangal Dosha Nivaran Puja'}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'मंदिर' : 'Temple'}
                  </span>
                  <span className={styles.summaryValue}>
                    {language === 'hi' ? 'मंगलनाथ मंदिर, उज्जैन' : 'Mangalnath Temple, Ujjain'}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'Date' : 'Date'}
                  </span>
                  <span className={styles.summaryValue}>
                    {dates.find((d) => d.date === selectedDate)?.label || selectedDate}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>
                    {language === 'hi' ? 'नाम' : 'Name'}
                  </span>
                  <span className={styles.summaryValue}>{sankalp.fullName}</span>
                </div>

                <div className={styles.summaryDivider} />

                <h4 className={styles.deliverablesTitle}>
                  {language === 'hi' ? 'Deliverables' : 'Deliverables'}
                </h4>
                <div className={styles.deliverableItem}>
                  <Icon name="video" size={16} color="var(--color-accent-gold)" />
                  <span>{language === 'hi' ? 'पूजा video (3-5 दिन)' : 'Puja video (3-5 days)'}</span>
                </div>
                <div className={styles.deliverableItem}>
                  <Icon name="prasad-box" size={16} color="var(--color-accent-gold)" />
                  <span>{language === 'hi' ? 'प्रसाद delivery (7-10 दिन)' : 'Prasad delivery (7-10 days)'}</span>
                </div>
                <div className={styles.deliverableItem}>
                  <Icon name="scroll-remedy" size={16} color="var(--color-accent-gold)" />
                  <span>{language === 'hi' ? 'Digital certificate' : 'Digital certificate'}</span>
                </div>
              </div>

              {/* Price breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>{language === 'hi' ? 'पूजा Fee' : 'Puja Fee'}</span>
                  <span>₹2,100</span>
                </div>
                <div className={styles.priceRow}>
                  <span>{language === 'hi' ? 'प्रसाद Delivery' : 'Prasad Delivery'}</span>
                  <span className={styles.freeTag}>Free</span>
                </div>
                <div className={styles.priceDivider} />
                <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                  <span>Total</span>
                  <span>₹2,100</span>
                </div>
              </div>

              {/* Delivery address */}
              <div className={styles.addressSection}>
                <div className={styles.addressHeader}>
                  <h4 className={styles.addressTitle}>
                    {language === 'hi' ? 'प्रसाद delivery address:' : 'Prasad delivery address:'}
                  </h4>
                  <button className={styles.changeButton}>
                    {language === 'hi' ? 'बदलें' : 'Change'}
                  </button>
                </div>
                {hasAddress ? (
                  <p className={styles.addressText}>{addressSummary}</p>
                ) : (
                  <button className={styles.addAddressButton}>
                    + {language === 'hi' ? 'Address जोड़ें' : 'Add Address'}
                  </button>
                )}
              </div>

              {/* Pay button */}
              <button className={styles.payButton} onClick={handlePayment}>
                <Icon name="lock" size={16} color="currentColor" />
                {language === 'hi' ? 'सुरक्षित भुगतान करें — ₹2,100' : 'Pay Securely — ₹2,100'}
              </button>

              <p className={styles.securityNote}>
                <Icon name="shield" size={14} color="currentColor" />
                {language === 'hi' ? 'Razorpay द्वारा सुरक्षित' : 'Secured by Razorpay'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BookingFlowPage() {
  return (
    <Suspense>
      <BookingFlowContent />
    </Suspense>
  );
}
