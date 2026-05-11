// i18n type definitions for VEILOR

export type SupportedLanguage = 'ko' | 'en';

export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string;

/** Flat or nested record of translated strings */
export type TranslationStrings = {
  [key: string]: string | TranslationStrings;
};

/** Top-level locale structure – each namespace maps to a nested object of strings */
export interface LocaleResource {
  common: {
    appName: string;
    loading: string;
    retry: string;
    save: string;
    cancel: string;
    next: string;
    prev: string;
    close: string;
    confirm: string;
    delete: string;
    edit: string;
    done: string;
    search: string;
    back: string;
    more: string;
    all: string;
    none: string;
    optional: string;
    premium: string;
    active: string;
    preparing: string;
    disclaimer: string;
    skipToContent: string;
    loginRequired: string;
  };
  nav: {
    vent: string;
    dig: string;
    get: string;
    set: string;
    me: string;
    dm: string;
    why: string;
    ikigai: string;
    brand: string;
    community: string;
    chat: string;
    admin: string;
  };
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    logout: string;
    sessionExpiredTitle: string;
    sessionExpiredDesc: string;
    googleLoginFailTitle: string;
    signOutTitle: string;
    signOutDesc: string;
    profileSyncFail: string;
  };
  onboarding: {
    welcome: {
      title: string;
      subtitle: string;
      card1Title: string;
      card1Desc: string;
      card2Title: string;
      card2Desc: string;
      card3Title: string;
      card3Desc: string;
      startButton: string;
      disclaimer: string;
    };
    cq: {
      relationshipGoal: string;
      relationshipGoalOptions: string[];
      currentChallenge: string;
      currentChallengePlaceholder: string;
      emotionStyle: string;
      emotionStyleOptions: string[];
      relationshipStyle: string;
      relationshipStyleOptions: string[];
      startAnalysis: string;
    };
    priper: {
      startTitle: string;
      startDesc: string;
      info1: string;
      info2: string;
      info3: string;
      info4: string;
      startButton: string;
      disclaimer: string;
      resultYourMask: string;
      resultComplexType: string;
      resultEnterButton: string;
      resultDisclaimer: string;
      radarAxes: {
        attachment: string;
        communication: string;
        desire: string;
        role: string;
      };
    };
  };
  vent: {
    header: string;
    subtitle: string;
    amberName: string;
    sections: {
      mood: string;
      layer: string;
      community: string;
    };
    emotions: {
      anxious: string;
      sad: string;
      angry: string;
      confused: string;
      lonely: string;
      numb: string;
      tired: string;
      hurt: string;
    };
    emotionQuestions: Record<string, { questions: [string, string][]; suggestion: string }>;
    quickCards: {
      relationship: string;
      work: string;
      self: string;
      body: string;
    };
    selector: {
      prompt: string;
      resumeHint: string;
      resumeButton: string;
      turns: string;
      recentLabel: string;
      quickCardsTitle: string;
    };
    greetings: {
      earlyMorning: { title: string; placeholder: string };
      morning: { title: string; placeholder: string };
      lunch: { title: string; placeholder: string };
      afternoon: { title: string; placeholder: string };
      evening: { title: string; placeholder: string };
      night: { title: string; placeholder: string };
      lateNight: { title: string; placeholder: string };
    };
    amberSheet: {
      initialText: string;
      toneHere: string;
      toneListening: string;
      toneDig: string;
      fallbackText: string;
      thinkingPlaceholder: string;
      close: string;
      send: string;
    };
    chat: {
      amberIntro: string;
      amberListening: string;
      finishSuggestion: string;
      finishButton: string;
      continueButton: string;
      tryThisButton: string;
      currentEmotion: string;
      similarPeople: string;
      voiceInput: string;
      messageInput: string;
      sendMessage: string;
      speakToAmber: string;
      crisisLocked: string;
      crisisLockedSub: string;
      saveErrorTitle: string;
      saveErrorDesc: string;
      aiErrorTitle: string;
      aiErrorDesc: string;
      yourPace: string;
      toneWith: string;
      toneContinue: string;
      continueResponse: string;
      feedbackHelpful: string;
      feedbackNotHelpful: string;
      sexSelfNudge: string;
      sexSelfNudgePrivate: string;
      sexSelfNudgeYes: string;
      sexSelfNudgeNo: string;
      partnerNudge: string;
      partnerNudgePrivate: string;
      partnerNudgeExplore: string;
      partnerNudgeSkip: string;
      amberNudgeDeep: string;
      amberNudgeDeepButton: string;
      patternDetectedTitle: string;
      patternDetectedDesc: string;
    };
    socialEmotionHint: string;
    socialGreeting: string;
    layers: {
      title: string;
      prompt: string;
      activePrompt: string;
      backButton: string;
      writePlaceholder: string;
      desireHint: string;
      social: { label: string; sub: string; items: Record<string, string> };
      daily: { label: string; sub: string; items: Record<string, string> };
      secret: { label: string; sub: string; items: Record<string, string> };
      tags: { locked: string; sensitive: string; normal: string };
      desireModal: {
        title: string;
        body1: string;
        body2: string;
        body3: string;
        encrypted: string;
        cancel: string;
        open: string;
      };
    };
    community: {
      subtitle: string;
      groups: { title: string; count: number; desc: string }[];
      people: string;
    };
  };
  dig: {
    header: string;
    subtitle: string;
    situations: string[];
    situationQuestion: string;
    divisionQuestion: string;
    inputPlaceholder: string;
    lowDesireHint: string;
    searchButton: string;
    searching: string;
    goBack: string;
    patternBanner: {
      nthTime: string;
      patternRepeating: string;
      comboRepeat: string;
    };
    patternInterpretation: string;
    analyzing: string;
    otherAnswers: string;
    researcher: string;
    historyTitle: string;
    historyCount: string;
    monthlyPatterns: string;
    ventPatternBanner: string;
    ventPatternStart: string;
    historyLabel: string;
    errorTitle: string;
    trendLabels: {
      rising: string;
      declining: string;
      stable: string;
    };
    relevance: string;
    tendencyDisclaimer: string;
    optional: string;
    all: string;
    socraticHint: string;
    whyNudge: {
      title: string;
      desc: string;
      btn: string;
    };
    codetalk: {
      title: string;
      subtitle: string;
      soloMode: string;
      soloModeDesc: string;
      togetherMode: string;
      togetherModeDesc: string;
      byRelation: string;
      byRelationDesc: string;
      byPsych: string;
      byPsychDesc: string;
      selectRelation: string;
      selectPsych: string;
      backToCategory: string;
      backToList: string;
      backToEntry: string;
      keywordSearch: string;
      noResults: string;
      freePlaceholder: string;
      publicToggle: string;
      privateToggle: string;
      prev: string;
      next: string;
      save: string;
      saving: string;
      savedToast: string;
      otherEntries: string;
      exploreMore: string;
      noPublicEntries: string;
      anonymous: string;
      storyFeedDesc: string;
      storyFeedEmpty: string;
      steps: Record<string, string>;
      stepPrompts: Record<string, string>;
      relCategories: Record<string, string>;
      psychCategories: Record<string, string>;
      socraticPrompts: Record<string, string[]>;
    };
  };
  community: {
    header: string;
    subtitle: string;
    tabs: { groups: string; discuss: string; connect: string; content: string };
    categoryLabels: Record<string, string>;
    backToList: string;
    backToGroup: string;
    anonymous: string;
    realName: string;
    commentCount: string;
    commentPlaceholder: string;
    postPlaceholder: string;
    titlePlaceholder: string;
    writePost: string;
    register: string;
    cancel: string;
    emptyPosts: string;
    postRegistered: string;
    commentRegistered: string;
    memberCount: string;
  };
  set: {
    header: string;
    subtitle: string;
    tabs: {
      codetalk: string;
      boundary: string;
      feed: string;
    };
    codetalk: {
      savedToast: string;
    };
    boundary: {
      categories: {
        emotional: string;
        physical: string;
        time: string;
        digital: string;
      };
      savedToast: string;
      consentConditions: {
        noCrossBoundary: string;
        safeToSpeak: string;
        canWithdraw: string;
      };
      consentChecked: string;
      consentUnchecked: string;
      sexual: string;
      sexualPrivate: string;
      sexualDesc: string;
      sexualExplore: string;
      save: string;
      axMercerTitle: string;
      axMercerSubtitle: string;
      axMercerAllComplete: string;
      sectionComplete: string;
      boundarySettingTitle: string;
      boundarySettingSubtitle: string;
      placeholders: Record<string, string>;
      axMercerSections: Record<string, { title: string; description: string; items: Record<string, string> }>;
    };
    axmercer: Record<string, string>;
    tabs2: { us: string; tools: string; practice: string; mantra: string };
    sexSelfBanner: { title: string; desc: string };
    coupleTalk: { subtitle: string; connected: string };
    sidebarSubtitle: string;
    insightError: string;
    mantraCorner: {
      header: string;
      trainingComplete: string;
      countOf: string;
      sayAloud: string;
      saidIt: string;
      startTraining: string;
      complete: string;
      repeatTimes: string;
      nextMantra: string;
    };
    socialPivotNudge: {
      pivotDetected: string;
      talkToAmber: string;
      imFine: string;
      pivotTypes: Record<string, { label: string; desc: string }>;
    };
  };
  get: {
    header: string;
    subtitle: string;
    tabs: {
      identity: string;
      why: string;
      ikigai: string;
      brand: string;
      couple: string;
    };
    identity: {
      myMask: string;
      code: string;
      fourAxes: string;
      axisLabels: Record<string, string>;
      attachmentType: string;
      attachmentLabels: Record<string, string>;
      primePerspective: string;
      multiPersonaMap: string;
      priperRegistered: string;
      patternAnalysis: string;
      totalInput: string;
      ventConversation: string;
      digExploration: string;
      setRecord: string;
      frequentEmotions: string;
      times: string;
      repeatExploration: string;
      timesExplored: string;
      recentKeywords: string;
      signalAccumulated: string;
      priperReanalysis: string;
      vfileTitle: string;
      notFixedPattern: string;
      reanalyze: string;
      startAnalysis: string;
      originProfile: string;
      coreWound: string;
      coreFear: string;
      coreNeed: string;
      genPath: string;
      exploreWithAI: string;
      vprofileType: string;
      reanalysisCompare: string;
      diagnosisCount: string;
      prevDiagnosis: string;
      threePersonas: string;
      personasComplete: string;
      personasDesc: string;
      sexualBoundaryPrivate: string;
      sexualBoundaryExplore: string;
      sexualBoundaryDesc: string;
      save: string;
      axMercerTitle: string;
      axMercerSubtitle: string;
      axMercerComplete: string;
      sectionComplete: string;
      boundarySettingTitle: string;
      boundarySettingSubtitle: string;
      maskLabels: Record<string, string>;
    };
    ikigai: {
      love: string;
      goodAt: string;
      worldNeeds: string;
      paidFor: string;
      notYet: string;
      writeButton: string;
      design: string;
      multiLineHint: string;
      loveInput: string;
      aiInsight: string;
      aiAnalyzing: string;
      savedToast: string;
    };
    brand: {
      name: string;
      tagline: string;
      coreValue: string;
      target: string;
      tone: string;
      design: string;
      notYet: string;
      aiGenerate: string;
      aiGenerating: string;
      aiRegenerate: string;
      writeManually: string;
      savedToast: string;
      aiCompleteToast: string;
      aiFailToast: string;
      aiFailDesc: string;
      namePlaceholder: string;
      taglinePlaceholder: string;
      coreValuePlaceholder: string;
      targetPlaceholder: string;
      tonePlaceholder: string;
    };
    premium: {
      label: string;
      tapToCheck: string;
      multiPersonaDesc: string;
      ikigaiDesc: string;
      brandDesc: string;
    };
    radarCompare: {
      axisChange: string;
      maskChanged: string;
      personaChange: string;
    };
    errors: {
      loadFailed: string;
    };
  };
  me: {
    header: string;
    subtitle: string;
    tabs: {
      growth: string;
      people: string;
      zone: string;
      impact: string;
    };
    settings: string;
    seed: {
      title: string;
      stages: string[];
      precision: string;
      stageLabels: string[];
      conversations: string;
      insights: string;
      signals: string;
      patternAreas: string;
      statsLine: string;
      patternAreasFmt: string;
    };
    frost: {
      precisionMessage: string;
      closedAreas: string;
    };
    multiPersona: string;
    personaConflict: string;
    found: string;
    profileChange: string;
    monthAgo: string;
    now: string;
    baseline: string;
    weeklyReport: {
      title: string;
      signalCount: string;
      loading: string;
      empty: string;
      emptyDesc: string;
      patterns: string;
      mainEmotions: string;
      unresolved: string;
      weekLabelFmt: string;
      weekReportBadge: string;
      emotionCountFmt: string;
    };
    initialDiagnosis: string;
    diagAxisHighest: string;
    friendRecommend: string;
    friendCriteria: string;
    shareChange: string;
    shareDesc: string;
    shareButton: string;
    sharePreparing: string;
    people: {
      title: string;
      subtitle: string;
      loading: string;
      discoveredPattern: string;
      personaConflict: string;
      addPerson: string;
      relTypes: string[];
      formTitle: string;
      formNamePlaceholder: string;
      formNotesPlaceholder: string;
      save: string;
      saving: string;
      cancel: string;
      delete: string;
    };
    zone: {
      title: string;
      subtitle: string;
      precision: string;
      frostMessage: string;
      sensitive: string;
    };
    impact: {
      title: string;
      empty: string;
      goToGet: string;
      statusActive: string;
      statusDormant: string;
      statusRevisit: string;
      contributionTitle: string;
      contributionEmpty: string;
      pivotTitle: string;
      pivotGrowth: string;
      pivotFatigue: string;
      pivotTransition: string;
      lastUpdated: string;
      shiftNote: string;
      exploreTitle: string;
      exploreSub: string;
      todayMantra: string;
      mantraText: string;
      subIssueQuestion: string;
      whyMattersPlaceholder: string;
      saveDone: string;
      noCompletion: string;
      axisAlignment: string;
    };
    amberDefaultName: string;
    frostDefaultName: string;
    rename: {
      amber: string;
      frost: string;
    };
    dmToast: string;
    aiSheet: {
      amberRole: string;
      frostRole: string;
      amberGreeting: string;
      frostGreeting: string;
      amberResponse: string;
      frostResponse: string;
      placeholder: string;
      close: string;
      send: string;
      inputLabel: string;
    };
    viewAll: string;
    timeline: {
      title: string;
      addButton: string;
      olderAvg: string;
      recentAvg: string;
      changeLabel: string;
      emptyDesc: string;
      firstRecord: string;
      formTitle: string;
      formDate: string;
      formType: string;
      formEventTitle: string;
      formEventTitlePlaceholder: string;
      formNotes: string;
      formNotesPlaceholder: string;
      formTone: string;
      formSave: string;
      formSaving: string;
      toneLabels: Record<string, string>;
    };
    personaFragments: {
      title: string;
      engineLabel: string;
      loading: string;
      emptyTitle: string;
      emptyDesc: string;
      newBadge: string;
      detected: string;
      contradictionStrength: string;
      reactionPrompt: string;
      reactions: { resonates: string; surprising: string; disagree: string };
      reactionResult: { resonates: string; surprising: string; disagree: string };
      acknowledged: string;
      typeLabels: Record<string, string>;
      newCountFmt: string;
      countFmt: string;
      systemDetected: string;
      footer: string;
    };
    monthlyReport: {
      badge: string;
      activitySummary: string;
      loading: string;
      error: string;
      threeMonthCompare: string;
      psychTrendTitle: string;
      psychTrendHighlight: string;
      psychTrendNeed: string;
      topPatterns: string;
      noData: string;
      growthMeasure: string;
      axisLabels: Record<string, string>;
      axisShortLabels: Record<string, string>;
    };
    communicationPattern: {
      title: string;
      countLabel: string;
      topKeywords: string;
      depthLabel: string;
      depthStages: { low: string; mid: string; high: string };
    };
    patternDeviation: {
      title: string;
      stabilityChangeFmt: string;
      newEmotionsLabel: string;
      positive: string;
      negative: string;
    };
    shareCard: {
      shareGroupLabel: string;
      copyButton: string;
      copyDone: string;
      shareButton: string;
      copyAriaLabel: string;
      shareAriaLabel: string;
      axisLabels: Record<string, string>;
    };
    feedEvolution: {
      dismissAriaLabel: string;
      milestones: Record<string, { title: string; desc: string }>;
    };
  };
  crisis: {
    banner: {
      critical: string;
      high: string;
      disclaimer: string;
      criticalUrgent: string;
      moreHelp: string;
      close: string;
      closeBanner: string;
      calmFirst: string;
      callExpert: string;
      stabilizeTitle: string;
      breathingTitle: string;
      breathingMethod: string;
      groundingTitle: string;
      groundingMethod: string;
      otherTechnique: string;
      toConnect: string;
      connectTitle: string;
      backToStabilize: string;
      breathing: {
        roundFmt: string;
        inhale: string;
        hold: string;
        exhale: string;
      };
      grounding: {
        title: string;
        steps: { n: number; sense: string; icon: string }[];
        stepFmt: (n: number, sense: string) => string;
        next: string;
      };
      hotlineList: { tel: string; name: string; note: string; primary: boolean }[];
    };
    hotlines: {
      suicidePrevention: string;
      mentalHealthCrisis: string;
      lifeline: string;
      youth: string;
      police: string;
      emergency: string;
    };
    disclaimerFull: string;
  };
  errors: {
    network: string;
    api: string;
    notFound: string;
    dataLoadFailed: string;
    dataLoadFailedDesc: string;
    retryButton: string;
    offline: string;
    connectionError: string;
    connectionErrorDesc: string;
    saveError: string;
    saveErrorDesc: string;
    closeBanner: string;
    skipToMain: string;
    masterDataLoadFailed: string;
    masterDataError: string;
    socialNeedsLoadFailed: string;
    cohortLoadFailed: string;
    skillCategoriesLoadFailed: string;
  };
  clear: {
    dashboard: string;
    dashboardGreetingFmt: (name: string) => string;
    healthScore: string;
    scoreUnit: string;
    weeklyRecord: string;
    weekGoalFmt: string;
    todayStatus: string;
    todayStatusSub: string;
    moodLabels: {
      veryBad: string;
      bad: string;
      normal: string;
      good: string;
      veryGood: string;
    };
    moodMin: string;
    moodMax: string;
    saving: string;
    record: string;
    checkinDone: string;
    checkinDoneLabel: string;
    weekSnapshot: string;
    insightFmt: string;
    insightBetter: string;
    insightWorse: string;
    todayChallenge: string;
    challengeDone: string;
    challengeTryIt: string;
    recoveryTitle: string;
    recoveryDesc: string;
    sexSelfTitle: string;
    sexSelfDesc: string;
    sexSelfStart: string;
    sexSelfDetail: string;
    sexSelfLabel: string;
    sexSelfSafeMsg: string;
    sexAxisLeading: string;
    sexAxisExpressiveness: string;
    sexAxisIntensity: string;
    sexSelfPanelDesc: string;
    sexSelfOnlyMe: string;
    sexSelfProfiles: Record<string, string>;
    navPatterns: string;
    navGrowth: string;
    emotionDist: string;
    calendarTitle: string;
    summaryRecords: string;
    summaryAvg: string;
    summaryBest: string;
    summaryDaysFmt: string;
    dowLabels: string[];
    activities: {
      relationship: string;
      work: string;
      exercise: string;
      alone: string;
      rest: string;
      study: string;
    };
    lowMoodToastTitle: string;
    lowMoodToastDesc: string;
    lowMoodToastAction: string;
  };
  work: {
    focus: {
      header: string;
      mentalLabel: string;
      noCheckin: string;
      addPlaceholder: string;
      estLabel: string;
      add: string;
      start: string;
      pause: string;
      resume: string;
      done: string;
      delete: string;
      rolloverLabel: (n: number) => string;
      amberComment: (energy: number) => string;
      empty: string;
      minuteUnit: string;
    };
    sprint: {
      header: string;
      masteryTitle: string;
      mastery: {
        beginner: string;
        intermediate: string;
        skilled: string;
        expert: string;
        master: string;
      };
      kpiTitle: string;
      completionRate: string;
      accuracy: string;
      completionPower: string;
      mentalTitle: string;
      highEnergy: string;
      lowEnergy: string;
      mentalInsight: (hi: number, lo: number) => string;
      streakTitle: string;
      streakUnit: string;
      goalsTitle: string;
      addGoalPlaceholder: string;
      addGoal: string;
      amberTitle: string;
      amberCoaching: (rate: number, acc: number) => string;
      pctUnit: string;
      noData: string;
      weekLabel: (start: Date) => string;
    };
  };
  why: {
    step1: { currentCount: string; edit: string; done: string; placeholder: string };
    step2: { normalizing: string; back: string; sessionLabel: string; definitionLabel: string; definitionPlaceholder: string; memoryLabel: string; memoryPlaceholder: string; prev: string; review: string; next: string; step1: string; nextStep: string };
    step3: { noJobs: string; title: string; happyInstruction: string; painInstruction: string; select: string; selectHappy: string; selectPain: string; selectedHappy: string; selectedPain: string; done: string; prevStep: string };
    step4: { ruminationRiskMessage: string; ruminationRiskAction: string; ruminationWatchMessage: string; ruminationWatchAction: string; diveButton: string; stopButton: string; cardTitle: string; viewResults: string; unlockFeatures: string; processing: string; markComplete: string; analysisComplete: string; ikigaiDesign: string; communityMatching: string; prevStep: string; edit: string; noPrevSteps: string; toastCompleteTitle: string; toastCompleteDesc: string; toastFailTitle: string; toastFailDesc: string; labelHappiness: string; labelSuffering: string; labelNeutral: string };
    analysisResult: { jobsAnalyzed: string; primePerspectiveTitle: string; primePerspectiveDesc: string; happyCareers: string; painCareers: string; experienceRate: string; consistency: string; happyPatterns: string; painPatterns: string; happyElementsTitle: string; happyElementsDesc: string; coreKeywords: string; topPatterns: string; appearedTimes: string; relatedCareers: string; moreCareers: string; rootCause: string; painElementsTitle: string; painElementsDesc: string; nextStepsTitle: string; nextStep1Strong: string; nextStep1Body: string; nextStep2Strong: string; nextStep2Body: string; nextStep3Strong: string; nextStep3Body: string };
    analysisTrigger: { checkingData: string; triggerButton: string; dialogTitle: string; dialogDesc: string; currentDataTitle: string; totalCareers: string; experienced: string; happyCareers: string; painCareers: string; requirementsTitle: string; req1: string; req2: string; req3: string; warningPartial: string; warningInsufficient: string; warningEnough: string; processTitle: string; processBullet1: string; processBullet2: string; processBullet3: string; processBullet4: string; processDuration: string; cancel: string; analyzing: string; startAnalysis: string };
    flow: { stepLabels: string[]; hintTooltip: string; hintModalTitle: string; hintModalBody: string; hintModalConfirm: string };
    analysis7: { loadingTitle: string; loadingDesc: string; step: string; title: string; subtitle: string; statHappy: string; statDomain: string; statFw: string; phase1Title: string; happyPatterns: string; painPatterns: string; phase2Title: string; phase2Sub: string; phase3Title: string; phase3Sub: string; next: string };
    brainstorm: { step: string; title: string; timerStart: string; desc1: string; descBold: string; desc2: string; countSuffix: string; placeholder: string; next: string };
    classify: { step: string; title: string; question: string; happy: string; pain: string; neutral: string; btnHappy: string; btnPain: string; next: string };
    definition: { stepLabel: string; title: string; prompt: string; placeholder: string; prev: string; nextCareer: string; toImprint: string };
    experience: { stepLabel: string; title: string; question: string; yes: string; no: string; noteLabel: string; notePlaceholder: string; prev: string; next: string; toAnalysis: string };
    imprint: { stepLabel: string; title: string; promptMain: string; promptSub: string; placeholder: string; prev: string; nextCareer: string; toClassify: string };
    imprint8: { step: string; title: string; subtitle: string; noMatchMain: string; noMatchSub: string; imprintSectionTitle: string; prev: string; next: string };
    primePerspective: { maskConnectionLabel: string; maskDesc: string; coreNeed: string; m43Summary: string; viewAnalysis: string; happyPatterns: string; painPatterns: string; aiLabel: string; useThis: string; stepLabel: string; title: string; formatHint: string; placeholder: string; completeBadge: string; completeDesc: string; editAgain: string; saving: string; save: string };
    ready: { label: string; title: string; desc: string; items: { icon: string; text: string }[]; start: string };
    reason: { stepLabel: string; title: string; labelHappy: string; labelPain: string; promptHappy: string; promptPain: string; placeholderHappy: string; placeholderPain: string; prev: string; next: string; toExperience: string };
    valueMap9: { step: string; title: string; subtitle: string; empty: string; aiLabel: string; useThis: string; prev: string; next: string };
    toasts: {
      analysisComplete: string;
      analysisCompleteDesc: string;
      analysisFailed: string;
      analysisFailedDesc: string;
      deleted: string;
      deletedDesc: string;
      deleteFailed: string;
      deleteFailedDesc: string;
      duplicateEntry: string;
      duplicateEntryDesc: string;
      addFailed: string;
      inputRequired: string;
      inputRequiredDesc: string;
      saveFailed: string;
      saveFailedDesc: string;
      classificationSaved: string;
      classificationSavedDesc: string;
      classificationFailed: string;
      classificationFailedDesc: string;
      editModeTitle: string;
      editModeDesc: string;
      sessionFailed: string;
      sessionFailedDesc: string;
      sessionComplete: string;
      sessionCompleteDesc: string;
      sessionEndFailed: string;
      sessionEndFailedDesc: string;
      timerEnd: string;
      timerEndDesc: string;
      brainstormComplete: string;
      brainstormCompleteDesc: string;
      dbConnectionIssue: string;
      dbConnectionIssueDesc: string;
      sessionCreateFailed: string;
      sessionCreateFailedDesc: string;
      primePerspectiveRequired: string;
      primePerspectiveComplete: string;
      primePerspectiveCompleteDesc: string;
      primePerspectiveGoTo: string;
      jobsSavedFmt: (n: number) => string;
      enterAtLeastOne: string;
      selectAtLeastOne: string;
      enterDefinition: string;
      enterMemory: string;
      enterReason: string;
      errorOccurred: string;
      errorOccurredDesc: string;
    };
  };
  digExtra: {
    clearDig: { title: string; subtitle: string; tabTrend: string; tabActivity: string; loading: string; noCheckin: string; goToVent: string; recentMood: string; highLabel: string; lowLabel: string; scoreUnit: string; activityAvg: string; noActivityData: string; needMoreData: string; needMoreDataSub: string };
    coupleTalk: { noPartnerTitle: string; noPartnerDesc: string; goConnectPartner: string; pendingListTitle: string; statusBothDone: string; statusMyDone: string; statusNeedMine: string; newKeywordStart: string; newKeywordDesc: string; modeSelectTitle: string; backToList: string; byRelation: string; byRelationDesc: string; byPsych: string; byPsychDesc: string; categoryRelTitle: string; categoryPsychTitle: string; backBtn: string; keywordSearch: string; noResults: string; backToCategory: string; formDesc: string; backToListBtn: string; freePlaceholder: string; prev: string; saving: string; save: string; next: string; waitingPartner: string; waitingDesc: string; checkReveal: string; backToListShort: string; revealSuffix: string; listBtn: string; me: string; partner: string; exploreMore: string; toastBothDone: string; toastMyDone: string; toastPartnerWaiting: string; errNoPartner: string; errSessionFail: string; errEntrySave: string; errSessionUpdate: string; stepDefinitionLabel: string; stepImprintingLabel: string; stepRootLabel: string; stepDefinitionPrompt: string; stepImprintingPrompt: string; stepRootPrompt: string };
    partnerPattern: { triggerTitle: string; triggerDesc: string; panelTitle: string; close: string; behaviorLabel: string; behaviorPlaceholder: string; patternSelectLabel: string; inferButton: string; inferring: string; inferredMaskLabel: string; includeButton: string; partnerBehaviorPrefix: string; inferredPatternPrefix: string; patternInsightPrefix: string };
  };
  meExtra: {
    needSummary: { title: string; top3Label: string; layerBarTitle: string; emptyTitle: string; emptyBtn: string; reExploreBtn: string; assessedAt: string; gapUnit: string };
    renameSheet: { closeLabel: string; closeBtn: string; hint: string; srLabel: string; placeholder: string; apply: string };
    settingsSheet: { title: string; close: string; sectionLang: string; langLabel: string; langSub: string; sectionAi: string; renameLabel: string; aiPersonalityLabel: string; toneLabel: string; personalityLabel: string; freqLabel: string; sectionNotif: string; amberNotif: string; amberNotifSub: string; reportNotif: string; reportNotifSub: string; sectionDomain: string; domainSelf: string; domainSelfSub: string; domainWork: string; domainWorkSub: string; domainRelation: string; domainRelationSub: string; domainSocial: string; domainSocialSub: string; domainActive: string; sectionMode: string; modeOriginal: string; modeOriginalSub: string; modeClear: string; modeClearSub: string; modeRoutine: string; modeRoutineSub: string; modeFocus: string; modeFocusSub: string; modeSprint: string; modeSprintSub: string; modeConnect: string; modeConnectSub: string; modeMirror: string; modeMirrorSub: string; modeSocial: string; modeSocialSub: string; modeActive: string; sectionApp: string; sectionSubscription: string; subscriptionLabel: string; subscriptionRenewal: string; sectionPrivacy: string; dataPrivacy: string; accountSettings: string; logout: string; sectionDanger: string; deleteAccount: string; deleteAccountSub: string; deleteConfirmTitle: string; deleteConfirmDesc: string; deleteCancel: string; deleteConfirmBtn: string; deleting: string; amberSub: string; frostSub: string };
  };
  relation: {
    connect: {
      section: string;
      subtitle: string;
      checkinTitle: string;
      personPlaceholder: string;
      warmthLabel: string;
      warmthLow: string;
      warmthHigh: string;
      energyLabel: string;
      energyLow: string;
      energyHigh: string;
      notePlaceholder: string;
      save: string;
      saving: string;
      historyTitle: string;
      warmestRelation: string;
      mostConcerning: string;
      amberNoCheckin: string;
      amberLowWarmth: (name: string) => string;
      amberLowEnergy: string;
      // concentric diagram
      concentricTitle: string;
      groupCore: string;
      groupMiddle: string;
      groupEcho: string;
      groupOuter: string;
      groupSuffix: (n: number) => string;
      // person card
      coreSectionLabel: (n: number) => string;
      cardStrength: string;
      cardNeed: string;
      cardState: string;
      cardLastContact: (n: number) => string;
      emptyPeople: string;
      addPersonCta: string;
      addPersonBtn: string;
      // AI suggestion
      aiSuggestionPrefix: string;
      aiWeeksAgo: (n: number) => string;
    };
    mirror: {
      section: string;
      subtitle: string;
      boundaryTitle: string;
      boundaryCount: (n: number) => string;
      boundaryDetail: string;
      patternTitle: string;
      patternLabels: Record<string, string>;
      patternDescs: Record<string, string>;
      amberPattern: string;
      // pattern callout
      weeklyPatternLabel: string;
      // heatmap
      heatmapTitle: string;
      heatmapDays: (n: number) => string;
      // team fit
      teamFitTitle: string;
      teamFitDesc: string;
      // set nav
      setActionBtn: string;
    };
    // add person modal
    addPerson: {
      title: string;
      namePlaceholder: string;
      relationTypeLabel: string;
      relationTypes: string[];
      groupLabel: string;
      groupDescriptions: string[];
      strengthPlaceholder: string;
      needPlaceholder: string;
      statePlaceholder: string;
      birthdayLabel: string;
      lastMetLabel: string;
      saveBtn: string;
      saving: string;
      cancel: string;
    };
  };
}

  // ─── homeLayout ────────────────────────────────────────────
  homeLayout: {
    amberAriaLabel: string;
    frostAriaLabel: string;
    newFeatureBadge: string;
    mainNavDesktop: string;
    mainNav: string;
    openAiMode: string;
  };

  // ─── guestLanding ──────────────────────────────────────────
  guestLanding: {
    subtitle: string;
    amberGreet: string;
    amberQuestion: string;
    inputPlaceholder: string;
    sendBtn: string;
    skipBtn: string;
    chat2Placeholder: string;
    chat2SendBtn: string;
    postsTitle: string;
    postUpvotesLabel: string;
    joinBtn: string;
    insightLabel: string;
    insightSub: string;
    insightCta: string;
    vfileSuffix: string;
    hasAccount: string;
    gateTitle: string;
    gateDesc: string;
    startFree: string;
    rightPanelTitle: string;
    rightPanelDesc: string;
  };

  // ─── notFound ──────────────────────────────────────────────
  notFound: {
    desc: string;
    cta: string;
  };

  // ─── coreQuestions ─────────────────────────────────────────
  coreQuestions: {
    subtitle: string;
    sidebarTitle: string;
    sidebarDesc1: string;
    sidebarDesc2: string;
    progressSuffix: string;
    toastTitle: string;
    toastDesc: string;
    btnStart: string;
    btnNext: string;
    questions: Array<{
      key: string;
      question: string;
      type: 'choice' | 'text';
      options?: string[];
      placeholder?: string;
    }>;
  };

  // ─── modeSelect ────────────────────────────────────────────
  modeSelect: {
    brandSubtitle: string;
    sidebarHint: string;
    step1Header: string;
    step1Sub: string;
    step2Header: string;
    step2Sub: string;
    selected: string;
    back: string;
    skipBtn: string;
    confirm: Record<string, string>;
    domains: Record<string, { name: string; sub: string; desc: string }>;
    modes: Record<string, { name: string; tagline: string; keywords: string[] }>;
  };

  // ─── vfileStart ────────────────────────────────────────────
  vfileStart: {
    subtitle: string;
    sidebarHeading: string;
    sidebarSubtext: string;
    heading: string;
    subtext: string;
    items: string[];
    btnStart: string;
    disclaimer: string;
  };

  // ─── vfileQuestions ────────────────────────────────────────
  vfileQuestions: {
    subtitle: string;
    progressLabel: string;
    honestHint: string;
    axisLabels: Record<string, string>;
    btnNext: string;
    btnPrev: string;
  };

  // ─── loginPage ─────────────────────────────────────────────
  loginPage: {
    loading: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    pageTitle: string;
    pageSubtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    submitting: string;
    submit: string;
    divider: string;
    googleLogin: string;
    noAccount: string;
    signup: string;
    errRequired: string;
    errGeneric: string;
    errInvalidCredentials: string;
    errEmailNotConfirmed: string;
    errRateLimit: string;
    errUserNotFound: string;
    errNetwork: string;
    errLoginFailed: string;
    errGoogleFailed: string;
    errGoogleGeneric: string;
  };

  // ─── signupPage ────────────────────────────────────────────
  signupPage: {
    loading: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    pageTitle: string;
    pageSubtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    strengthLabel: string;
    strengthWeak: string;
    strengthFair: string;
    strengthStrong: string;
    passwordMatch: string;
    passwordMismatch: string;
    termsPrefix: string;
    termsLink: string;
    termsSuffix: string;
    submitting: string;
    submit: string;
    divider: string;
    googleSignup: string;
    hasAccount: string;
    login: string;
    successMessage: string;
    errEmailRequired: string;
    errEmailInvalid: string;
    errPasswordRequired: string;
    errPasswordTooShort: string;
    errPasswordMismatch: string;
    errTermsRequired: string;
    errGeneric: string;
    errAlreadyRegistered: string;
    errPasswordLength: string;
    errInvalidEmail: string;
    errRateLimit: string;
    errSignupFailed: string;
    errGoogleFailed: string;
    errGoogleGeneric: string;
  };

  // ─── changeTraining ────────────────────────────────────────
  changeTraining: {
    subtitle: string;
    cancel: string;
    newSession: string;
    titlePlaceholder: string;
    goalPlaceholder: string;
    creating: string;
    startSession: string;
    loading: string;
    empty: string;
    emptySub: string;
    notePlaceholder: string;
    saving: string;
    addLog: string;
    noLogs: string;
    logAdded: string;
    sessionCreated: string;
    loginRequired: string;
    moodLabels: string[];
  };

  // ─── communityPage ─────────────────────────────────────────
  communityPage: {
    anonymousStory: string;
  };

  // ─── dmPage ────────────────────────────────────────────────
  dmPage: {
    header: string;
    subtitle: string;
    sidebarHeader: string;
    sidebarSubtitle: string;
    anonymousUser: string;
    anonymousChat: string;
    firstMessage: string;
    messagePlaceholder: string;
    send: string;
    pendingRequests: string;
    newRequest: string;
    newRequestDesc: string;
    accept: string;
    reject: string;
    noRooms: string;
    noRoomsDesc: string;
    sendFail: string;
    policyViolation: string;
  };

  // ─── routineHome ───────────────────────────────────────────
  routineHome: {
    section: string;
    daysSuffix: string;
    checkedGreetFmt: (name: string) => string;
    notCheckedGreetFmt: (name: string) => string;
    milestone: (n: number) => string;
    recentDays: string;
    nextGoal: string;
    daysFmt: (n: number) => string;
    daysLeft: (n: number) => string;
    checkinCta: string;
    checkedDone: string;
    defaultName: string;
    dayLabels: string[];
  };

  // ─── veilorDirectory ───────────────────────────────────────
  veilorDirectory: {
    title: string;
    subtitle: string;
    apply: string;
    filterAll: string;
    bannerTitle: string;
    bannerDesc: string;
    requestBtn: string;
    free: string;
    perSession: string;
    rating: string;
    noData: string;
    loading: string;
    applyTitle: string;
    applySubtitle: string;
    qualifications: string[];
    modalityLabel: string;
    priceLabel: string;
    priceChatLabel: string;
    priceCallLabel: string;
    freeToggle: string;
    nextStep: string;
    dashTitle: string;
    tabRequests: string;
    tabProfile: string;
    tabPrice: string;
    tabSettle: string;
    savePrice: string;
    priceSaved: string;
    noRequests: string;
    pending: string;
    accepted: string;
    declined: string;
    completed: string;
    requestSent: string;
    requestSentDemo: string;
    messagePlaceholder: string;
    applicationSubmitted: string;
    applicationSubmittedDemo: string;
    settlingComingSoon: string;
    myPage: string;
  };

  // ─── userProfile ───────────────────────────────────────────
  userProfile: {
    anonUser: string;
    continueChat: string;
    sendMessage: string;
    back: string;
    startChatTitle: string;
    startChatDesc: string;
    cancel: string;
    requesting: string;
    start: string;
    errorTitle: string;
    errorDesc: string;
  };

  // ─── needAssessment ────────────────────────────────────────
  needAssessment: {
    inputTitle: string;
    inputSub: string;
    layerPrefix: string;
    sliderDesired: string;
    sliderSatisfied: string;
    btnAnalyze: string;
    resultLabel: string;
    resultTitle: string;
    gapChartTitle: string;
    top3Title: string;
    anxietyFrozenTitle: string;
    anxietyFrozenBody: string;
    moderateCTATitle: string;
    moderateCTABody: string;
    moderateCTABtn: string;
    severeCTATitle: string;
    severeCTABody: string;
    severeCTABtn: string;
    btnReset: string;
    btnSaving: string;
    btnSave: string;
    pointsUnit: string;
  };

  // ─── sexSelfQuestions ──────────────────────────────────────
  sexSelfQuestions: {
    stageLabels: string[];
    privacy: string;
    btnExit: string;
    axisLabels: Record<string, string>;
    btnNext: string;
    btnPrev: string;
    noAnswer: string;
    gate1Title: string;
    gate1Body: string;
    gate1Note: string;
    gate1Continue: string;
    gate1Finish: string;
    gate2Title: string;
    gate2Body: string;
    gate2Note: string;
    gate2Continue: string;
    gate2Finish: string;
  };

  // ─── sexSelfResult ─────────────────────────────────────────
  sexSelfResult: {
    profileLabel: string;
    scoreLabels: string[];
    insightLabels: string[];
    brakeTitle: string;
    anxietyFrozenSafeTitle: string;
    anxietyFrozenSafeBody: string;
    anxietyFrozenCounselTitle: string;
    anxietyFrozenCounselBody: string;
    crisisHotline: string;
    needAssessmentTitle: string;
    needAssessmentSub: string;
    ventTitle: string;
    ventSub: string;
    btnDone: string;
    disclaimer: string;
  };

  // ─── concernRouter ─────────────────────────────────────────
  concernRouter: {
    title: string;
    tabSuffix: string;
    concerns: Array<{ id: string; label: string; icon: string; route: string; desc: string }>;
  };

  // ─── miniTools ─────────────────────────────────────────────
  miniTools: {
    title: string;
    tools: Array<{ id: string; icon: string; name: string; desc: string }>;
    breathing: { inhale: string; hold: string; exhale: string };
    grounding: { title: string; steps: Array<{ n: number; s: string; i: string }>; stepFmt: (n: number, s: string) => string };
    checkin: { title: string; emotions: string[]; done: string };
    gratitude: { title: string; placeholder: string; save: string; done: string };
    close: string;
  };

  // ─── personaBranding ───────────────────────────────────────
  personaBranding: {
    sectionTitle: string;
    rebrandingSuffix: string;
    strengthLabel: string;
    shadowLabel: string;
    reframeLabel: string;
    declarationTitle: string;
    declarationHint: (coreNeed: string) => string;
    placeholder: (reframe: string, coreNeed: string) => string;
    save: string;
    saved: string;
    brandStrategy: Record<string, { strength: string; shadow: string; reframe: string }>;
  };

  // ─── relationshipCoaching ──────────────────────────────────
  relationshipCoaching: {
    tabs: Array<{ key: 'coaching' | 'skills' | 'closure'; label: string }>;
    thisWeekPractice: string;
    prevWeek: string;
    nextWeek: string;
    closureSubtitle: string;
    skillExample: string;
    coaching: Array<{ week: number; title: string; topic: string; exercise: string }>;
    skills: Array<{ id: string; title: string; desc: string; example: string }>;
    closure: Array<{ step: number; title: string; desc: string }>;
  };

  // ─── relationshipSimulation ────────────────────────────────
  relationshipSimulation: {
    title: string;
    intro: string;
    start: string;
    end: string;
    inputPlaceholder: string;
    send: string;
    aiReady: string;
    aiThinking: string;
    aiError: string;
    scenarios: Array<{ id: string; title: string; desc: string; prompt: string }>;
  };

  // ─── ikigaiExport ──────────────────────────────────────────
  ikigaiExport: {
    exportFailTitle: string;
    exportFailNoRef: string;
    exportFailPdf: string;
    exportFailJson: string;
    exportDoneTitle: string;
    exportDonePdf: (filename: string) => string;
    exportDoneJson: string;
    pdfTitle: string;
    pdfDateLabel: (date: string) => string;
    exporting: string;
    exportButton: string;
    formatLabel: string;
    exportPdf: string;
    exportJson: string;
  };

  // ─── ikigaiIntersection ────────────────────────────────────
  ikigaiIntersection: {
    commonFound: string;
    commonFoundIn: (labels: string[]) => string;
    notEntered: string;
    suggestions: string;
    passion: { title: string; description: string; elementLabels: string[]; tips: string[] };
    mission: { title: string; description: string; elementLabels: string[]; tips: string[] };
    profession: { title: string; description: string; elementLabels: string[]; tips: string[] };
    vocation: { title: string; description: string; elementLabels: string[]; tips: string[] };
    ikigai: { title: string; description: string; elementLabels: string[]; tips: string[] };
  };

  // ─── ikigaiVenn ────────────────────────────────────────────
  ikigaiVenn: {
    diagramTitle: string;
    completeness: (pct: string, complete: boolean) => string;
    completeBadge: string;
    notEntered: string;
    moreItems: (n: number) => string;
    centerLabel: string;
    circles: { love: string; goodAt: string; worldNeeds: string; paidFor: string };
    intersections: { loveGoodAt: string; loveWorldNeeds: string; goodAtPaidFor: string; worldNeedsPaidFor: string; center: string };
    legend: { passion: string; mission: string; profession: string; vocation: string };
  };

  // ─── ikigaiStepNav ─────────────────────────────────────────
  ikigaiStepNav: {
    previous: string;
    next: string;
    complete: string;
  };

  // ─── coupleTalkAnswer ──────────────────────────────────────
  coupleTalkAnswer: {
    myAnswerLabel: string;
    editButton: string;
    placeholder: string;
    saving: string;
    save: string;
    partnerAnswerLabel: string;
    partnerPending: string;
  };

  // ─── coupleTalkCardFlip ────────────────────────────────────
  coupleTalkCardFlip: {
    backButton: string;
    backAriaLabel: string;
    tapToSee: string;
    tapToClose: string;
    flipAriaOpen: string;
    flipAriaClose: string;
    prev: string;
    next: string;
    prevAriaLabel: string;
    nextAriaLabel: string;
    categoryLabels: Record<string, string>;
  };

  // ─── coupleTalkDeckSelector ────────────────────────────────
  coupleTalkDeckSelector: {
    heading: string;
    subheading: string;
    deckAriaLabel: (name: string) => string;
    lockHint: string;
    decks: Record<string, { label: string; sublabel: string }>;
  };

  // ─── coupleTalkPartnerInvite ───────────────────────────────
  coupleTalkPartnerInvite: {
    heading: string;
    subheading: string;
    inviteTitle: string;
    tokenExpiry: string;
    copyAriaLabel: string;
    issuingCode: string;
    issueButton: string;
    enterCodeTitle: string;
    enterCodeSub: string;
    connecting: string;
    connectButton: string;
    defaultError: string;
    errSessionCreate: string;
    errInvalidCode: string;
    errCodeUsed: string;
    errOwnCode: string;
    errExpiredCode: string;
    errConnecting: string;
    errAnswerSave: string;
    errConsentSave: string;
  };

  // ─── coupleTalkSexDeck ─────────────────────────────────────
  coupleTalkSexDeck: {
    backButton: string;
    titleUnlocked: string;
    titleLocked: string;
    description: string;
    me: string;
    partner: string;
    consented: string;
    notConsented: string;
    processing: string;
    agreeButton: string;
    waitingPartner: string;
    safetyNotice: string;
  };

  // ─── diveAnalysis ──────────────────────────────────────────
  diveAnalysis: {
    headerTitle: string;
    emotionDist: string;
    coreConflict: string;
    behaviorPattern: string;
    suggestedSolutions: string;
    disclaimer: string;
  };

  // ─── voiceRecorder ─────────────────────────────────────────
  voiceRecorder: {
    ariaStop: string;
    ariaStart: string;
    ariaStopInput: string;
    ariaStartInput: string;
  };

  // ─── codetalkKeywordCard ───────────────────────────────────
  codetalkKeywordCard: {
    milestoneLabels: readonly string[];
    milestoneMessages: Record<number, string>;
    streakDays: (n: number) => string;
    complete: (n: number) => string;
    todayKeyword: string;
  };

  // ─── codetalkKeywordDialog ─────────────────────────────────
  codetalkKeywordDialog: {
    definitionCount: (n: number) => string;
    statsSummary: string;
    mostEmotion: string;
    loading: string;
    emotionDesc: (emotion: string) => string;
    noData: string;
    avgLikes: string;
    avgLikesDesc: (n: number) => string;
    participants: string;
    participantsDesc: (n: number) => string;
    avgLength: string;
    avgLengthDesc: (n: number) => string;
    keyDefinitions: string;
    loadingDefs: string;
    noDefinitions: string;
  };

  // ─── codetalkStoryFeed ─────────────────────────────────────
  codetalkStoryFeed: {
    todayTab: string;
    pastTab: string;
    storyAbout: (keyword: string) => string;
    participantCount: (n: number) => string;
    anon: string;
    defLabel: string;
    imprintLabel: string;
    rootLabel: string;
    noTodayStory: string;
    noTodayStoryDesc: string;
    pastDayRange: (n: number) => string;
    noPastStory: string;
    feedLocked: string;
    feedLockedDesc: string;
    yesterdayKeyword: (keyword: string) => string;
    participantsLeft: (n: number, nextDay: number, isLast: boolean) => string;
  };

  // ─── codetalkTodayKeyword ──────────────────────────────────
  codetalkTodayKeyword: {
    defTooLong: string;
    memTooLong: string;
  };

  // ─── detailedAnalysis ──────────────────────────────────────
  detailedAnalysis: {
    title: string;
    noDataTitle: string;
    noDataDesc: string;
    noDataHint: string;
    categoryLabels: Record<string, string>;
    perspectives: Record<string, { title: string; desc: string }>;
    insightsTitle: string;
    insightDominant: Record<string, string>;
    emotionInsightFmt: (label: string, score: number) => string;
    keywordsInsightFmt: (keywords: string) => string;
    emptyCategoryFmt: string;
    reasonPrefix: string;
    countSuffix: (n: number) => string;
    keywordsTitle: string;
    keywordsEmpty: string;
    emotionTitle: string;
    emotionScoreLabel: string;
    emotionLabels: Record<string, string>;
    actionsTitle: string;
    actions: Record<string, string[]>;
  };

  // ─── sessionClosing ────────────────────────────────────────
  sessionClosing: {
    breathingSteps: Array<{ text: string; duration: number; phase: 'in' | 'hold' | 'out' }>;
    closingPrompts: string[];
    introTitle: string;
    introDescMany: (n: number) => string;
    introDescFew: string;
    introWithEmotion: (emotion: string) => string;
    btnBreathing: string;
    btnReflection: string;
    btnSkip: string;
    breathingCountFmt: (n: number) => string;
    breathDuration: { in: string; hold: string; out: string };
    reflectionTitle: string;
    placeholder: string;
    btnSave: string;
    btnSkipReflection: string;
    doneTitle: string;
    doneDesc: string;
    btnClose: string;
  };

  // ─── emotionWheel ──────────────────────────────────────────
  emotionWheel: {
    ariaLabel: string;
    emotions: string[];
  };

  // ─── upgradeModal ──────────────────────────────────────────
  upgradeModal: {
    features: string[];
    errorRetry: string;
    interestDoneTitle: string;
    interestDoneDesc: string;
    processing: string;
    notifyMe: string;
    dismiss: string;
    webOnlyNotice: string;
    appNotice: string;
  };

  // ─── contentRecommendations ────────────────────────────────
  contentRecommendations: {
    cardTitle: string;
    loadFail: string;
    retry: string;
    emptyTitle: string;
    emptyDesc: string;
    relevance: (pct: number) => string;
    typeLabels: Record<string, string>;
  };

  // ─── routineCheckin ────────────────────────────────────────
  routineCheckin: {
    moodItems: Array<{ label: string; text: string }>;
    energyItems: Array<{ label: string; text: string }>;
    activityItems: string[];
    mood: { stepLabel: string; title: string; hint: string };
    energy: { stepLabel: string; title: string; hint: string; back: string };
    activity: { stepLabel: string; title: string; back: string; save: string; saving: string; skip: string };
    done: {
      streakUnit: string;
      milestoneTitle: (n: number) => string;
      milestoneDesc: string;
      regularTitle: (n: number) => string;
      regularDesc: string;
      currentStreak: string;
      home: string;
    };
    saveError: string;
  };

  // ─── appCustomization ──────────────────────────────────────
  appCustomization: {
    themeTitle: string;
    recommendedFmt: (name: string, theme: string) => string;
    reminderTitle: string;
    reminderTime: string;
    reminderDays: string;
    reminderDesc: (time: string) => string;
    themes: Record<string, string>;
    days: string[];
    langTitle: string;
    langKo: string;
    langEn: string;
    autoTranslateLabel: string;
    autoTranslateOff: string;
    autoTranslateOn: string;
    creditsBalance: (n: number) => string;
    proOnly: string;
  };

  // ─── voiceCloneSettings ────────────────────────────────────
  voiceCloneSettings: {
    proOnly: string;
    proDesc: string;
    proCta: string;
    intro: (min: number) => string;
    voiceRegistered: string;
    voiceAmberUsing: string;
    reRegister: string;
    voiceNameLabel: string;
    voiceNamePlaceholder: string;
    defaultVoiceName: string;
    startRecording: string;
    waitFmt: (sec: number) => string;
    canStop: string;
    needMore: (sec: number) => string;
    stopAndRegister: string;
    cancel: string;
    uploading: string;
    reRecord: string;
    retry: string;
    errLoginRequired: string;
    errVoiceClone: (status: number) => string;
    errUpload: string;
    errMicDenied: string;
    errTtsLoginRequired: string;
    errTts: (status: number) => string;
    errTtsUnknown: string;
  };

  // ─── kinkLanguage ──────────────────────────────────────────
  kinkLanguage: {
    sectionTitle: string;
    shameTitle: string;
    shameDesc: string;
  };

  // ─── experientialContent ───────────────────────────────────
  experientialContent: {
    close: string;
    prev: string;
    next: string;
    complete: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaVent: string;
    ctaDig: string;
    ctaSet: string;
    listTitle: string;
    filterAll: string;
    filterLv: (lv: number) => string;
    experiences: Array<{
      id: string;
      type: string;
      title: string;
      desc: string;
      steps: string[];
      duration: string;
      level: number;
    }>;
    prompts: Record<string, string>;
  };

  // ─── notificationDropdown ──────────────────────────────────
  notificationDropdown: {
    title: string;
    markAllRead: string;
    loading: string;
    empty: string;
    viewAll: string;
  };

  // ─── pushNotification ──────────────────────────────────────
  pushNotification: {
    unsupportedTitle: string;
    unsupportedDesc: string;
    unsubscribedTitle: string;
    unsubscribedDesc: string;
    permissionTitle: string;
    permissionDesc: string;
    swError: string;
    subscribedTitle: string;
    subscribedDesc: string;
    subscribeError: string;
    errorTitle: string;
    errorDesc: string;
    label: string;
    processing: string;
    enabled: string;
    enable: string;
  };
  brandDomain: {
    analysis: {
      dataStatus: string;
      ikigaiData: string;
      whyData: string;
      totalItems: (n: number) => string;
      totalJobs: (n: number) => string;
      more: (n: number) => string;
      ikigaiRequired: string;
      ikigaiCta: string;
      whyRequired: string;
      whyCta: string;
      happy: string;
      pain: string;
      ikigaiElements: string;
      whyPattern: string;
      happyPattern: string;
      painPattern: string;
      dataMissing: string;
      dataMissingDesc: string;
    };
    direction: {
      cardTitle: string;
      cardDesc: string;
      fieldLabel: string;
      fieldPlaceholder: string;
      fieldHint: string;
      positioningLabel: string;
      positioningPlaceholder: string;
      positioningHint: string;
      coreMessageLabel: string;
      coreMessagePlaceholder: string;
      coreMessageHint: string;
      tipsTitle: string;
      tip1: string;
      tip1Desc: string;
      tip2: string;
      tip2Desc: string;
      tip3: string;
      tip3Desc: string;
      previewTitle: string;
      previewField: string;
      previewFieldEmpty: string;
      previewPositioning: string;
      previewPositioningEmpty: string;
      previewMessage: string;
      previewMessageEmpty: string;
    };
    naming: {
      cardTitle: string;
      cardDesc: string;
      aiSuggestedLabel: string;
      selectedBadge: string;
      noAiNames: string;
      customInputLabel: string;
      customInputPlaceholder: string;
      generateTitle: string;
      favoriteWordsLabel: string;
      favoriteWordsPlaceholder: string;
      favoriteBrandsLabel: string;
      favoriteBrandsPlaceholder: string;
      generateBtn: string;
      selectedNameTitle: string;
      selectedNameConfirm: string;
      noSelectedName: string;
      tipsTitle: string;
      tip1: string;
      tip1Desc: string;
      tip2: string;
      tip2Desc: string;
      tip3: string;
      tip3Desc: string;
      tip4: string;
      tip4Desc: string;
      tip5: string;
      tip5Desc: string;
    };
    strategy: {
      exportSuccessTitle: string;
      exportSuccessDesc: (fileName: string) => string;
      exportFailTitle: string;
      exportFailDesc: string;
      exportBtnLabel: string;
      strategyTitle: string;
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: (channels: string) => string;
      step3Title: string;
      step3Desc: (topic: string) => string;
      step4Title: string;
      step4Desc: (channel: string, model: string) => string;
      nextStepsTitle: string;
      pdfCreatedAt: (date: string) => string;
      brandName: string;
      brandTagline: string;
      brandTarget: string;
      brandTone: string;
      brandPositioning: string;
      brandCoreMessage: string;
      noNamingData: string;
      noDirectionData: string;
      noContentData: string;
      noRevenueData: string;
    };
    contentStrategy: {
      cardTitle: string;
      cardDesc: string;
      topicsLabel: string;
      topicsPlaceholder: string;
      topicsSummary: (n: number) => string;
      formatsLabel: string;
      formatsPlaceholder: string;
      formatsSummary: (n: number) => string;
      channelsLabel: string;
      channelsPlaceholder: string;
      channelsSummary: (n: number) => string;
      addTopic: string;
      addFormat: string;
      addChannel: string;
      suggestTopics: string;
      suggestFormats: string;
      suggestChannels: string;
      moreItems: (n: number) => string;
      tipsTitle: string;
      tip1: string;
      tip1Desc: string;
      tip2: string;
      tip2Desc: string;
      tip3: string;
      tip3Desc: string;
    };
    revenueModel: {
      cardTitle: string;
      cardDesc: string;
      modelsLabel: string;
      modelsPlaceholder: string;
      priceRangeLabel: string;
      priceRangePlaceholder: string;
      channelsLabel: string;
      channelsPlaceholder: string;
      addModel: string;
      addPrice: string;
      addChannel: string;
      suggestModels: string;
      suggestPrices: string;
      suggestChannels: string;
      moreItems: (n: number) => string;
      tipsTitle: string;
      tip1: string;
      tip1Desc: string;
      tip2: string;
      tip2Desc: string;
      tip3: string;
      tip3Desc: string;
    };
    targetAudience: {
      cardTitle: string;
      cardDesc: string;
      ageRangeLabel: string;
      ageRangePlaceholder: string;
      genderLabel: string;
      interestsLabel: string;
      interestsPlaceholder: string;
      interestsSummary: (n: number) => string;
      painPointsLabel: string;
      painPointsPlaceholder: string;
      painPointsSummary: (n: number) => string;
      channelsLabel: string;
      channelsPlaceholder: string;
      channelsSummary: (n: number) => string;
      addInterest: string;
      addPainPoint: string;
      addChannel: string;
      suggestInterests: string;
      suggestPainPoints: string;
      suggestChannels: string;
      moreItems: (n: number) => string;
      tipsTitle: string;
      tip1: string;
      tip1Desc: string;
      tip2: string;
      tip2Desc: string;
      tip3: string;
      tip3Desc: string;
    };
  };
  communityDomain: {
    cohortCard: {
      inProgress: (memberCount: number, daysLeft: number) => string;
      joinTitle: string;
      joinDesc: string;
      join: string;
    };
    discussionBoard: {
      placeholder: string;
      cancel: string;
      post: string;
      writeButton: string;
      noPosts: string;
    };
    externalContentFeed: {
      allCategory: string;
      sectionTitle: string;
      curation: string;
    };
    learningMateCard: {
      title: string;
      sameMask: string;
      desc: (mask: string) => string;
      anon: string;
      connect: string;
    };
    partnerCodetalk: {
      title: string;
      desc: string;
      me: string;
      partner: string;
      emailPlaceholder: string;
      inviteButton: string;
      inviteSent: string;
      partnerNotFound: string;
      inviteKeyword: string;
      inviteDefinition: string;
    };
    personalMatchRequest: {
      cardTitle: string;
      cardDesc: string;
      emailLabel: string;
      emailPlaceholder: string;
      requesting: string;
      request: string;
      errRequired: string;
      errInvalid: string;
      condTitle: string;
      resultTitle: string;
    };
    tabCommunityFeed: {
      postCount: (n: number) => string;
      noPosts: string;
      cancel: string;
      share: string;
      shareButton: string;
    };
  };
  coupleDomain: {
    coupleAnalysis: {
      ourPattern: string;
      disconnect: string;
      me: string;
      partnerFallback: string;
      compat: string;
      relationDynamics: string;
      bothPredatory: (cat: string) => string;
      mixedCategory: (cat: string) => string;
      attractionPairLabel: string;
      longTerm: (v: string) => string;
      myCoreNeed: string;
      partnerCoreNeed: string;
      patternSimilarity: string;
      tabMulti: string;
      tabCouple: string;
      tabMatch: string;
    };
    crossSessionAnalysis: {
      sectionTitle: string;
      me: (n: number) => string;
      partner: (n: number) => string;
      strengthAxis: string;
      growthAxis: string;
      avg: (n: number) => string;
      axisLabels: Record<string, string>;
    };
    inviteSection: {
      inviteTitle: string;
      inviteDesc: string;
      copied: string;
      copy: string;
      expiry: string;
      issuing: string;
      issueCode: string;
      enterCodeTitle: string;
      enterCodeDesc: string;
      connectSuccess: string;
      connecting: string;
      connect: string;
      errLoginRequired: string;
      errCodeIssue: string;
      errInvalidCode: string;
      errCodeUsed: string;
      errCodeExpired: string;
      errOwnCode: string;
      errAccept: string;
      errConnect: string;
      errDisconnect: string;
      errDefault: string;
    };
    matchSuggestion: {
      title: string;
      subtitle: string;
      anonymous: string;
      compat: string;
    };
    multiPersonaAnalysis: {
      title: string;
      emptyDesc: string;
      emptyHint: string;
      contextGeneral: string;
      contextSocial: string;
      contextSecret: string;
      allSameMask: string;
      diffMask: string;
    };
  };
  personaDomain: {
    detectionTrigger: {
      analyzing: string;
      analyzingTitle: string;
      discoveredFmt: (n: number) => string;
      discoveredDesc: string;
      mainBadge: string;
      subBadge: string;
      multiTitle: string;
      multiDesc: string;
      ctaMain: string;
      ctaPro: string;
      ctaLater: string;
    };
    growthDashboard: {
      title: string;
      subtitle: string;
      loading: string;
      empty: string;
      emptyState: string;
      addMilestone: string;
      goalLabel: string;
      goalPlaceholder: string;
      goalDesc: string;
      timelineTitle: string;
      prevLabel: (n: number) => string;
      currentLabel: (n: number) => string;
      completedDate: (d: string) => string;
      targetDate: (d: string) => string;
      growthDesc: (name: string) => string;
      overallProgress: string;
      keywordsEvolution: string;
      strengthTrend: string;
      strengthLabel: string;
      milestonesTab: string;
      growthTab: string;
      noMilestones: string;
      completed: string;
      growthTitle: string;
      currentStrength: string;
      prevMeasure: string;
      changeAmount: string;
      notEnoughData: string;
      growthTip: string;
    };
    ikigaiCanvas: {
      emptyDesc: string;
      mainBadge: string;
      strengthFmt: (n: number) => string;
      keywordsFmt: (kws: string) => string;
    };
    map: {
      mapTitle: string;
      loading: string;
      emptyTitle: string;
      emptyDesc: string;
      activeFmt: (active: number, suppressed: number, conflict: number) => string;
      patternBasis: string;
      meBadge: string;
      statusLabels: Record<string, string>;
      conflict: string;
      patternAxis: string;
      activeness: string;
      descLabel: string;
      suppressedCandidate: string;
      suppressedDesc: string;
      detectedSignals: string;
      signalSummary: string;
      noContent: string;
      conflictRelation: string;
      unknownPersona: string;
      contributingPatterns: string;
      confidence: string;
      signalCount: string;
    };
    switcher: {
      upgradeLabel: string;
      manageLabel: string;
      manageBtn: string;
    };
    verificationFlow: {
      titleEdit: string;
      titleVerify: string;
      descEdit: string;
      descVerify: string;
      strengthSuffix: (n: number) => string;
      themeLabel: string;
      keywordsLabel: string;
      btnAccept: string;
      btnEdit: string;
      nameLabel: string;
      namePlaceholder: string;
      descLabel: string;
      descPlaceholder: string;
      cancel: string;
      saveVerify: string;
    };
    unifiedBranding: {
      pageTitle: string;
      pageSubtitleFmt: (count: number) => string;
      loading: string;
      noPersonas: string;
      noPersonasDesc: string;
      selectPersona: string;
      strategyLabel: string;
      generateBtn: string;
      generating: string;
    };
    relationshipGraph: {
      analyzing: string;
      loading: string;
      needMore: string;
      analysisNeeded: string;
      analysisDesc: string;
      startAnalysis: string;
      graphTitle: string;
      graphDescFmt: (personas: number, relations: number) => string;
      reanalyze: string;
      synergy: string;
      neutral: string;
      conflict: string;
      synergyRelation: string;
      conflictRelation: string;
      neutralRelation: string;
      strengthFmt: (n: number) => string;
      commonKeywords: string;
      aiInsight: string;
      actionSuggestion: string;
      synergyAction: string;
      neutralAction: string;
      conflictAction: string;
    };
    toasts: {
      brandingStrategySaved: string;
      brandingStrategySaveError: string;
      growthMetricRecorded: string;
      growthMetricRecordError: string;
      ikigaiSaved: string;
      ikigaiSaveError: string;
      milestoneComplete: string;
      milestoneIncomplete: string;
      milestoneUpdateError: string;
      milestoneCreated: string;
      milestoneCreateError: string;
      personasDetectedFmt: (count: number) => string;
      personasDetectedDesc: string;
      personaDetectError: string;
      personaUpdated: string;
      personaUpdateError: string;
      personaConfirmed: string;
      personaConfirmError: string;
      personaDeactivated: string;
      personaDeactivateError: string;
      activePersonaChanged: string;
      activePersonaChangeError: string;
      relationshipAnalysisComplete: string;
      relationshipAnalysisError: string;
    };
  };
  personaPages: {
    personas: {
      noPersonaTitle: string;
      noPersonaDesc: string;
      noPersonaCta: string;
      pageTitle: string;
      multiPersonaFmt: (count: number) => string;
      mainPersonaOnly: string;
      badgeMain: string;
      strengthFmt: (pct: number) => string;
      themeLabel: string;
      keywordLabel: string;
      viewPrimePerspective: string;
      ikigaiDesign: string;
      subPersonasTitle: string;
      proOnly: string;
      lockedDesc: string;
      relationshipTitle: string;
      relationshipDesc: string;
      relationshipCta: string;
    };
    personaRelationships: {
      pageTitle: string;
      metaDesc: string;
      heading: string;
      subheading: string;
      tabRelationships: string;
      tabBranding: string;
      tabGrowth: string;
    };
  };
  b2bDomain: {
    checkin: {
      loading: string;
      loadFail: string;
      orgNotFound: string;
      submitFail: string;
      doneTitle: string;
      doneSub: string;
      backHome: string;
      progressFmt: (current: number, total: number) => string;
      prev: string;
      next: string;
      submit: string;
      submitting: string;
    };
    coachList: {
      sessionCount: (n: number) => string;
      available: string;
      full: string;
      allFilter: string;
      back: string;
      title: string;
      subtitle: string;
      loadError: string;
      noCoaches: string;
      noDomainCoaches: (d: string) => string;
    };
    coachMatch: {
      pageTitle: string;
      pageSub: string;
      noMatch: string;
      noMatchDesc: string;
      reqTitle: string;
      goalLabel: string;
      goalPlaceholder: string;
      preferredLabel: string;
      notesLabel: string;
      notesPlaceholder: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successDesc: string;
    };
    coachPortal: {
      tabs: { members: string; sessions: string; posts: string };
      notCoach: string;
      goBack: string;
      back: string;
      responsibleCount: (cur: number, max: number) => string;
      noMembers: string;
      sessionCount: (n: number) => string;
      latestCheckin: (d: string) => string;
      cIndex: (v: string) => string;
      noSessions: string;
      markDone: string;
      cancelSession: string;
      coachNotes: string;
      confirm: string;
      newPost: string;
      noPost: string;
      editPost: string;
      deleteConfirm: string;
      deletePost: string;
      postEditorTitle: (isEditing: boolean) => string;
      titlePlaceholder: string;
      bodyPlaceholder: string;
      tagsPlaceholder: string;
      saving: string;
      savePost: (isEditing: boolean) => string;
    };
    coachProfile: {
      back: string;
      notFound: string;
      pinBadge: string;
      collapse: string;
      expand: string;
      sessionCount: (n: number) => string;
      memberCount: (cur: number, max: number) => string;
      certifications: (c: string) => string;
      postFeedLabel: (n: number | null) => string;
      noPosts: string;
      bookSession: string;
      fullSession: string;
    };
    guardianApp: {
      loading: string;
      unauthorized: string;
      pageTitle: string;
      tabs: { overview: string; alerts: string; settings: string };
      alertsCount: (n: number) => string;
      riskLabels: Record<string, string>;
      totalMembers: string;
      checkinRate: string;
      riskHigh: string;
      riskMedium: string;
      noAlerts: string;
      alertCardTitle: (name: string) => string;
      alertCardSub: (date: string) => string;
      contactBtn: string;
      settingsTitle: string;
      notifLabel: string;
      languageLabel: string;
    };
    inviteAccept: {
      loading: string;
      invalidCode: string;
      invalidDesc: string;
      backHome: string;
      pageTitle: string;
      orgLabel: string;
      planLabel: string;
      accepting: string;
      accept: string;
      successTitle: string;
      successDesc: string;
    };
    memberInvite: {
      pageTitle: string;
      pageSub: string;
      emailLabel: string;
      emailPlaceholder: string;
      memberTypeLabel: string;
      memberTypeLabels: Record<string, string>;
      ageGroupLabel: string;
      ageGroupLabels: Record<string, string>;
      inviting: string;
      invite: string;
      successTitle: string;
      successFmt: (email: string) => string;
    };
    orgDashboard: {
      dashboard: string;
      orgTypeLabels: Record<string, string>;
      memberCount: (n: number) => string;
      inviteMember: string;
      tabs: Record<string, string>;
      privacyNote: string;
      perfIndexLabel: string;
      perfIndexSub: string;
      checkinRateLabel: string;
      checkinDone: (n: number) => string;
      coachingSessionLabel: string;
      satisfactionSub: (r: string) => string;
      totalMemberLabel: string;
      activeMemberSub: (n: number) => string;
      weekConditionTitle: string;
      riskHighLabel: string;
      riskMediumLabel: string;
      riskLowLabel: string;
      riskNormalLabel: string;
      riskHighAlert: (n: number) => string;
      radarTitle: string;
      trendTitle: string;
      noData: string;
      noDataTrend: string;
      upcomingEventTitle: string;
      membersTabTitle: (n: number) => string;
      addMember: string;
      noMember: string;
      memberType: Record<string, string>;
      joined: string;
      statusActive: string;
      statusInactive: string;
      eventCalendarTitle: string;
      addEvent: string;
      newEventTitle: string;
      eventTypeSelect: string;
      eventOptGroups: Record<string, string>;
      eventOptions: Record<string, string>;
      eventNamePlaceholder: string;
      cancelBtn: string;
      saveBtn: string;
      autoCheckinNote: string;
      autoCheckinOn: string;
      noEvent: string;
      coachingTabTitle: string;
      coachManage: string;
      thisMonthSession: string;
      avgSatisfaction: string;
      planIncluded: string;
      planIncludedValue: string;
      planExtraNote: string;
      sessionPrivacy: string;
      fourCAvgTooltip: string;
      tbqcTitle: string;
      completionRateLabel: string;
      tbqcAccuracyLabel: string;
      rolloverLabel: string;
      activeMembersWorkLabel: string;
      burnoutAlert: string;
    };
    orgOnboarding: {
      registerDone: string;
      registerDoneDesc: (name: string) => string;
      registerFail: string;
      retryMsg: string;
      step0Title: string;
      step0Subtitle: string;
      orgNameLabel: string;
      orgNamePlaceholder: string;
      orgTypeLabel: string;
      step1Title: string;
      step1Subtitle: string;
      planNote: string;
      step2Title: string;
      confirmOrgName: string;
      confirmType: string;
      confirmPlan: string;
      confirmPrice: string;
      confirmContractStart: string;
      notice1: string;
      notice2: string;
      notice3: string;
      prev: string;
      next: string;
      starting: string;
      startService: string;
      orgTypeLabels: Record<string, string>;
    };
    traineeCheckin: {
      saveError: string;
      saveErrorDesc: string;
      doneTitle: string;
      doneSubtitle: string;
      highAlert: string;
      highAlertDesc: string;
      mediumAlert: string;
      backBtn: string;
      emoji911Title: string;
      emoji911Sub: string;
      goodThingPrompt: string;
      goodThingPlaceholder: string;
      doneBtn: string;
      lowScoreMsg: string;
      diaryTitle: string;
      diarySubtitle: string;
      diaryPlaceholder: string;
      prev: string;
      next: string;
      scaleLeft: string;
      scaleRight: string;
      optionalInput: string;
      freeTextTitle: string;
      freeTextSubtitle: string;
      freeTextPlaceholder: string;
      lastOne: string;
      done2: string;
      emojiOptions: Array<{ score: number; emoji: string; label: string }>;
      slider1214: Array<{ key: string; q: string }>;
      axes1517: Array<{ label: string; q: string; key: string }>;
    };
    errors: {
      loginRequired: string;
      createOrgFailed: string;
      loadOrgFailed: string;
      inviteExpired: string;
      inviteAcceptFailed: string;
      loadMembersFailed: string;
      loadCheckinFailed: string;
      checkinSaveFailed: string;
      loadAggregateFailed: string;
      loadEventsFailed: string;
    };
  };
  adminDomain: {
    dashboard: {
      title: string;
      subtitle: string;
      totalSuffix: (n: string) => string;
      maskLabels: Record<string, string>;
      concernLabels: Record<string, string>;
      relationLabels: Record<string, string>;
      attachLabels: Record<string, string>;
      attachUnknown: string;
      tabs: { key: 'b2c' | 'b2b' | 'virtual' | 'ai_interest'; label: string }[];
      statCards: {
        totalVirtual: string;
        withSession: string;
        multiGroup: string;
        multiGroupSub: string;
        avgGroup: string;
        avgGroupSuffix: (n: string) => string;
      };
      sections: {
        fragDist: { title: string; sub: string };
        groupDist: { title: string; sub: string };
        groupCountDist: { title: string; sub: string };
        groupCountSuffix: (n: string) => string;
        maskDist: { title: string; sub: string };
        attachDist: { title: string; sub: string };
        concernDist: { title: string; sub: string };
        relationDist: { title: string; sub: string };
        fragNameDist: { title: string; sub: string };
        axisAvg: { title: string; sub: string };
        axisDist: { title: string; sub: string };
        funnel: { title: string; sub: string; convRate: string };
      };
      axisLabels: string[];
      fragCountLabels: string[];
      groupCountSuffix2: (n: string) => string;
      userCountSuffix: string;
    };
    b2bTab: {
      statCards: {
        totalOrgs: string;
        activeOrgs: string;
        registeredCoaches: string;
        activeCoachesSub: (n: number) => string;
        recentCheckins: string;
      };
      trendSection: { title: string; sub: string };
      avgC: string;
      highRisk: string;
      mediumRisk: string;
      orgSection: { title: string; sub: string };
      noOrgs: string;
      orgTableHeaders: Record<string, string>;
      coachSection: { title: string; sub: string };
      newCoachTitle: string;
      namePlaceholder: string;
      bioPlaceholder: string;
      maxMembersLabel: string;
      saving: string;
      register: string;
      noCoaches: string;
      coachSessionCount: (n: number) => string;
      coachMemberCount: (cur: number, max: number) => string;
      statusActive: string;
      statusInactive: string;
      unitSuffix: string;
      personSuffix: string;
      timeSuffix: string;
      domainOptions: { value: string; label: string }[];
      orgTypeLabels: Record<string, string>;
      planLabels: Record<string, string>;
      errorPrefix: string;
      coachRegistered: string;
    };
    virtualInjectTab: {
      todayActivityTitle: string;
      todayCommPosts: string;
      todayCodetalkEntries: string;
      totalCommPosts: string;
      totalCodetalkEntries: string;
      injectTitle: string;
      injectSub: string;
      commLabel: string;
      commNote: string;
      codetalkLabel: string;
      codetalkNote: string;
      injecting: string;
      injectBtn: (commCount: number, codetalkCount: number) => string;
      injectDone: string;
      dateLabel: string;
      commResult: (inserted: number, skipped: number) => string;
      codetalkResult: (inserted: number, skipped: number) => string;
      errorPrefix: string;
    };
  };

  // ─── eventsPage ────────────────────────────────────────────────
  eventsPage: {
    subtitle: string;
    newEvent: string;
    titlePlaceholder: string;
    descPlaceholder: string;
    locationPlaceholder: string;
    creating: string;
    createButton: string;
    loading: string;
    empty: string;
    emptyHint: string;
    participantCount: (n: number) => string;
    join: string;
    cancelJoin: string;
    created: string;
    createFailed: string;
  };

  // ─── specialistPage ────────────────────────────────────────────
  specialistPage: {
    subtitle: string;
    veilorFirst: string;
    veilorFirstDesc: string;
    profile: string;
    connectionRequest: string;
    cancel: string;
    reasonPlaceholder: string;
    sending: string;
    send: string;
    requestSent: string;
    loading: string;
    empty: string;
    handoffStatus: {
      pending: string;
      accepted: string;
      declined: string;
      completed: string;
    };
    all: string;
  };

  // ─── pairTrustPage ─────────────────────────────────────────────
  pairTrustPage: {
    subtitle: string;
    grant: string;
    cancel: string;
    granteePlaceholder: string;
    levelGuide: string;
    granting: string;
    grantButton: string;
    granted: string;
    grantFailed: string;
    revoke: string;
    revoking: string;
    revoked: string;
    loading: string;
    empty: string;
    directionOut: string;
    directionIn: string;
    granteePrefix: string;
    grantorPrefix: string;
    levels: {
      1: { label: string; desc: string };
      2: { label: string; desc: string };
      3: { label: string; desc: string };
    };
  };

  // ─── contentImportPage ─────────────────────────────────────────
  contentImportPage: {
    subtitle: string;
    pasteFromClipboard: string;
    historyTitle: string;
    loading: string;
    empty: string;
    noSignals: string;
    registering: string;
    importButton: string;
    requestSent: string;
    requestFailed: string;
    clipboardPermission: string;
    notionPending: string;
    twitterPending: string;
    statusLabels: {
      pending: string;
      processing: string;
      done: string;
      failed: string;
    };
  };

  // ─── vfileResult ───────────────────────────────────────────────
  vfileResult: {
    subtitle: string;
    sidebarHeading: string;
    sidebarSubtext: string;
    yourVFile: string;
    complexSuffix: string;
    radarAxes: Record<string, string>;
    declaration: string[];
    btnStart: string;
    btnDone: string;
    disclaimer: string;
  };

  // ─── personaPaywall ─────────────────────────────────────────────
  personaPaywall: {
    triggers: {
      discovery: (n: number) => { title: string; description: string };
      ikigai: (n: number) => { title: string; description: string };
      branding: (n: number) => { title: string; description: string };
      default: (n: number) => { title: string; description: string };
    };
    freeLabel: string;
    freeFeatures: string[];
    proLabel: string;
    recommended: string;
    proFeatures: (n: number) => string[];
    ctaLater: string;
    webOnlyNotice: string;
  };
}

/** Locale map keyed by supported language codes */
export type LocaleMap = Record<SupportedLanguage, LocaleResource>;
