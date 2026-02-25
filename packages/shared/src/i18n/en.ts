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

  // --- Puja Booking (Phase 2) ---
  puja: {
    detail: {
      whyThisTemple: 'Why this temple?',
      whatsIncluded: "What's included:",
      inclusionPujaVidhi: 'Full vidhi puja with mantras',
      inclusionSankalp: 'Your name + gotra in sankalp',
      inclusionVideo: 'HD video of complete puja (3-5 min)',
      inclusionPhotos: 'Photos of the ritual',
      inclusionPrasad: 'Consecrated prasad shipped to you',
      inclusionCertificate: 'Digital completion certificate',
      pastVideos: 'Past puja videos:',
      delivery: 'Delivery:',
      videoDelivery: 'Video: 3-5 days after puja',
      prasadDelivery: 'Prasad: 7-10 days (free shipping)',
      bookPuja: 'Book Puja',
      pujasCompleted: 'pujas completed',
    },
    booking: {
      stepOf: 'Step {{current}} of {{total}}',
      step1Title: 'Sankalp Details',
      step1Subtitle: 'These details are spoken during the puja as your personal prayer (sankalp).',
      fullName: 'Full Name (as per puja)',
      fatherName: "Father's Name",
      gotra: 'Gotra (if known)',
      gotraPlaceholder: 'Select or type...',
      gotraUnknown: "Don't know my gotra (general sankalp will be used)",
      wish: 'Your Wish / Sankalp',
      wishPrefilled: 'Pre-filled based on your chat. Edit if needed.',
      nextSelectDate: 'Next: Select Date',
      step2Title: 'Select Date',
      aiRecommendedDate: 'AI Recommended Date:',
      otherDates: 'Other available dates:',
      muhurtaGood: 'Good muhurta',
      muhurtaAverage: 'Average muhurta',
      nextReviewPay: 'Next: Review & Pay',
      step3Title: 'Review & Pay',
      orderSummary: 'Order Summary',
      date: 'Date',
      name: 'Name',
      deliverables: 'Deliverables',
      videoTimeline: 'Puja video (3-5 days)',
      prasadTimeline: 'Prasad delivery (7-10 days)',
      pujaFee: 'Puja Fee',
      prasadDeliveryFee: 'Prasad Delivery',
      total: 'Total',
      freeLabel: 'Free',
      deliveryAddress: 'Prasad delivery address:',
      changeAddress: 'Change',
      addAddress: 'Add Address',
      paySecurely: 'Pay Securely',
      securedByRazorpay: 'Secured by Razorpay',
      whatsappSupport: 'Support: WhatsApp us anytime',
    },
    confirmation: {
      title: 'Puja Booked!',
      orderId: 'Order ID',
      whatHappensNext: 'What happens next:',
      pujaPerformed: '{{date}} — Puja performed with your sankalp',
      videoDelivered: '{{date}} — Puja video delivered (WhatsApp + App)',
      prasadArrives: '{{date}} — Consecrated prasad arrives at your address',
      continueRemedies: 'Continue with other remedies from your plan',
      viewOrder: 'View Order',
      backToHome: 'Back to Home',
    },
  },

  // --- Order Tracking (Phase 2) ---
  orderTracking: {
    title: 'Order Tracking',
    statusTimeline: 'Status Timeline:',
    pujaVideo: 'Puja Video:',
    watchVideo: 'Watch Video',
    download: 'Download',
    shareWhatsapp: 'Share on WhatsApp',
    certificate: 'Digital Certificate:',
    certificateTitle: 'Certificate of Puja Completion',
    certificatePerformed: '{{pujaName}} performed for {{userName}} at {{templeName}} on {{date}}',
    downloadCertificate: 'Download Certificate',
    trackingNumber: 'Tracking:',
    trackShipment: 'Track Shipment',
    estimatedDelivery: 'Expected delivery:',
    needHelp: 'Need help? WhatsApp support',
    myOrders: 'My Orders',
    filterAll: 'All',
    filterActive: 'Active',
    filterCompleted: 'Completed',
    noOrders: 'No orders yet',
    booked: 'Booked',
  },

  // --- Temple CMS (Phase 2) ---
  templeCms: {
    dashboard: 'Temple Dashboard',
    bookings: 'Bookings',
    todayBookings: "Today's Bookings",
    upcomingBookings: 'Upcoming Bookings',
    noBookings: 'No bookings',
    viewDetails: 'View Details',
    confirmBooking: 'Confirm Booking',
    markPujaPerformed: 'Mark Puja Performed',
    uploadVideo: 'Upload Video',
    videoUploaded: 'Video Uploaded',
    markPrasadPacked: 'Mark Prasad Packed',
    enterTracking: 'Enter tracking number',
    dispatchPrasad: 'Dispatch Prasad',
    totalBookings: 'Total Bookings',
    totalRevenue: 'Total Revenue',
    thisMonth: 'This Month',
    sankalpDetails: 'Sankalp Details',
    pujaCatalog: 'Puja Catalog',
    addPuja: 'Add New Puja',
    editPuja: 'Edit Puja',
    templeProfile: 'Temple Profile',
  },

  // --- Address ---
  address: {
    title: 'Address',
    addNew: 'Add New Address',
    name: 'Name',
    line1: 'Address Line 1',
    line2: 'Address Line 2 (optional)',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    phone: 'Phone Number',
    makeDefault: 'Make default address',
    saveAddress: 'Save Address',
  },

  // --- Phase 3: Remedy Tracker (S12) ---
  remedyTracker: {
    title: 'Remedies',
    protocolTitle: '9-Week Protocol',
    dayOf: 'Day {{current}} of {{total}}',
    keepGoing: 'Keep Going!',
    protocolStarted: 'Started: {{date}}',
    targetCompletion: 'Target completion: {{date}}',
    todaysTasks: "Today's Tasks",
    doneTasks: 'Done Today',
    pujaStatus: 'Puja Status',
    weeklyStats: 'Weekly Stats',
    currentStreak: 'Day Streak',
    longestStreak: 'Best Streak',
    completedLabel: 'Completed',
    karmaPoints: 'Karma Pts',
    completionRate: 'Completion Rate',
    markDone: 'Mark as Done',
    startGuidedMantra: 'Start Guided Mantra',
    readAlong: 'Read Along / Audio',
    addToTracker: 'Add to Tracker',
    startProtocol: 'Start My 9-Week Protocol',
    streakDays: '{{count}} day streak',
    streakWarning: "Streak about to break! Complete today's mantra",
    emptyTitle: 'No active remedy plan',
    emptyText: 'Get your kundli analyzed for personalized remedies',
    emptyCta: 'Get Started',
    pujaCompleted: 'Completed',
    pujaScheduled: 'Scheduled',
    pujaPending: 'Pending',
    watchVideo: 'Watch Video',
    viewDetails: 'View Details',
    prasadStatus: 'Prasad: {{status}}',
    fastingDay: 'Today is {{day}} \u2014 fast day!',
    fastingInstruction: 'Eat only after sunset.',
  },

  // --- Phase 3: Guided Mantra Player (S12.2) ---
  mantraPlayer: {
    title: '{{name}} Mantra',
    countProgress: '{{current}}/{{total}}',
    mode: 'Mode:',
    listenRepeat: 'Listen & Repeat',
    listenRepeatDesc: 'Audio plays, you tap after each recitation',
    selfPaced: 'Self-paced',
    selfPacedDesc: 'Tap to count each one',
    timer: 'Timer',
    timerDesc: 'Set time, count approximate',
    speed: 'Speed:',
    tapToCount: 'TAP',
    tapToCountSub: 'to count next',
    pause: 'Pause',
    resume: 'Resume',
    complete: 'Complete ({{count}} done)',
    completedTitle: 'Well done! Mantra Complete!',
    completedSub: '+{{points}} Karma Points earned',
    progressSaved: 'Progress auto-saved',
  },

  // --- Phase 3: Transit Alerts (S14) ---
  transitAlerts: {
    title: 'Transit Alert',
    whatsHappening: "What's happening:",
    duration: 'Duration:',
    impact: 'Impact:',
    impactLow: 'Low',
    impactMedium: 'Medium',
    impactMediumHigh: 'Medium-High',
    impactHigh: 'High',
    recommendedRemedies: 'Recommended protective remedies:',
    bookNow: 'Book Now',
    addToTracker: 'Add to Tracker',
    askAiMore: 'Ask AI more about this transit',
    bestBefore: 'Best before {{date}}',
    planetTransiting: '{{planet}} transiting {{from}}th \u2192 {{to}}th house',
    noAlerts: 'No transit alerts',
  },

  // --- Phase 3: Notifications ---
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    settings: 'Notification Settings',
    remedyReminders: 'Remedy Reminders',
    remedyRemindersSub: 'Daily mantra and task reminders',
    transitAlertsToggle: 'Transit Alerts',
    transitAlertsSub: 'Planet transit alerts',
    festivalRemedies: 'Festival Remedies',
    festivalRemediesSub: 'Festival-linked remedy suggestions',
    pujaUpdates: 'Puja Updates',
    pujaUpdatesSub: 'Order status and video updates',
    promotional: 'Promotional',
    promotionalSub: 'Special offers and discounts',
    morningTime: 'Morning reminder time',
    eveningTime: 'Evening reminder time',
  },

  // --- Phase 3: Pandit Consultation (S10) ---
  pandit: {
    title: 'Talk to a Pandit',
    aiNote: 'Based on your chart, I recommend consulting a pandit who specializes in {{speciality}}.',
    filterAll: 'All',
    filterMarriage: 'Marriage',
    filterCareer: 'Career',
    filterHealth: 'Health',
    consultations: '{{count}} consultations',
    speciality: 'Speciality:',
    languages: 'Languages:',
    experience: '{{years}} years experience',
    availableNow: 'Available Now',
    nextAvailable: 'Next available: {{time}}',
    chatPrice: 'Chat \u20B9{{price}}/min',
    callPrice: 'Call \u20B9{{price}}/min',
    aiRecommended: 'AI-recommended for your chart',
    startChat: 'Start Chat',
    sessionTimer: '{{minutes}}:{{seconds}}',
    sessionCost: '\u20B9{{amount}}',
    walletBalance: 'Wallet balance: \u20B9{{amount}}',
    walletWarning: 'Session will end at \u20B90 unless you recharge.',
    rechargeNow: 'Recharge \u20B9{{amount}}',
    endSession: 'End Session',
    typePlaceholder: 'Type here...',
    sessionSummary: 'Session Summary',
    sessionWith: 'Session with {{name}}',
    sessionDuration: 'Duration: {{minutes}} min',
    sessionCostTotal: 'Cost: \u20B9{{amount}}',
    keyPointsDiscussed: 'Key points discussed:',
    newRemediesSuggested: 'New remedies suggested:',
    addRemedyToTracker: '+ Add {{name}} to Remedy Tracker',
    bookPuja: 'Book {{name}} \u2014 \u20B9{{price}}',
    rateSession: 'Rate your session:',
    noPandits: 'No pandits available',
  },

  // --- Phase 3: Wallet ---
  wallet: {
    title: 'Wallet',
    balance: 'Balance',
    currentBalance: '\u20B9{{amount}}',
    recharge: 'Recharge',
    quickRecharge: 'Quick Recharge:',
    rechargeAmount: '\u20B9{{amount}}',
    transactions: 'Transactions',
    noTransactions: 'No transactions yet',
    recharged: 'Recharged',
    debited: 'Debited',
    refunded: 'Refunded',
    forSession: 'For pandit session',
    insufficientBalance: 'Insufficient balance. Please recharge.',
    minimumRecharge: 'Minimum recharge: \u20B9100',
  },

  // --- Phase 3: Post-Diagnosis Deepening ---
  deepening: {
    matchPrompt: 'Do these problems match your experience?',
    yesMatch: 'Yes, all match',
    moreToShare: "There's more",
  },

  // --- Errors ---
  errors: {
    networkError: 'Please check your internet connection and try again',
    serverError: 'Server is having issues. Please try again in a moment',
    sessionExpired: 'Your session has expired. Please login again',
  },
} as const;
