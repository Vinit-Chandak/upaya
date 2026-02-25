'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import styles from './page.module.css';

type Step = 1 | 2 | 3 | 4 | 5;

interface TempleDetails {
  nameHi: string;
  nameEn: string;
  city: string;
  state: string;
  primaryDeity: string;
  pujariName: string;
  phone: string;
}

interface PujaItem {
  id: string;
  name: string;
  deity: string;
  doshaType: string;
  description: string;
  price: string;
}

interface FormErrors {
  [key: string]: string;
}

const STEPS = [
  { num: 1 as Step, labelHi: '\u092E\u0902\u0926\u093F\u0930 Details', labelEn: 'Temple Details', emoji: '\uD83D\uDED5' },
  { num: 2 as Step, labelHi: '\u092A\u0942\u091C\u093E Catalog', labelEn: 'Puja Catalog', emoji: '\uD83D\uDCCB' },
  { num: 3 as Step, labelHi: 'Pricing', labelEn: 'Pricing', emoji: '\uD83D\uDCB0' },
  { num: 4 as Step, labelHi: 'Photos', labelEn: 'Photos', emoji: '\uD83D\uDCF7' },
  { num: 5 as Step, labelHi: 'Go Live', labelEn: 'Go Live', emoji: '\uD83D\uDE80' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const DOSHA_TYPES = [
  { value: 'mangal', labelHi: '\u092E\u0902\u0917\u0932 \u0926\u094B\u0937', labelEn: 'Mangal Dosha' },
  { value: 'shani', labelHi: '\u0936\u0928\u093F \u0926\u094B\u0937', labelEn: 'Shani Dosha' },
  { value: 'rahu', labelHi: '\u0930\u093E\u0939\u0941 \u0926\u094B\u0937', labelEn: 'Rahu Dosha' },
  { value: 'ketu', labelHi: '\u0915\u0947\u0924\u0941 \u0926\u094B\u0937', labelEn: 'Ketu Dosha' },
  { value: 'navagraha', labelHi: '\u0928\u0935\u0917\u094D\u0930\u0939', labelEn: 'Navagraha' },
  { value: 'general', labelHi: '\u0938\u093E\u092E\u093E\u0928\u094D\u092F', labelEn: 'General' },
];

function generateId() {
  return `puja_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function TempleRegisterPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 1: Temple Details
  const [templeDetails, setTempleDetails] = useState<TempleDetails>({
    nameHi: '',
    nameEn: '',
    city: '',
    state: '',
    primaryDeity: '',
    pujariName: '',
    phone: '',
  });

  // Step 2: Puja Catalog
  const [pujas, setPujas] = useState<PujaItem[]>([
    { id: generateId(), name: '', deity: '', doshaType: 'general', description: '', price: '' },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem('upaya_language') as 'hi' | 'en' | null;
    if (stored) setLanguage(stored);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    localStorage.setItem('upaya_language', newLang);
  };

  // ==========================================
  // Validation
  // ==========================================
  const validateStep = (step: Step): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!templeDetails.nameHi.trim() && !templeDetails.nameEn.trim()) {
        newErrors.templeName = language === 'hi'
          ? '\u092E\u0902\u0926\u093F\u0930 \u0915\u093E \u0928\u093E\u092E \u0921\u093E\u0932\u0947\u0902'
          : 'Please enter temple name';
      }
      if (!templeDetails.city.trim()) {
        newErrors.city = language === 'hi' ? '\u0936\u0939\u0930 \u0921\u093E\u0932\u0947\u0902' : 'Please enter city';
      }
      if (!templeDetails.state.trim()) {
        newErrors.state = language === 'hi' ? '\u0930\u093E\u091C\u094D\u092F \u091A\u0941\u0928\u0947\u0902' : 'Please select state';
      }
      if (!templeDetails.primaryDeity.trim()) {
        newErrors.deity = language === 'hi' ? '\u0926\u0947\u0935\u0924\u093E \u0915\u093E \u0928\u093E\u092E \u0921\u093E\u0932\u0947\u0902' : 'Please enter primary deity';
      }
      if (!templeDetails.pujariName.trim()) {
        newErrors.pujari = language === 'hi' ? '\u092A\u0941\u091C\u093E\u0930\u0940 \u0915\u093E \u0928\u093E\u092E \u0921\u093E\u0932\u0947\u0902' : 'Please enter pujari name';
      }
      if (!templeDetails.phone.trim() || templeDetails.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = language === 'hi' ? '\u0938\u0939\u0940 phone number \u0921\u093E\u0932\u0947\u0902' : 'Please enter valid phone number';
      }
    }

    if (step === 2) {
      const validPujas = pujas.filter((p) => p.name.trim());
      if (validPujas.length === 0) {
        newErrors.pujas = language === 'hi' ? '\u0915\u092E \u0938\u0947 \u0915\u092E 1 \u092A\u0942\u091C\u093E \u091C\u094B\u0921\u093C\u0947\u0902' : 'Please add at least 1 puja';
      }
    }

    if (step === 3) {
      const pujasWithoutPrice = pujas.filter((p) => p.name.trim() && (!p.price.trim() || isNaN(Number(p.price))));
      if (pujasWithoutPrice.length > 0) {
        newErrors.pricing = language === 'hi' ? '\u0938\u092D\u0940 \u092A\u0942\u091C\u093E\u0913\u0902 \u0915\u0940 \u0915\u0940\u092E\u0924 \u0921\u093E\u0932\u0947\u0902' : 'Please set price for all pujas';
      }
    }

    if (step === 5) {
      if (!termsAccepted) {
        newErrors.terms = language === 'hi' ? 'Terms accept \u0915\u0930\u0947\u0902' : 'Please accept terms';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (validateStep(5)) {
      setSubmitted(true);
    }
  };

  const addPuja = () => {
    setPujas([...pujas, { id: generateId(), name: '', deity: '', doshaType: 'general', description: '', price: '' }]);
  };

  const removePuja = (id: string) => {
    if (pujas.length > 1) {
      setPujas(pujas.filter((p) => p.id !== id));
    }
  };

  const updatePuja = (id: string, field: keyof PujaItem, value: string) => {
    setPujas(pujas.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const validPujas = pujas.filter((p) => p.name.trim());

  // ==========================================
  // Success State
  // ==========================================
  if (submitted) {
    return (
      <div className={styles.appLayout}>
        <TopBar showBack title={language === 'hi' ? 'Registration' : 'Registration'} onLanguageToggle={toggleLanguage} />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.successCard}>
              <span className={styles.successEmoji}>{'\u2705'}</span>
              <h1 className={styles.successTitle}>
                {language === 'hi'
                  ? 'Registration Submit \u0939\u094B \u0917\u092F\u093E!'
                  : 'Registration Submitted!'}
              </h1>
              <p className={styles.successDesc}>
                {language === 'hi'
                  ? 'Submitted for verification! \u0939\u092E 48 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 review \u0915\u0930\u0947\u0902\u0917\u0947\u0964'
                  : 'Submitted for verification! We\'ll review within 48 hours.'}
              </p>
              <div className={styles.successDetails}>
                <div className={styles.successRow}>
                  <span className={styles.successLabel}>
                    {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930' : 'Temple'}:
                  </span>
                  <span className={styles.successValue}>{templeDetails.nameHi || templeDetails.nameEn}</span>
                </div>
                <div className={styles.successRow}>
                  <span className={styles.successLabel}>
                    {language === 'hi' ? '\u0936\u0939\u0930' : 'City'}:
                  </span>
                  <span className={styles.successValue}>{templeDetails.city}, {templeDetails.state}</span>
                </div>
                <div className={styles.successRow}>
                  <span className={styles.successLabel}>
                    {language === 'hi' ? '\u092A\u0942\u091C\u093E\u090F\u0902' : 'Pujas'}:
                  </span>
                  <span className={styles.successValue}>{validPujas.length}</span>
                </div>
              </div>
              <button className={styles.successButton} onClick={() => router.push('/temple-cms')}>
                {language === 'hi' ? 'Dashboard \u092A\u0930 \u091C\u093E\u090F\u0902' : 'Go to Dashboard'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // Registration Wizard
  // ==========================================
  return (
    <div className={styles.appLayout}>
      <TopBar showBack title={language === 'hi' ? 'Temple Registration' : 'Temple Registration'} onLanguageToggle={toggleLanguage} />

      {/* Step Indicators */}
      <div className={styles.stepIndicators}>
        <div className={styles.stepIndicatorsInner}>
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={`${styles.stepIndicator} ${currentStep === step.num ? styles.stepIndicatorActive : ''} ${currentStep > step.num ? styles.stepIndicatorDone : ''}`}
            >
              <div className={styles.stepDot}>
                {currentStep > step.num ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{step.num}</span>
                )}
              </div>
              <span className={styles.stepLabel}>
                {language === 'hi' ? step.labelHi : step.labelEn}
              </span>
            </div>
          ))}
          {/* Progress line */}
          <div className={styles.stepProgressLine}>
            <div
              className={styles.stepProgressFill}
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* ============ Step 1: Temple Details ============ */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {language === 'hi' ? 'Step 1: \u092E\u0902\u0926\u093F\u0930 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940' : 'Step 1: Temple Details'}
              </h2>
              <p className={styles.stepSubtitle}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u0947 \u092E\u0902\u0926\u093F\u0930 \u0915\u0940 basic \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0926\u0947\u0902'
                  : 'Provide basic information about your temple'}
              </p>

              <div className={styles.formFields}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930 \u0915\u093E \u0928\u093E\u092E (\u0939\u093F\u0902\u0926\u0940)' : 'Temple Name (Hindi)'}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={templeDetails.nameHi}
                      onChange={(e) => setTempleDetails({ ...templeDetails, nameHi: e.target.value })}
                      placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u0936\u094D\u0930\u0940 \u092E\u0902\u0917\u0932\u0928\u093E\u0925 \u092E\u0902\u0926\u093F\u0930' : 'e.g. Shri Mangalnath Mandir'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930 \u0915\u093E \u0928\u093E\u092E (English)' : 'Temple Name (English)'}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={templeDetails.nameEn}
                      onChange={(e) => setTempleDetails({ ...templeDetails, nameEn: e.target.value })}
                      placeholder="e.g. Shri Mangalnath Temple"
                    />
                  </div>
                </div>
                {errors.templeName && <span className={styles.formError}>{errors.templeName}</span>}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'hi' ? '\u0936\u0939\u0930' : 'City'}
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={templeDetails.city}
                      onChange={(e) => setTempleDetails({ ...templeDetails, city: e.target.value })}
                      placeholder={language === 'hi' ? '\u0909\u0926\u093E. Ujjain' : 'e.g. Ujjain'}
                    />
                    {errors.city && <span className={styles.formError}>{errors.city}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'hi' ? '\u0930\u093E\u091C\u094D\u092F' : 'State'}
                    </label>
                    <select
                      className={styles.formSelect}
                      value={templeDetails.state}
                      onChange={(e) => setTempleDetails({ ...templeDetails, state: e.target.value })}
                    >
                      <option value="">{language === 'hi' ? '\u0930\u093E\u091C\u094D\u092F \u091A\u0941\u0928\u0947\u0902' : 'Select State'}</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <span className={styles.formError}>{errors.state}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? '\u092A\u094D\u0930\u092E\u0941\u0916 \u0926\u0947\u0935\u0924\u093E' : 'Primary Deity'}
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={templeDetails.primaryDeity}
                    onChange={(e) => setTempleDetails({ ...templeDetails, primaryDeity: e.target.value })}
                    placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u0936\u094D\u0930\u0940 \u092E\u0902\u0917\u0932\u0928\u093E\u0925 (\u092E\u0902\u0917\u0932 \u0917\u094D\u0930\u0939)' : 'e.g. Lord Mangalnath (Mars)'}
                  />
                  {errors.deity && <span className={styles.formError}>{errors.deity}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? '\u092A\u0941\u091C\u093E\u0930\u0940 / \u092E\u0939\u0902\u0924 \u0915\u093E \u0928\u093E\u092E' : 'Pujari / Head Priest Name'}
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={templeDetails.pujariName}
                    onChange={(e) => setTempleDetails({ ...templeDetails, pujariName: e.target.value })}
                    placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u092A\u0902\u0921\u093F\u0924 \u0930\u093E\u092E\u0915\u0943\u0937\u094D\u0923 \u0936\u0930\u094D\u092E\u093E' : 'e.g. Pandit Ramkrishna Sharma'}
                  />
                  {errors.pujari && <span className={styles.formError}>{errors.pujari}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'hi' ? 'Phone Number' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    className={styles.formInput}
                    value={templeDetails.phone}
                    onChange={(e) => setTempleDetails({ ...templeDetails, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <span className={styles.formError}>{errors.phone}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ============ Step 2: Puja Catalog ============ */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {language === 'hi' ? 'Step 2: \u092A\u0942\u091C\u093E Catalog' : 'Step 2: Puja Catalog'}
              </h2>
              <p className={styles.stepSubtitle}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u0947 \u092E\u0902\u0926\u093F\u0930 \u092E\u0947\u0902 \u0915\u094C\u0928-\u0915\u094C\u0928 \u0938\u0940 \u092A\u0942\u091C\u093E\u090F\u0902 \u0939\u094B\u0924\u0940 \u0939\u0948\u0902?'
                  : 'What pujas does your temple offer?'}
              </p>
              {errors.pujas && <span className={styles.formError}>{errors.pujas}</span>}

              <div className={styles.pujaFormList}>
                {pujas.map((puja, index) => (
                  <div key={puja.id} className={styles.pujaFormCard}>
                    <div className={styles.pujaFormHeader}>
                      <span className={styles.pujaFormNum}>
                        {language === 'hi' ? `\u092A\u0942\u091C\u093E ${index + 1}` : `Puja ${index + 1}`}
                      </span>
                      {pujas.length > 1 && (
                        <button
                          className={styles.removePujaButton}
                          onClick={() => removePuja(puja.id)}
                        >
                          {language === 'hi' ? '\u0939\u091F\u093E\u090F\u0902' : 'Remove'}
                        </button>
                      )}
                    </div>
                    <div className={styles.pujaFormFields}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'hi' ? '\u092A\u0942\u091C\u093E \u0915\u093E \u0928\u093E\u092E' : 'Puja Name'}
                        </label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={puja.name}
                          onChange={(e) => updatePuja(puja.id, 'name', e.target.value)}
                          placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u092E\u0902\u0917\u0932 \u0926\u094B\u0937 \u0928\u093F\u0935\u093E\u0930\u0923 \u092A\u0942\u091C\u093E' : 'e.g. Mangal Dosha Nivaran Puja'}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            {language === 'hi' ? '\u0926\u0947\u0935\u0924\u093E' : 'Deity'}
                          </label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={puja.deity}
                            onChange={(e) => updatePuja(puja.id, 'deity', e.target.value)}
                            placeholder={language === 'hi' ? '\u0909\u0926\u093E. \u092E\u0902\u0917\u0932 \u0917\u094D\u0930\u0939' : 'e.g. Mars'}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            {language === 'hi' ? '\u0926\u094B\u0937 Type' : 'Dosha Type'}
                          </label>
                          <select
                            className={styles.formSelect}
                            value={puja.doshaType}
                            onChange={(e) => updatePuja(puja.id, 'doshaType', e.target.value)}
                          >
                            {DOSHA_TYPES.map((dt) => (
                              <option key={dt.value} value={dt.value}>
                                {language === 'hi' ? dt.labelHi : dt.labelEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'hi' ? '\u0935\u093F\u0935\u0930\u0923' : 'Description'}
                        </label>
                        <textarea
                          className={styles.formTextarea}
                          value={puja.description}
                          onChange={(e) => updatePuja(puja.id, 'description', e.target.value)}
                          placeholder={language === 'hi'
                            ? '\u092A\u0942\u091C\u093E \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092C\u0924\u093E\u090F\u0902...'
                            : 'Describe this puja...'}
                          rows={2}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'hi' ? '\u0915\u0940\u092E\u0924 (₹)' : 'Price (₹)'}
                        </label>
                        <input
                          type="number"
                          className={styles.formInput}
                          value={puja.price}
                          onChange={(e) => updatePuja(puja.id, 'price', e.target.value)}
                          placeholder="2100"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.addPujaBtn} onClick={addPuja}>
                + {language === 'hi' ? '\u0914\u0930 \u092A\u0942\u091C\u093E \u091C\u094B\u0921\u093C\u0947\u0902' : 'Add Another Puja'}
              </button>
            </div>
          )}

          {/* ============ Step 3: Pricing ============ */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {language === 'hi' ? 'Step 3: Pricing Review' : 'Step 3: Review Pricing'}
              </h2>
              <p className={styles.stepSubtitle}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u0940 \u092A\u0942\u091C\u093E\u0913\u0902 \u0915\u0940 \u0915\u0940\u092E\u0924 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0915\u0930\u0947\u0902 \u0914\u0930 \u091C\u0930\u0942\u0930\u0924 \u0939\u094B \u0924\u094B \u092C\u0926\u0932\u0947\u0902'
                  : 'Review and adjust your puja pricing'}
              </p>
              {errors.pricing && <span className={styles.formError}>{errors.pricing}</span>}

              <div className={styles.pricingTable}>
                <div className={styles.pricingHeader}>
                  <span className={styles.pricingHeaderCell}>
                    {language === 'hi' ? '\u092A\u0942\u091C\u093E' : 'Puja'}
                  </span>
                  <span className={styles.pricingHeaderCell}>
                    {language === 'hi' ? '\u0915\u0940\u092E\u0924' : 'Price'}
                  </span>
                  <span className={styles.pricingHeaderCell}>
                    {language === 'hi' ? '\u0906\u092A\u0915\u093E Share (70%)' : 'Your Share (70%)'}
                  </span>
                </div>
                {pujas.filter((p) => p.name.trim()).map((puja) => {
                  const price = Number(puja.price) || 0;
                  const share = Math.round(price * 0.7);
                  return (
                    <div key={puja.id} className={styles.pricingRow}>
                      <span className={styles.pricingCell}>{puja.name}</span>
                      <div className={styles.pricingCellInput}>
                        <span className={styles.rupeePrefix}>₹</span>
                        <input
                          type="number"
                          className={styles.pricingInput}
                          value={puja.price}
                          onChange={(e) => updatePuja(puja.id, 'price', e.target.value)}
                          min="0"
                        />
                      </div>
                      <span className={styles.pricingCellShare}>₹{share.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.pricingNote}>
                <span className={styles.pricingNoteIcon}>{'\u2139\uFE0F'}</span>
                <span className={styles.pricingNoteText}>
                  {language === 'hi'
                    ? 'Upaya 30% platform fee \u0932\u0947\u0924\u093E \u0939\u0948\u0964 \u092C\u093E\u0915\u0940 70% \u0906\u092A\u0915\u093E\u0964'
                    : 'Upaya charges a 30% platform fee. You receive the remaining 70%.'}
                </span>
              </div>
            </div>
          )}

          {/* ============ Step 4: Photos ============ */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {language === 'hi' ? 'Step 4: Photos' : 'Step 4: Photos'}
              </h2>
              <p className={styles.stepSubtitle}>
                {language === 'hi'
                  ? '\u0905\u092A\u0928\u0947 \u092E\u0902\u0926\u093F\u0930 \u0914\u0930 \u092A\u0941\u091C\u093E\u0930\u0940 \u0915\u0940 \u0924\u0938\u094D\u0935\u0940\u0930\u0947\u0902 upload \u0915\u0930\u0947\u0902'
                  : 'Upload photos of your temple and priest'}
              </p>

              <div className={styles.photoUploadSection}>
                <h3 className={styles.photoSectionTitle}>
                  {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930 \u0915\u0940 \u0924\u0938\u094D\u0935\u0940\u0930\u0947\u0902' : 'Temple Photos'}
                </h3>
                <div className={styles.photoGrid}>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className={styles.photoPlaceholder}>
                      <svg className={styles.photoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className={styles.photoPlaceholderText}>
                        {language === 'hi' ? `Photo ${num}` : `Photo ${num}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.photoUploadSection}>
                <h3 className={styles.photoSectionTitle}>
                  {language === 'hi' ? '\u092A\u0941\u091C\u093E\u0930\u0940 \u0915\u0940 \u0924\u0938\u094D\u0935\u0940\u0930' : 'Pujari Photo'}
                </h3>
                <div className={styles.photoGrid}>
                  <div className={styles.photoPlaceholder}>
                    <svg className={styles.photoIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className={styles.photoPlaceholderText}>
                      {language === 'hi' ? '\u092A\u0941\u091C\u093E\u0930\u0940 Photo' : 'Pujari Photo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.pricingNote}>
                <span className={styles.pricingNoteIcon}>{'\uD83D\uDCF7'}</span>
                <span className={styles.pricingNoteText}>
                  {language === 'hi'
                    ? 'Photo upload feature \u091C\u0932\u094D\u0926 \u0906 \u0930\u0939\u093E \u0939\u0948\u0964 \u0905\u092D\u0940 skip \u0915\u0930\u0915\u0947 \u0906\u0917\u0947 \u092C\u0922\u093C\u0947\u0902\u0964'
                    : 'Photo upload feature coming soon. You can skip this step for now.'}
                </span>
              </div>
            </div>
          )}

          {/* ============ Step 5: Review & Go Live ============ */}
          {currentStep === 5 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {language === 'hi' ? 'Step 5: Review & Go Live' : 'Step 5: Review & Go Live'}
              </h2>
              <p className={styles.stepSubtitle}>
                {language === 'hi'
                  ? '\u0938\u092D\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0915\u0930\u0947\u0902 \u0914\u0930 submit \u0915\u0930\u0947\u0902'
                  : 'Review all information and submit for verification'}
              </p>

              {/* Temple Summary */}
              <div className={styles.reviewCard}>
                <h3 className={styles.reviewCardTitle}>
                  {language === 'hi' ? '\u092E\u0902\u0926\u093F\u0930 Details' : 'Temple Details'}
                </h3>
                <div className={styles.reviewRows}>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{language === 'hi' ? '\u0928\u093E\u092E' : 'Name'}:</span>
                    <span className={styles.reviewValue}>
                      {templeDetails.nameHi || templeDetails.nameEn || '\u2014'}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{language === 'hi' ? '\u0938\u094D\u0925\u093E\u0928' : 'Location'}:</span>
                    <span className={styles.reviewValue}>
                      {templeDetails.city && templeDetails.state
                        ? `${templeDetails.city}, ${templeDetails.state}`
                        : '\u2014'}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{language === 'hi' ? '\u0926\u0947\u0935\u0924\u093E' : 'Deity'}:</span>
                    <span className={styles.reviewValue}>{templeDetails.primaryDeity || '\u2014'}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{language === 'hi' ? '\u092A\u0941\u091C\u093E\u0930\u0940' : 'Pujari'}:</span>
                    <span className={styles.reviewValue}>{templeDetails.pujariName || '\u2014'}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Phone:</span>
                    <span className={styles.reviewValue}>{templeDetails.phone || '\u2014'}</span>
                  </div>
                </div>
              </div>

              {/* Puja Summary */}
              <div className={styles.reviewCard}>
                <h3 className={styles.reviewCardTitle}>
                  {language === 'hi' ? '\u092A\u0942\u091C\u093E Catalog' : 'Puja Catalog'}
                  <span className={styles.reviewCount}> ({validPujas.length})</span>
                </h3>
                <div className={styles.reviewPujaList}>
                  {validPujas.map((puja) => (
                    <div key={puja.id} className={styles.reviewPujaItem}>
                      <span className={styles.reviewPujaName}>{puja.name}</span>
                      <span className={styles.reviewPujaPrice}>
                        ₹{Number(puja.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {validPujas.length === 0 && (
                    <span className={styles.reviewEmpty}>
                      {language === 'hi' ? '\u0915\u094B\u0908 \u092A\u0942\u091C\u093E \u0928\u0939\u0940\u0902 \u091C\u094B\u0921\u093C\u0940 \u0917\u0908' : 'No pujas added'}
                    </span>
                  )}
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className={styles.termsSection}>
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    className={styles.termsCheckbox}
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span className={styles.termsText}>
                    {language === 'hi'
                      ? '\u092E\u0948\u0902 Upaya \u0915\u0940 Terms of Service \u0914\u0930 Temple Partner Agreement \u0938\u0947 \u0938\u0939\u092E\u0924 \u0939\u0942\u0901\u0964 30% platform fee applicable.'
                      : 'I agree to Upaya\'s Terms of Service and Temple Partner Agreement. 30% platform fee applicable.'}
                  </span>
                </label>
                {errors.terms && <span className={styles.formError}>{errors.terms}</span>}
              </div>
            </div>
          )}

          {/* ============ Navigation Buttons ============ */}
          <div className={styles.navButtons}>
            {currentStep > 1 && (
              <button className={styles.navButtonBack} onClick={handlePrev}>
                {language === 'hi' ? '\u2190 \u092A\u093F\u091B\u0932\u093E' : '\u2190 Back'}
              </button>
            )}
            <div className={styles.navButtonSpacer} />
            {currentStep < 5 ? (
              <button className={styles.navButtonNext} onClick={handleNext}>
                {language === 'hi' ? '\u0906\u0917\u0947 \u2192' : 'Next \u2192'}
              </button>
            ) : (
              <button className={styles.navButtonSubmit} onClick={handleSubmit}>
                {language === 'hi' ? 'Submit for Review' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
