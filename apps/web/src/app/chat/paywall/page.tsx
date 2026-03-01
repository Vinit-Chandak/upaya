'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRICING } from '@upaya/shared';
import { Icon } from '@/components/icons';
import styles from './page.module.css';

// ---- Types ----

type PaywallStep = 'payment_sheet' | 'auth' | 'otp_verify' | 'processing' | 'success' | 'failure';

// ---- Component ----

function PaywallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const problemType = searchParams.get('problem') || 'marriage_delay';
  const lang = searchParams.get('lang') || 'hi';
  const dob = searchParams.get('dob') || '';
  const place = searchParams.get('place') || '';

  const [language, setLanguage] = useState<'hi' | 'en'>(lang as 'hi' | 'en');
  const [step, setStep] = useState<PaywallStep>('payment_sheet');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  // OTP resend timer
  useEffect(() => {
    if (step !== 'otp_verify') return;
    if (otpResendTimer <= 0) return;

    const timer = setInterval(() => {
      setOtpResendTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpResendTimer]);

  const pricing = PRICING.fullRemedyReport;

  const handleProceedToAuth = useCallback(() => {
    setStep('auth');
  }, []);

  const handleSendOtp = useCallback(() => {
    if (phoneNumber.length < 10) {
      setErrorMessage(language === 'hi' ? 'कृपया valid phone number डालें' : 'Please enter a valid phone number');
      return;
    }
    setErrorMessage('');
    setStep('otp_verify');
    setOtpResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [phoneNumber, language]);

  const handleGoogleLogin = useCallback(() => {
    // Simulate Google login → proceed to payment
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('processing');
      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
      }, 2500);
    }, 1500);
  }, []);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (i + index < 6) newOtp[i + index] = d;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  const handleVerifyOtp = useCallback(() => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage(language === 'hi' ? '6-digit OTP डालें' : 'Enter 6-digit OTP');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    // Simulate OTP verification → payment
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('processing');
      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
      }, 2500);
    }, 1000);
  }, [otpDigits, language]);

  const handleResendOtp = useCallback(() => {
    setOtpResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, []);

  const handlePaymentRetry = useCallback(() => {
    setStep('payment_sheet');
    setErrorMessage('');
  }, []);

  const handleViewReport = useCallback(() => {
    const params = new URLSearchParams({
      problem: problemType,
      lang: language,
      dob,
      place,
    });
    router.push(`/chat/report?${params.toString()}`);
  }, [router, problemType, language, dob, place]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // What's included list
  const inclusions = [
    language === 'hi' ? 'Detailed दोष analysis' : 'Detailed dosha analysis',
    language === 'hi' ? 'Marriage/career timeline' : 'Marriage/career timeline',
    language === 'hi' ? '4-6 personalized remedies' : '4-6 personalized remedies',
    language === 'hi' ? 'Specific temple recommendations' : 'Specific temple recommendations',
    language === 'hi' ? 'Optimal timing for each remedy' : 'Optimal timing for each remedy',
    language === 'hi' ? 'Mantra with audio guidance' : 'Mantra with audio guidance',
    language === 'hi' ? 'Downloadable PDF report' : 'Downloadable PDF report',
  ];

  return (
    <div className={styles.paywallLayout}>
      {/* Dimmed background overlay */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* ============================================
         PAYMENT SHEET
         ============================================ */}
      {step === 'payment_sheet' && (
        <div className={styles.bottomSheet}>
          <div className={styles.dragHandle} />

          <div className={styles.sheetContent}>
            <h2 className={styles.sheetTitle}>
              <span><Icon name="sparkles" size={20} color="var(--color-accent-gold)" /></span>
              {language === 'hi'
                ? 'Unlock Your Complete Remedy Plan'
                : 'Unlock Your Complete Remedy Plan'}
            </h2>

            <div className={styles.inclusionsList}>
              <p className={styles.inclusionsLabel}>
                {language === 'hi' ? "What you'll get:" : "What you'll get:"}
              </p>
              {inclusions.map((item, i) => (
                <div key={i} className={styles.inclusionItem}>
                  <span className={styles.inclusionCheck}><Icon name="sparkles" size={14} color="var(--color-success, #22c55e)" /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className={styles.priceBlock}>
              <div className={styles.priceRow}>
                <span className={styles.priceMain}>₹{pricing.displayAmount}</span>
                <span className={styles.priceOriginal}>was ₹{pricing.originalDisplayAmount}</span>
              </div>
              <span className={styles.priceDiscount}>
                {pricing.discountPercent}% OFF — {language === 'hi' ? 'Introductory Price' : 'Introductory Price'}
              </span>
            </div>

            <button className={styles.payButton} onClick={handleProceedToAuth}>
              {language === 'hi'
                ? `Pay ₹${pricing.displayAmount} Securely`
                : `Pay ₹${pricing.displayAmount} Securely`}
            </button>

            <div className={styles.securityBadges}>
              <span className={styles.securityBadge}>
                <Icon name="lock" size={14} color="currentColor" /> {language === 'hi' ? 'Secured by Razorpay' : 'Secured by Razorpay'}
              </span>
              <span className={styles.securityBadge}>
                <Icon name="shield-lock" size={14} color="currentColor" /> {language === 'hi' ? 'No spam. Cancel anytime.' : 'No spam. Cancel anytime.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
         AUTH / LOGIN SHEET
         ============================================ */}
      {step === 'auth' && (
        <div className={styles.bottomSheet}>
          <div className={styles.dragHandle} />

          <div className={styles.sheetContent}>
            <h2 className={styles.sheetTitle}>
              {language === 'hi' ? 'Sign in to continue' : 'Sign in to continue'}
            </h2>
            <p className={styles.sheetSubtitle}>
              {language === 'hi'
                ? 'Payment के लिए login ज़रूरी है'
                : 'Login is required for payment'}
            </p>

            {/* Phone number input */}
            <div className={styles.phoneInputGroup}>
              <div className={styles.phonePrefix}>+91</div>
              <input
                type="tel"
                className={styles.phoneInput}
                placeholder={language === 'hi' ? 'अपना mobile number डालें' : 'Enter your mobile number'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                inputMode="numeric"
              />
            </div>

            {errorMessage && (
              <p className={styles.errorText}>{errorMessage}</p>
            )}

            <button
              className={styles.otpSendButton}
              onClick={handleSendOtp}
              disabled={phoneNumber.length < 10 || isSubmitting}
            >
              {language === 'hi' ? 'OTP भेजें' : 'Send OTP'}
            </button>

            <div className={styles.orDivider}>
              <span>{language === 'hi' ? 'या' : 'OR'}</span>
            </div>

            <button
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {language === 'hi' ? 'Google से continue करें' : 'Continue with Google'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================
         OTP VERIFICATION
         ============================================ */}
      {step === 'otp_verify' && (
        <div className={styles.bottomSheet}>
          <div className={styles.dragHandle} />

          <div className={styles.sheetContent}>
            <h2 className={styles.sheetTitle}>
              {language === 'hi' ? 'OTP Verify करें' : 'Verify OTP'}
            </h2>
            <p className={styles.sheetSubtitle}>
              {language === 'hi'
                ? `+91 ${phoneNumber} पर भेजा गया 6-digit code डालें`
                : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
            </p>

            <div className={styles.otpInputGroup}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className={`${styles.otpInput} ${digit ? styles.otpInputFilled : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {errorMessage && (
              <p className={styles.errorText}>{errorMessage}</p>
            )}

            <button
              className={styles.verifyButton}
              onClick={handleVerifyOtp}
              disabled={otpDigits.join('').length !== 6 || isSubmitting}
            >
              {isSubmitting
                ? (language === 'hi' ? 'Verify हो रहा है...' : 'Verifying...')
                : (language === 'hi' ? 'Verify & Pay ₹199' : 'Verify & Pay ₹199')}
            </button>

            <div className={styles.resendRow}>
              {otpResendTimer > 0 ? (
                <span className={styles.resendTimer}>
                  {language === 'hi'
                    ? `${otpResendTimer}s में फिर से भेजें`
                    : `Resend in ${otpResendTimer}s`}
                </span>
              ) : (
                <button className={styles.resendButton} onClick={handleResendOtp}>
                  {language === 'hi' ? 'OTP फिर से भेजें' : 'Resend OTP'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
         PAYMENT PROCESSING
         ============================================ */}
      {step === 'processing' && (
        <div className={styles.fullScreenOverlay}>
          <div className={styles.processingContent}>
            <div className={styles.spinner} />
            <p className={styles.processingText}>
              {language === 'hi'
                ? 'Payment process हो रहा है...'
                : 'Processing payment...'}
            </p>
          </div>
        </div>
      )}

      {/* ============================================
         PAYMENT SUCCESS
         ============================================ */}
      {step === 'success' && (
        <div className={styles.fullScreenOverlay}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}><Icon name="sparkles" size={32} color="var(--color-success, #22c55e)" /></div>
            <h2 className={styles.successTitle}>
              {language === 'hi' ? 'Payment Successful!' : 'Payment Successful!'}
            </h2>
            <p className={styles.successAmount}>₹{pricing.displayAmount} paid</p>
            <p className={styles.successSub}>
              {language === 'hi'
                ? 'आपका complete remedy plan generate हो रहा है...'
                : 'Generating your complete remedy plan...'}
            </p>
            <div className={styles.successSpinner} />

            {/* Auto-transition to report after 2.5s */}
            <AutoRedirect delay={2500} onRedirect={handleViewReport} />
          </div>
        </div>
      )}

      {/* ============================================
         PAYMENT FAILURE
         ============================================ */}
      {step === 'failure' && (
        <div className={styles.fullScreenOverlay}>
          <div className={styles.failureContent}>
            <div className={styles.failureIcon}><Icon name="refresh" size={32} color="var(--color-error, #ef4444)" /></div>
            <h2 className={styles.failureTitle}>
              {language === 'hi' ? 'Payment नहीं हुआ?' : 'Payment Failed'}
            </h2>
            <p className={styles.failureSub}>
              {language === 'hi'
                ? 'दोबारा try करें।'
                : 'Please try again.'}
            </p>
            <div className={styles.failureActions}>
              <button className={styles.retryButton} onClick={handlePaymentRetry}>
                {language === 'hi' ? 'फिर से Try करें' : 'Try Again'}
              </button>
              <button className={styles.supportButton}>
                {language === 'hi' ? 'WhatsApp Support' : 'WhatsApp Support'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Auto-redirect helper
function AutoRedirect({ delay, onRedirect }: { delay: number; onRedirect: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRedirect, delay);
    return () => clearTimeout(timer);
  }, [delay, onRedirect]);
  return null;
}

export default function PaywallPage() {
  return (
    <Suspense fallback={<div className={styles.paywallLayout} />}>
      <PaywallContent />
    </Suspense>
  );
}
