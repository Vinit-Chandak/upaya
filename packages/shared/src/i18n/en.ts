import type { TranslationKeys } from './hi';

/**
 * English translations — Secondary language for Upaya
 */
export const en: TranslationKeys = {
  // --- Common ---
  common: {
    appName: 'Upaya',
    tagline: 'Your spiritual problem solver',
    loading: 'Loading...',
    error: 'Something went wrong. Please try again.',
    retry: 'Try Again',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    next: 'Next',
    back: 'Back',
    close: 'Close',
    skip: 'Skip',
    seeAll: 'See All',
    free: 'Free',
    comingSoon: 'Coming Soon',
    yes: 'Yes',
    no: 'No',
  },

  // --- Splash Screen ---
  splash: {
    tagline: 'Your spiritual problem solver',
  },

  // --- Language Selection ---
  language: {
    title: 'Choose your preferred language',
    subtitle: 'अपनी भाषा चुनें',
    hindi: 'हिन्दी',
    hindiSub: 'Hindi',
    english: 'English',
    englishSub: 'अंग्रेज़ी',
    tamil: 'தமிழ்',
    telugu: 'తెలుగు',
    changeAnytime: 'You can change this anytime in Settings',
  },

  // --- Onboarding ---
  onboarding: {
    screen1: {
      title: "We've Helped People Like You",
      story: {
        name: 'Priya, 28, Lucknow',
        text: "Marriage talks kept falling apart for 4 years. Everyone said it's Mangal Dosha but nobody gave a real solution.\n\nUpaya analyzed my chart, found the exact cause, and recommended a specific puja at Mangalnath Temple.\n\nGot married within 5 months.",
      },
    },
    screen2: {
      title: 'How Upaya Works',
      step1: {
        title: 'Tell your problem',
        description: 'AI understands empathetically',
      },
      step2: {
        title: 'AI analyzes your kundli',
        description: 'Finds exact planets and doshas',
      },
      step3: {
        title: 'Personalized remedy plan',
        description: 'Specific mantras, temples, timing — all tailored',
      },
      step4: {
        title: 'Temple puja + Video proof',
        description: 'Real puja at real temple, video delivered, prasad shipped',
      },
      tagline: 'From diagnosis to remedy execution — all in one place',
    },
    screen3: {
      title: 'Your spiritual problem solver',
      badges: {
        kundlis: 'Kundlis analyzed',
        temples: 'Temples verified',
        video: 'Video proof of every puja',
        prasad: 'Prasad delivered home',
        private: '100% Private & Secure',
        pandit: 'Pandit verified',
      },
      testimonial: {
        text: 'For the first time, I felt truly understood and guided on the right path',
        author: 'Rahul S., Delhi',
      },
      cta: 'Get Started',
      ctaSub: 'Free kundli analysis · No login required',
    },
    nextButton: 'Next',
  },

  // --- Home / Chat Entry ---
  home: {
    greeting: 'Welcome back, {{name}} 🙏',
    mainPrompt: "Tell me what's worrying you today",
    mainPromptSub: 'आज आपको क्या परेशान कर रहा है?',
    inputPlaceholder: 'Type your concern here...',
    returningUser: {
      continueChat: 'Continue last chat',
      newProblem: 'New Problem',
      activeProtocol: 'Your Active Remedy Plan',
      transitAlert: 'Transit Alert',
      viewDetails: 'View Details',
      recent: 'Recent conversations',
    },
  },

  // --- Problem Chips ---
  problems: {
    marriage_delay: 'Marriage Delay',
    career_stuck: 'Career Stuck',
    money_problems: 'Money Problems',
    health_issues: 'Health Issues',
    legal_matters: 'Legal Matters',
    family_conflict: 'Family Conflict',
    get_kundli: 'Get My Kundli',
    something_else: 'Something Else',
  },

  // --- Chat ---
  chat: {
    typingIndicator: 'Typing...',
    inputPlaceholder: 'Type your concern here...',
    voiceHint: 'Speak to share',
    birthDetailsCta: 'Share your Birth Details',
    birthDetailsSub: 'Kundli ready in 2 minutes',
  },

  // --- AI Chat Messages (Templates) ---
  aiMessages: {
    qualifyingQuestions: {
      marriage_delay:
        "Marriage delay — I understand how difficult this must be, for you and your family.\n\nTell me a bit more — how long has this been going on?",
      career_stuck:
        "Career stuck — I understand how frustrating it is when progress doesn't come despite your efforts.\n\nHow long have you been in the same position?",
      money_problems:
        "Money problems — I understand how stressful this can be.\n\nDid this happen suddenly or gradually?",
      health_issues:
        "Health concerns — I understand how worrying this must be.\n\nHow long have you been dealing with this health issue?",
      legal_matters:
        "Legal matters — I understand how stressful this can be.\n\nWhat type of matter is it?",
      family_conflict:
        "Family tension — I understand how heartbreaking this can be.\n\nHow long has this tension been going on?",
      get_kundli:
        'Of course! I need your birth details to generate your kundli.',
      something_else:
        "Of course, I'm listening. Tell me more — what's the problem?",
    },
    durationChips: {
      lessThanYear: '< 1 year',
      oneToThreeYears: '1-3 years',
      moreThanThreeYears: '3+ years',
    },
    moneyChips: {
      sudden: 'Suddenly',
      gradually: 'Gradually',
      always: 'Always been',
    },
    healthChips: {
      recent: 'Recently',
      fewMonths: 'Few months',
      longTime: 'Long time',
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
      "Proposals falling through for {{duration}} — this is a specific pattern seen in many cases.\n\n💡 This often happens when a planetary combination is directly affecting the 7th house (marriage house). It's not permanent — the right remedies can significantly reduce its effects.\n\nI can confirm from your exact kundli which planet is causing this and what remedy would be most effective.",
    career_stuck:
      "Career stuck for {{duration}} — despite effort — this often happens when a planet is putting pressure on the 10th house (career house) or its lord. This is a temporary phase and a breakthrough is possible with specific remedies.",
    money_problems:
      'Financial instability patterns are often connected to planets in the 2nd house (wealth) or 11th house (income). Your kundli can reveal which planet is creating pressure and how to address it.',
    health_issues:
      'Health issues frequently connect to 6th house afflictions in the chart. Understanding which planet is causing this helps identify the most effective remedies — both spiritual and practical.',
    legal_matters:
      'Legal disputes are often linked to planetary combinations in the 6th house (litigation) or 8th house. Kundli analysis can reveal when favorable periods will come and which remedies can positively influence the outcome.',
    family_conflict:
      'Ongoing family tension often stems from planetary influence on the 4th house (domestic peace). Specific remedies can significantly improve the household environment.',
  },

  // --- Birth Details ---
  birthDetails: {
    title: 'Birth Details',
    subtitle: 'These details are needed for an accurate kundli:',
    dateOfBirth: 'Date of Birth',
    dateFormat: 'DD / MM / YYYY',
    timeOfBirth: 'Time of Birth',
    timeFormat: 'HH : MM',
    unknownTime: "Don't know exact time?",
    unknownTimeSub: "We'll use an approximate time",
    approximateTime: {
      morning: 'Morning (6 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 4 PM)',
      evening: 'Evening (4 PM - 8 PM)',
      night: 'Night (8 PM - 6 AM)',
      dontKnow: "Don't know at all",
    },
    approximateNote:
      'Kundli can be generated with approximate time too, but exact time gives more accurate results.',
    placeOfBirth: 'Place of Birth',
    placeSearch: 'Search city/town...',
    generateButton: 'Generate My Kundli',
    generateButtonSub: 'मेरी कुंडली बनाएं',
  },

  // --- Kundli Animation ---
  kundliAnimation: {
    phase1: 'Generating your Kundli...',
    phase1Sub: 'Computing planetary positions for {{date}}, {{time}}, {{place}}...',
    phase2: 'Scanning Planets...',
    phase2PlanetsFound: '{{count}} planets found in {{house}}th house...',
    phase3: 'Analyzing Doshas...',
    phase3Checks: {
      mangal: 'Checking Mangal Dosha...',
      shani: 'Checking Shani Dosha...',
      rahuKetu: 'Checking Rahu-Ketu Dosha...',
      kaalSarp: 'Checking Kaal Sarp Yog...',
      pitra: 'Checking Pitra Dosha...',
      dasha: 'Analyzing Dasha periods...',
      severity: 'Computing severity...',
    },
    phase4: 'Analysis Complete',
    phase4Sub: 'Your kundli analysis is ready',
    viewDiagnosis: 'View Your Diagnosis',
  },

  // --- Free Diagnosis ---
  diagnosis: {
    title: 'Your Kundli Diagnosis',
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
    title: 'Start Your Remedies Today (FREE)',
    subtitle:
      "You can start these remedies today — completely free. Starting them begins reducing planetary pressure.",
    addToTracker: 'Add to Tracker',
    listenPronunciation: 'Listen to Pronunciation',
    frequency: 'How often',
    duration: 'Duration',
  },

  // --- Paywall ---
  paywall: {
    title: 'Unlock Complete Remedy Plan',
    lockedItems: {
      detailedAnalysis: 'Detailed dosha analysis + planetary positions',
      timeline: 'Exact timeline for when effects will reduce',
      templeRecommendation: 'Specific temple + puja recommendation',
      muhurta: 'Best muhurta (auspicious timing) for remedies',
      products: 'Recommended gemstones + yantra + rudraksha',
      protocol: '9-week complete remedy protocol',
    },
    socialProof: '{{count}} users with similar charts unlocked this',
    price: '₹199',
    originalPrice: '₹499',
    discount: '60% OFF',
    unlockButton: 'Unlock Complete Plan — ₹199',
  },

  // --- Authentication ---
  auth: {
    signInTitle: 'Sign in to continue',
    phone: {
      label: 'Phone Number',
      placeholder: 'Enter your mobile number',
      sendOtp: 'Send OTP',
    },
    otp: {
      title: 'Verify OTP',
      subtitle: 'Enter the 6-digit code sent to {{phone}}',
      resend: 'Resend OTP',
      resendIn: 'Resend in {{seconds}}s',
    },
    google: 'Continue with Google',
    or: 'or',
  },

  // --- Payment ---
  payment: {
    success: {
      title: 'Payment Successful!',
      subtitle: '₹199 paid. Generating your complete remedy plan...',
    },
    failure: {
      title: 'Payment failed?',
      subtitle: 'Try again.',
      retry: 'Try Again',
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
    networkError: 'Please check your internet connection and try again',
    serverError: 'Server is having issues. Please try again in a moment',
    sessionExpired: 'Your session has expired. Please login again',
  },
} as const;
