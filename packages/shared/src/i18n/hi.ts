/**
 * Hindi translations — Primary language for Upaya
 * All strings are native Hindi, NOT translated from English.
 */
export const hi = {
  // --- Common ---
  common: {
    appName: 'Upaya',
    tagline: 'आपका spiritual problem solver',
    loading: 'लोड हो रहा है...',
    error: 'कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।',
    retry: 'फिर से कोशिश करें',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    done: 'हो गया',
    next: 'आगे बढ़ें',
    back: 'वापस',
    close: 'बंद करें',
    skip: 'Skip',
    seeAll: 'सभी देखें',
    free: 'मुफ़्त',
    comingSoon: 'जल्द आ रहा है',
    yes: 'हाँ',
    no: 'नहीं',
  },

  // --- Splash Screen ---
  splash: {
    tagline: 'आपका spiritual problem solver',
  },

  // --- Language Selection ---
  language: {
    title: 'अपनी भाषा चुनें',
    subtitle: 'Choose your preferred language',
    hindi: 'हिन्दी',
    hindiSub: 'Hindi',
    english: 'English',
    englishSub: 'अंग्रेज़ी',
    tamil: 'தமிழ்',
    telugu: 'తెలుగు',
    changeAnytime: 'आप इसे कभी भी Settings में बदल सकते हैं',
  },

  // --- Onboarding ---
  onboarding: {
    screen1: {
      title: 'हमने आप जैसे लोगों की मदद की है',
      story: {
        name: 'प्रिया, 28, लखनऊ',
        text: '4 साल से शादी के रिश्ते आ के टूट रहे थे। सबने कहा मंगल दोष है, लेकिन कोई solution नहीं बताया।\n\nUpaya ने कुंडली analyze की → exact problem मिली → मंगलनाथ Temple में specific पूजा suggest की।\n\n5 महीने में रिश्ता पक्का हुआ।',
      },
    },
    screen2: {
      title: 'Upaya कैसे काम करता है',
      step1: {
        title: 'अपनी problem बताएं',
        description: 'AI empathetically समझेगा',
      },
      step2: {
        title: 'AI आपकी कुंडली analyze करे',
        description: 'Exact ग्रह और दोष ढूंढेगा',
      },
      step3: {
        title: 'Personalized remedy plan',
        description: 'Specific मंत्र, temples, timing — सब कुछ tailored',
      },
      step4: {
        title: 'Temple पूजा + Video proof',
        description: 'Real पूजा at real temple, video delivered, प्रसाद shipped',
      },
      tagline: 'Diagnosis से लेकर remedy execution तक — सब एक जगह',
    },
    screen3: {
      title: 'आपका spiritual problem solver',
      badges: {
        kundlis: 'कुंडलियाँ analyzed',
        temples: 'Temples verified',
        video: 'हर पूजा का Video proof',
        prasad: 'प्रसाद delivered at home',
        private: '100% Private & Secure',
        pandit: 'Pandit verified',
      },
      testimonial: {
        text: 'पहली बार लगा कि किसी ने सच में समझा और सही रास्ता बताया',
        author: 'राहुल S., दिल्ली',
      },
      cta: 'शुरू करें',
      ctaSub: 'Free कुंडली analysis · No login required',
    },
    nextButton: 'आगे बढ़ें',
  },

  // --- Home / Chat Entry ---
  home: {
    greeting: 'Welcome back, {{name}} 🙏',
    mainPrompt: 'आज आपको क्या परेशान कर रहा है?',
    mainPromptSub: 'Tell me what\'s worrying you today',
    inputPlaceholder: 'अपनी बात यहाँ लिखें...',
    returningUser: {
      continueChat: 'पिछली chat जारी रखें',
      newProblem: 'नई Problem',
      activeProtocol: 'आपका Active Remedy Plan',
      transitAlert: 'Transit Alert',
      viewDetails: 'Details देखें',
      recent: 'हाल की बातचीत',
    },
  },

  // --- Problem Chips ---
  problems: {
    marriage_delay: 'शादी में देरी',
    career_stuck: 'करियर में रुकावट',
    money_problems: 'पैसे की समस्या',
    health_issues: 'स्वास्थ्य समस्या',
    legal_matters: 'कानूनी विवाद',
    family_conflict: 'पारिवारिक कलह',
    get_kundli: 'कुंडली बनवाएं',
    something_else: 'कुछ और पूछना है',
  },

  // --- Chat ---
  chat: {
    typingIndicator: 'टाइप कर रहा है...',
    inputPlaceholder: 'अपनी बात यहाँ लिखें...',
    voiceHint: 'बोलकर बताएं',
    birthDetailsCta: 'अपनी Birth Details दें',
    birthDetailsSub: '2 minute में कुंडली तैयार',
  },

  // --- AI Chat Messages (Templates) ---
  aiMessages: {
    qualifyingQuestions: {
      marriage_delay: 'शादी में देरी — मैं समझ सकता हूँ यह कितना मुश्किल है, आपके लिए भी और family के लिए भी।\n\nमुझे थोड़ा और बताएं — कब से यह चल रहा है?',
      career_stuck: 'करियर में रुकावट — मैं समझता हूँ कि effort लगाने के बाद भी progress न हो तो कितना frustrating होता है।\n\nकब से same position में हैं?',
      money_problems: 'पैसों की problem — मैं समझता हूँ यह कितना stressful होता है।\n\nयह sudden हुआ या धीरे-धीरे?',
      health_issues: 'स्वास्थ्य की चिंता — मैं समझता हूँ यह कितना परेशान करने वाला है।\n\nकब से यह health issue है?',
      legal_matters: 'कानूनी मामला — मैं समझता हूँ यह कितना तनावपूर्ण होता है।\n\nकिस type का matter है?',
      family_conflict: 'परिवार में तनाव — मैं समझता हूँ यह कितना दिल दुखाने वाला है।\n\nकब से यह tension है?',
      get_kundli: 'ज़रूर! आपकी कुंडली बनाने के लिए मुझे birth details चाहिए।',
      something_else: 'बिल्कुल, मैं सुन रहा हूँ। थोड़ा और बताएं — क्या problem है?',
    },
    durationChips: {
      lessThanYear: '< 1 साल',
      oneToThreeYears: '1-3 साल',
      moreThanThreeYears: '3+ साल',
    },
    moneyChips: {
      sudden: 'अचानक',
      gradually: 'धीरे-धीरे',
      always: 'हमेशा से',
    },
    healthChips: {
      recent: 'हाल ही में',
      fewMonths: 'कुछ महीने',
      longTime: 'काफ़ी समय से',
    },
    legalChips: {
      property: 'Property',
      family: 'Family',
      business: 'Business',
      other: 'Other',
    },
  },

  // --- Curiosity Bridge Templates ---
  curiosityBridge: {
    marriage_delay:
      '{{duration}} से रिश्ते आके टूटना — यह एक specific pattern है जो बहुत cases में दिखता है।\n\n💡 अक्सर यह तब होता है जब कोई planetary combination directly 7th house (marriage house) को affect कर रहा हो। यह permanent नहीं होता — सही remedies से इसके effects significantly कम होते हैं।\n\nमैं आपकी exact कुंडली से confirm कर सकता हूँ कि कौनसा ग्रह यह कर रहा है और क्या remedy सबसे effective होगी।',
    career_stuck:
      '{{duration}} से करियर में रुकावट — despite effort — यह अक्सर तब होता है जब 10th house (career house) या उसके lord पे कोई ग्रह pressure डाल रहा हो। यह temporary phase होता है और specific remedies से breakthrough possible है।',
    money_problems:
      'Financial instability का pattern अक्सर 2nd house (wealth) या 11th house (income) के planets से जुड़ा होता है। कुंडली से पता चलता है कि कौनसा ग्रह pressure डाल रहा है और कैसे fix करना है।',
    health_issues:
      'Health issues frequently connect to 6th house afflictions in the chart. Understanding which planet is causing this helps identify the most effective remedies — both spiritual and practical.',
    legal_matters:
      'कानूनी विवाद अक्सर 6th house (litigation) या 8th house में planetary combinations से linked होते हैं। कुंडली analysis से पता चलता है कि कब favorable period आएगा और कौनसी remedies case के outcome को positively influence कर सकती हैं।',
    family_conflict:
      'Family में ongoing tension अक्सर 4th house (domestic peace) पे ग्रह influence से होती है। Specific remedies से घर का माहौल significantly improve हो सकता है।',
  },

  // --- Birth Details ---
  birthDetails: {
    title: 'Birth Details',
    subtitle: 'Accurate कुंडली के लिए ये details ज़रूरी हैं:',
    dateOfBirth: 'जन्म तिथि',
    dateFormat: 'DD / MM / YYYY',
    timeOfBirth: 'जन्म का समय',
    timeFormat: 'HH : MM',
    unknownTime: 'Exact time नहीं पता?',
    unknownTimeSub: 'Approximate use करेंगे',
    approximateTime: {
      morning: 'सुबह (6 AM - 12 PM)',
      afternoon: 'दोपहर (12 PM - 4 PM)',
      evening: 'शाम (4 PM - 8 PM)',
      night: 'रात (8 PM - 6 AM)',
      dontKnow: 'बिल्कुल नहीं पता',
    },
    approximateNote:
      'Approximate time से भी कुंडली बनती है, लेकिन exact time से ज़्यादा accurate होती है।',
    placeOfBirth: 'जन्म स्थान',
    placeSearch: 'शहर/गाँव खोजें...',
    generateButton: 'मेरी कुंडली बनाएं',
    generateButtonSub: 'Generate My Kundli',
  },

  // --- Kundli Animation ---
  kundliAnimation: {
    phase1: 'आपकी कुंडली बन रही है...',
    phase1Sub: 'Computing planetary positions for {{date}}, {{time}}, {{place}}...',
    phase2: 'ग्रह Scan हो रहे हैं...',
    phase2PlanetsFound: '{{count}} ग्रह {{house}}th house में मिले...',
    phase3: 'दोष Analysis हो रहा है...',
    phase3Checks: {
      mangal: 'मंगल दोष check कर रहे हैं...',
      shani: 'शनि दोष check कर रहे हैं...',
      rahuKetu: 'राहु-केतु दोष check कर रहे हैं...',
      kaalSarp: 'काल सर्प योग check कर रहे हैं...',
      pitra: 'पितृ दोष check कर रहे हैं...',
      dasha: 'दशा periods analyze कर रहे हैं...',
      severity: 'Severity compute कर रहे हैं...',
    },
    phase4: 'Analysis Complete',
    phase4Sub: 'आपकी कुंडली analysis तैयार है',
    viewDiagnosis: 'अपनी Diagnosis देखें',
  },

  // --- Free Diagnosis ---
  diagnosis: {
    title: 'आपकी कुंडली Diagnosis',
    rootCause: 'Root Cause Identified',
    currentDasha: 'Currently running:',
    dashaUntil: 'active until {{date}}',
    impactedAreas: 'Impacted Areas',
    primary: 'Primary',
    secondary: 'Secondary',
    doshaAssessment: 'Dosha Assessment',
    doshaLevel: 'Dosha Level',
    commonlyAddressed: 'Commonly addressed?',
    responsiveToRemedies: 'Responsive to remedies?',
    severity: {
      significant: 'Significant',
      moderate: 'Moderate',
      mild: 'Mild',
    },
    responsiveness: {
      highly_responsive: 'Highly responsive',
      responsive: 'Responsive',
      moderately_responsive: 'Moderately responsive',
    },
  },

  // --- Free Remedies ---
  freeRemedies: {
    title: 'आज ही अपनी Remedies शुरू करें (FREE)',
    subtitle:
      'ये remedies आप आज ही शुरू कर सकते हैं — बिल्कुल free। इन्हें शुरू करने से planetary pressure कम होने लगता है।',
    addToTracker: 'Tracker में Add करें',
    listenPronunciation: 'उच्चारण सुनें',
    frequency: 'कितनी बार',
    duration: 'कितने दिन',
  },

  // --- Paywall ---
  paywall: {
    title: 'Complete Remedy Plan Unlock करें',
    lockedItems: {
      detailedAnalysis: 'Detailed दोष analysis + planetary positions',
      timeline: 'Exact timeline कब effects कम होंगे',
      templeRecommendation: 'Specific temple + पूजा recommendation',
      muhurta: 'Best muhurta (auspicious timing) for remedies',
      products: 'Recommended gemstones + yantra + rudraksha',
      protocol: '9-week complete remedy protocol',
    },
    socialProof: '{{count}} users with similar charts ने unlock किया',
    price: '₹199',
    originalPrice: '₹499',
    discount: '60% OFF',
    unlockButton: 'Complete Plan Unlock करें — ₹199',
  },

  // --- Authentication ---
  auth: {
    signInTitle: 'Sign in to continue',
    phone: {
      label: 'Phone Number',
      placeholder: 'अपना mobile number डालें',
      sendOtp: 'OTP भेजें',
    },
    otp: {
      title: 'OTP Verify करें',
      subtitle: '{{phone}} पर भेजा गया 6-digit code डालें',
      resend: 'OTP फिर से भेजें',
      resendIn: '{{seconds}}s में फिर से भेजें',
    },
    google: 'Google से continue करें',
    or: 'या',
  },

  // --- Payment ---
  payment: {
    success: {
      title: 'Payment Successful!',
      subtitle: '₹199 paid। आपका complete remedy plan generate हो रहा है...',
    },
    failure: {
      title: 'Payment नहीं हुआ?',
      subtitle: 'दोबारा try करें।',
      retry: 'फिर से Try करें',
      support: 'WhatsApp Support',
    },
  },

  // --- Bottom Tabs ---
  tabs: {
    home: 'Home',
    remedies: 'Remedies',
    explore: 'Explore',
    me: 'Me',
  },

  // --- Errors ---
  errors: {
    networkError: 'Internet connection check करें और फिर से try करें',
    serverError: 'Server में कुछ problem है। कृपया थोड़ी देर बाद try करें',
    sessionExpired: 'Session expire हो गया। कृपया फिर से login करें',
  },
} as const;

/** Recursively maps all leaf values in T to string */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? DeepStringify<T[K]>
      : T[K];
};

export type TranslationKeys = DeepStringify<typeof hi>;
