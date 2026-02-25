import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, PRICING } from '@upaya/shared';
import { fp, wp, hp } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---- Types ----

type PaywallStep = 'payment_sheet' | 'auth' | 'otp_verify' | 'processing' | 'success' | 'failure';

// ---- Component ----

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    problem?: string;
    lang?: string;
    dob?: string;
    place?: string;
  }>();

  const problemType = params.problem || 'marriage_delay';
  const dob = params.dob || '';
  const place = params.place || '';

  const [language, setLanguage] = useState<'hi' | 'en'>((params.lang as 'hi' | 'en') || 'hi');
  const [step, setStep] = useState<PaywallStep>('payment_sheet');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpResendTimer, setOtpResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hp(400))).current;

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('upaya_language');
        if (stored === 'hi' || stored === 'en') setLanguage(stored);
      } catch { /* default */ }
    };
    load();
  }, []);

  // Animate in
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: hp(400), duration: 250, useNativeDriver: true }),
    ]).start(() => {
      router.back();
    });
  }, [router, fadeAnim, slideAnim]);

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
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        // Auto-navigate to report after 2.5s
        setTimeout(() => {
          router.replace({
            pathname: '/report',
            params: { problem: problemType, lang: language, dob, place },
          });
        }, 2500);
      }, 2500);
    }, 1500);
  }, [router, problemType, language, dob, place]);

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

  const handleOtpKeyPress = useCallback((index: number, key: string) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
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

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          router.replace({
            pathname: '/report',
            params: { problem: problemType, lang: language, dob, place },
          });
        }, 2500);
      }, 2500);
    }, 1000);
  }, [otpDigits, language, router, problemType, dob, place]);

  const handleResendOtp = useCallback(() => {
    setOtpResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, []);

  const handlePaymentRetry = useCallback(() => {
    setStep('payment_sheet');
    setErrorMessage('');
  }, []);

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

  // ---- Render full-screen overlays ----

  if (step === 'processing') {
    return (
      <View style={s.fullOverlay}>
        <ActivityIndicator size="large" color={colors.primary.saffron} />
        <Text style={s.processingText}>
          {language === 'hi'
            ? 'Payment process हो रहा है...'
            : 'Processing payment...'}
        </Text>
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={s.fullOverlay}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successTitle}>
          {language === 'hi' ? 'Payment Successful!' : 'Payment Successful!'}
        </Text>
        <Text style={s.successAmount}>₹{pricing.displayAmount} paid</Text>
        <Text style={s.successSub}>
          {language === 'hi'
            ? 'आपका complete remedy plan generate हो रहा है...'
            : 'Generating your complete remedy plan...'}
        </Text>
        <ActivityIndicator size="small" color={colors.primary.saffron} style={{ marginTop: hp(16) }} />
      </View>
    );
  }

  if (step === 'failure') {
    return (
      <View style={s.fullOverlay}>
        <Text style={s.failureIcon}>❌</Text>
        <Text style={s.failureTitle}>
          {language === 'hi' ? 'Payment नहीं हुआ?' : 'Payment Failed'}
        </Text>
        <Text style={s.failureSub}>
          {language === 'hi' ? 'दोबारा try करें।' : 'Please try again.'}
        </Text>
        <TouchableOpacity style={s.retryBtn} onPress={handlePaymentRetry} activeOpacity={0.8}>
          <Text style={s.retryBtnText}>
            {language === 'hi' ? 'फिर से Try करें' : 'Try Again'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.supportBtn} activeOpacity={0.7}>
          <Text style={s.supportBtnText}>WhatsApp Support</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- Bottom sheet steps ----

  return (
    <View style={s.container}>
      {/* Backdrop */}
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={s.backdropTouch} onPress={handleClose} activeOpacity={1} />
      </Animated.View>

      {/* Bottom sheet */}
      <KeyboardAvoidingView
        style={s.sheetWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.dragHandle} />

          <ScrollView
            style={s.sheetScroll}
            contentContainerStyle={s.sheetScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ===== PAYMENT SHEET ===== */}
            {step === 'payment_sheet' && (
              <>
                <Text style={s.sheetTitle}>
                  ✨ {language === 'hi'
                    ? 'Unlock Your Complete Remedy Plan'
                    : 'Unlock Your Complete Remedy Plan'}
                </Text>

                <Text style={s.inclusionsLabel}>
                  {language === 'hi' ? "What you'll get:" : "What you'll get:"}
                </Text>
                {inclusions.map((item, i) => (
                  <View key={i} style={s.inclusionItem}>
                    <Text style={s.inclusionCheck}>✅</Text>
                    <Text style={s.inclusionText}>{item}</Text>
                  </View>
                ))}

                <View style={s.priceBlock}>
                  <View style={s.priceRow}>
                    <Text style={s.priceMain}>₹{pricing.displayAmount}</Text>
                    <Text style={s.priceOriginal}>was ₹{pricing.originalDisplayAmount}</Text>
                  </View>
                  <Text style={s.priceDiscount}>
                    {pricing.discountPercent}% OFF — {language === 'hi' ? 'Introductory Price' : 'Introductory Price'}
                  </Text>
                </View>

                <TouchableOpacity style={s.payBtn} onPress={handleProceedToAuth} activeOpacity={0.8}>
                  <Text style={s.payBtnText}>
                    {language === 'hi'
                      ? `Pay ₹${pricing.displayAmount} Securely`
                      : `Pay ₹${pricing.displayAmount} Securely`}
                  </Text>
                </TouchableOpacity>

                <View style={s.securityBadges}>
                  <Text style={s.securityBadge}>
                    🔒 {language === 'hi' ? 'Secured by Razorpay' : 'Secured by Razorpay'}
                  </Text>
                  <Text style={s.securityBadge}>
                    📄 {language === 'hi' ? 'No spam. Cancel anytime.' : 'No spam. Cancel anytime.'}
                  </Text>
                </View>
              </>
            )}

            {/* ===== AUTH / LOGIN ===== */}
            {step === 'auth' && (
              <>
                <Text style={s.sheetTitle}>
                  {language === 'hi' ? 'Sign in to continue' : 'Sign in to continue'}
                </Text>
                <Text style={s.sheetSubtitle}>
                  {language === 'hi'
                    ? 'Payment के लिए login ज़रूरी है'
                    : 'Login is required for payment'}
                </Text>

                <View style={s.phoneInputGroup}>
                  <View style={s.phonePrefix}>
                    <Text style={s.phonePrefixText}>+91</Text>
                  </View>
                  <TextInput
                    style={s.phoneInput}
                    placeholder={language === 'hi' ? 'अपना mobile number डालें' : 'Enter your mobile number'}
                    placeholderTextColor={colors.neutral.grey400}
                    value={phoneNumber}
                    onChangeText={(t) => setPhoneNumber(t.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    keyboardType="number-pad"
                    autoFocus
                  />
                </View>

                {errorMessage !== '' && (
                  <Text style={s.errorText}>{errorMessage}</Text>
                )}

                <TouchableOpacity
                  style={[s.otpSendBtn, phoneNumber.length < 10 && s.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={phoneNumber.length < 10 || isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.otpSendBtnText}>
                    {language === 'hi' ? 'OTP भेजें' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>

                <View style={s.orDivider}>
                  <View style={s.orLine} />
                  <Text style={s.orText}>{language === 'hi' ? 'या' : 'OR'}</Text>
                  <View style={s.orLine} />
                </View>

                <TouchableOpacity
                  style={s.googleBtn}
                  onPress={handleGoogleLogin}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.googleIcon}>G</Text>
                  <Text style={s.googleBtnText}>
                    {language === 'hi' ? 'Google से continue करें' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ===== OTP VERIFICATION ===== */}
            {step === 'otp_verify' && (
              <>
                <Text style={s.sheetTitle}>
                  {language === 'hi' ? 'OTP Verify करें' : 'Verify OTP'}
                </Text>
                <Text style={s.sheetSubtitle}>
                  {language === 'hi'
                    ? `+91 ${phoneNumber} पर भेजा गया 6-digit code डालें`
                    : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
                </Text>

                <View style={s.otpInputGroup}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      style={[s.otpInput, digit !== '' && s.otpInputFilled]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(index, v)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {errorMessage !== '' && (
                  <Text style={s.errorText}>{errorMessage}</Text>
                )}

                <TouchableOpacity
                  style={[s.verifyBtn, otpDigits.join('').length !== 6 && s.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={otpDigits.join('').length !== 6 || isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={s.verifyBtnText}>
                    {isSubmitting
                      ? (language === 'hi' ? 'Verify हो रहा है...' : 'Verifying...')
                      : (language === 'hi' ? `Verify & Pay ₹${pricing.displayAmount}` : `Verify & Pay ₹${pricing.displayAmount}`)}
                  </Text>
                </TouchableOpacity>

                <View style={s.resendRow}>
                  {otpResendTimer > 0 ? (
                    <Text style={s.resendTimer}>
                      {language === 'hi'
                        ? `${otpResendTimer}s में फिर से भेजें`
                        : `Resend in ${otpResendTimer}s`}
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text style={s.resendBtn}>
                        {language === 'hi' ? 'OTP फिर से भेजें' : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---- Styles ----

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  /* Backdrop */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: {
    flex: 1,
  },

  /* Bottom Sheet */
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: wp(36),
    height: hp(4),
    backgroundColor: colors.neutral.grey300,
    borderRadius: wp(2),
    alignSelf: 'center',
    marginTop: hp(10),
    marginBottom: hp(6),
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetScrollContent: {
    paddingHorizontal: wp(20),
    paddingBottom: Platform.OS === 'ios' ? hp(40) : hp(24),
  },

  /* Sheet titles */
  sheetTitle: {
    fontSize: fp(18),
    fontWeight: '700',
    color: colors.neutral.grey800,
    textAlign: 'center',
    marginBottom: hp(4),
    marginTop: hp(4),
  },
  sheetSubtitle: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    textAlign: 'center',
    marginBottom: hp(16),
    lineHeight: fp(14) * 1.4,
  },

  /* Inclusions */
  inclusionsLabel: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.neutral.grey700,
    marginBottom: hp(8),
    marginTop: hp(8),
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginBottom: hp(6),
  },
  inclusionCheck: { fontSize: fp(13) },
  inclusionText: {
    fontSize: fp(14),
    color: colors.neutral.grey700,
    flex: 1,
  },

  /* Price */
  priceBlock: {
    alignItems: 'center',
    marginTop: hp(16),
    marginBottom: hp(16),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: wp(10),
  },
  priceMain: {
    fontSize: fp(28),
    fontWeight: '800',
    color: colors.neutral.grey800,
  },
  priceOriginal: {
    fontSize: fp(14),
    color: colors.neutral.grey400,
    textDecorationLine: 'line-through',
  },
  priceDiscount: {
    fontSize: fp(12),
    fontWeight: '600',
    color: colors.semantic.success,
    marginTop: hp(4),
  },

  /* Pay button */
  payBtn: {
    backgroundColor: colors.accent.gold,
    borderRadius: wp(14),
    paddingVertical: hp(14),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnText: {
    fontSize: fp(16),
    fontWeight: '700',
    color: colors.neutral.white,
  },

  /* Security badges */
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(16),
    marginTop: hp(14),
  },
  securityBadge: {
    fontSize: fp(11),
    color: colors.neutral.grey500,
  },

  /* Phone input */
  phoneInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(12),
    overflow: 'hidden',
    marginBottom: hp(8),
  },
  phonePrefix: {
    backgroundColor: colors.neutral.grey100,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    borderRightWidth: 1,
    borderRightColor: colors.neutral.grey200,
  },
  phonePrefixText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.grey600,
  },
  phoneInput: {
    flex: 1,
    fontSize: fp(15),
    color: colors.neutral.grey800,
    paddingHorizontal: wp(12),
    paddingVertical: hp(12),
  },

  /* Error */
  errorText: {
    fontSize: fp(13),
    color: colors.semantic.error,
    marginBottom: hp(8),
  },

  /* OTP Send button */
  otpSendBtn: {
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    paddingVertical: hp(13),
    alignItems: 'center',
  },
  otpSendBtnText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.white,
  },

  /* Disabled button */
  btnDisabled: {
    opacity: 0.5,
  },

  /* OR divider */
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    marginVertical: hp(16),
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.grey200,
  },
  orText: {
    fontSize: fp(13),
    color: colors.neutral.grey400,
    fontWeight: '500',
  },

  /* Google button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey200,
    borderRadius: wp(12),
    paddingVertical: hp(12),
    backgroundColor: colors.neutral.white,
  },
  googleIcon: {
    fontSize: fp(18),
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: fp(15),
    fontWeight: '500',
    color: colors.neutral.grey700,
  },

  /* OTP input */
  otpInputGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(8),
    marginBottom: hp(16),
  },
  otpInput: {
    width: wp(44),
    height: wp(52),
    borderWidth: 1.5,
    borderColor: colors.neutral.grey300,
    borderRadius: wp(10),
    textAlign: 'center',
    fontSize: fp(20),
    fontWeight: '700',
    color: colors.neutral.grey800,
    backgroundColor: colors.neutral.grey50,
  },
  otpInputFilled: {
    borderColor: colors.primary.saffron,
    backgroundColor: 'rgba(255,140,0,0.05)',
  },

  /* Verify button */
  verifyBtn: {
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    paddingVertical: hp(13),
    alignItems: 'center',
  },
  verifyBtnText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.white,
  },

  /* Resend */
  resendRow: {
    alignItems: 'center',
    marginTop: hp(12),
  },
  resendTimer: {
    fontSize: fp(13),
    color: colors.neutral.grey400,
  },
  resendBtn: {
    fontSize: fp(14),
    fontWeight: '600',
    color: colors.primary.saffron,
  },

  /* Full-screen overlays */
  fullOverlay: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(32),
  },
  processingText: {
    fontSize: fp(16),
    color: colors.neutral.grey600,
    marginTop: hp(16),
  },
  successIcon: {
    fontSize: fp(48),
    marginBottom: hp(12),
  },
  successTitle: {
    fontSize: fp(22),
    fontWeight: '700',
    color: colors.semantic.success,
    marginBottom: hp(4),
  },
  successAmount: {
    fontSize: fp(16),
    color: colors.neutral.grey600,
    marginBottom: hp(8),
  },
  successSub: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    textAlign: 'center',
    lineHeight: fp(14) * 1.4,
  },
  failureIcon: {
    fontSize: fp(48),
    marginBottom: hp(12),
  },
  failureTitle: {
    fontSize: fp(22),
    fontWeight: '700',
    color: colors.semantic.error,
    marginBottom: hp(4),
  },
  failureSub: {
    fontSize: fp(14),
    color: colors.neutral.grey500,
    marginBottom: hp(20),
  },
  retryBtn: {
    backgroundColor: colors.primary.saffron,
    borderRadius: wp(12),
    paddingVertical: hp(13),
    paddingHorizontal: wp(40),
    marginBottom: hp(10),
  },
  retryBtnText: {
    fontSize: fp(15),
    fontWeight: '600',
    color: colors.neutral.white,
  },
  supportBtn: {
    paddingVertical: hp(10),
  },
  supportBtnText: {
    fontSize: fp(14),
    fontWeight: '500',
    color: colors.semantic.success,
  },
});
