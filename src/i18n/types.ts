// i18n type definitions for VEILRUM

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
    greetings: {
      earlyMorning: { title: string; placeholder: string };
      morning: { title: string; placeholder: string };
      lunch: { title: string; placeholder: string };
      afternoon: { title: string; placeholder: string };
      evening: { title: string; placeholder: string };
      night: { title: string; placeholder: string };
      lateNight: { title: string; placeholder: string };
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
    };
    layers: {
      title: string;
      prompt: string;
      writePlaceholder: string;
      social: { label: string; sub: string; items: Record<string, string> };
      daily: { label: string; sub: string; items: Record<string, string> };
      secret: { label: string; sub: string; items: Record<string, string> };
      tags: { locked: string; sensitive: string; normal: string };
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
    errorTitle: string;
    trendLabels: {
      rising: string;
      declining: string;
      stable: string;
    };
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
    };
    axmercer: Record<string, string>;
  };
  get: {
    header: string;
    subtitle: string;
    tabs: {
      identity: string;
      why: string;
      ikigai: string;
      brand: string;
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
    };
    zone: {
      title: string;
      subtitle: string;
      precision: string;
      frostMessage: string;
    };
    rename: {
      amber: string;
      frost: string;
    };
    dmToast: string;
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
}

/** Locale map keyed by supported language codes */
export type LocaleMap = Record<SupportedLanguage, LocaleResource>;
