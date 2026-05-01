import { useMemo } from 'react';
import { useVentTranslations } from './useTranslation';

export function useVentData() {
  const vent = useVentTranslations();

  const EMOTIONS = useMemo(() => [
    { label: vent.emotions.anxious,  svg: 'anxious'  },
    { label: vent.emotions.sad,      svg: 'sad'      },
    { label: vent.emotions.angry,    svg: 'angry'    },
    { label: vent.emotions.confused, svg: 'confused' },
    { label: vent.emotions.lonely,   svg: 'lonely'   },
    { label: vent.emotions.numb,     svg: 'numb'     },
    { label: vent.emotions.tired,    svg: 'tired'    },
    { label: vent.emotions.hurt,     svg: 'hurt'     },
  ], [vent]);

  const EMO_DATA = useMemo(() => ({
    [vent.emotions.anxious]:  { count: 142, questions: vent.emotionQuestions.anxious.questions,  suggestion: vent.emotionQuestions.anxious.suggestion  },
    [vent.emotions.sad]:      { count: 98,  questions: vent.emotionQuestions.sad.questions,      suggestion: vent.emotionQuestions.sad.suggestion      },
    [vent.emotions.angry]:    { count: 76,  questions: vent.emotionQuestions.angry.questions,    suggestion: vent.emotionQuestions.angry.suggestion    },
    [vent.emotions.confused]: { count: 54,  questions: vent.emotionQuestions.confused.questions, suggestion: vent.emotionQuestions.confused.suggestion },
    [vent.emotions.lonely]:   { count: 218, questions: vent.emotionQuestions.lonely.questions,   suggestion: vent.emotionQuestions.lonely.suggestion   },
    [vent.emotions.numb]:     { count: 63,  questions: vent.emotionQuestions.numb.questions,     suggestion: vent.emotionQuestions.numb.suggestion     },
    [vent.emotions.tired]:    { count: 187, questions: vent.emotionQuestions.tired.questions,    suggestion: vent.emotionQuestions.tired.suggestion    },
    [vent.emotions.hurt]:     { count: 89,  questions: vent.emotionQuestions.hurt.questions,     suggestion: vent.emotionQuestions.hurt.suggestion     },
  }), [vent]);

  const QUICK_CARDS = useMemo(() => [
    { key: 'relationship', text: vent.quickCards.relationship, emo: vent.emotions.hurt },
    { key: 'work',         text: vent.quickCards.work,         emo: vent.emotions.anxious },
    { key: 'self',         text: vent.quickCards.self,         emo: vent.emotions.numb },
    { key: 'body',         text: vent.quickCards.body,         emo: vent.emotions.tired },
  ], [vent]);

  const LAYER_GROUPS = useMemo(() => [
    {
      id: 'social', label: vent.layers.social.label, sub: vent.layers.social.sub,
      items: [
        { id: 'social_work',     label: vent.layers.social.items.social_work,     sensitive: false },
        { id: 'social_stranger', label: vent.layers.social.items.social_stranger, sensitive: false },
        { id: 'social_sns',      label: vent.layers.social.items.social_sns,      sensitive: false },
        { id: 'social_formal',   label: vent.layers.social.items.social_formal,   sensitive: false },
      ],
    },
    {
      id: 'daily', label: vent.layers.daily.label, sub: vent.layers.daily.sub,
      items: [
        { id: 'daily_family',  label: vent.layers.daily.items.daily_family,  sensitive: false },
        { id: 'daily_friend',  label: vent.layers.daily.items.daily_friend,  sensitive: false },
        { id: 'daily_partner', label: vent.layers.daily.items.daily_partner, sensitive: true  },
        { id: 'daily_alone',   label: vent.layers.daily.items.daily_alone,   sensitive: false },
      ],
    },
    {
      id: 'secret', label: vent.layers.secret.label, sub: vent.layers.secret.sub,
      items: [
        { id: 'secret_emotion',  label: vent.layers.secret.items.secret_emotion,  sensitive: true,  locked: false },
        { id: 'secret_relation', label: vent.layers.secret.items.secret_relation, sensitive: true,  locked: false },
        { id: 'secret_desire',   label: vent.layers.secret.items.secret_desire,   sensitive: true,  locked: true  },
        { id: 'secret_shame',    label: vent.layers.secret.items.secret_shame,    sensitive: true,  locked: true  },
        { id: 'secret_ambition', label: vent.layers.secret.items.secret_ambition, sensitive: false, locked: false },
      ],
    },
  ], [vent]);

  const COMM_GROUPS = useMemo(() => vent.community.groups, [vent]);

  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h >= 5  && h < 9)  return vent.greetings.earlyMorning;
    if (h >= 9  && h < 12) return vent.greetings.morning;
    if (h >= 12 && h < 14) return vent.greetings.lunch;
    if (h >= 14 && h < 18) return vent.greetings.afternoon;
    if (h >= 18 && h < 21) return vent.greetings.evening;
    if (h >= 21 && h < 24) return vent.greetings.night;
    return vent.greetings.lateNight;
  }

  return { EMOTIONS, EMO_DATA, QUICK_CARDS, LAYER_GROUPS, COMM_GROUPS, getTimeGreeting };
}
