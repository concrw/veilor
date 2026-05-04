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
    };
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

/** Locale map keyed by supported language codes */
export type LocaleMap = Record<SupportedLanguage, LocaleResource>;
