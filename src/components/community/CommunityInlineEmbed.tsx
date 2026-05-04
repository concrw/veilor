import { C, alpha } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

export interface CommunityInlineEmbedData {
  vent?: {
    emotionLabel: string;
    count: number;
    lines: string[];
  };
  dig?: {
    patternLabel: string;
    maskCode: string;
    cards: string[];
  };
  get?: {
    maskLabel: string;
    count: number;
    topMentioned: string[];
    growthExperiences: string[];
  };
  set?: {
    keyword: string;
    count: number;
    maskCode: string;
    feed: string[];
  };
  me?: {
    count: number;
    grwRec: number;
    conInt: number;
    safPrd: number;
  };
}

interface Props {
  tab: 'vent' | 'dig' | 'get' | 'set' | 'me';
  accent: string;
  data?: CommunityInlineEmbedData;
}

const MOCK: CommunityInlineEmbedData = {
  vent: {
    emotionLabel: '불안',
    count: 214,
    lines: [
      '오늘 또 이유 없이 심장이 빨라졌어요',
      '연락이 늦어질 때마다 최악을 상상해요',
      '혼자 있으면 괜찮은데 사람들 사이에서 더 외로워요',
    ],
  },
  dig: {
    patternLabel: '회피-집착',
    maskCode: 'AX-07',
    cards: [
      '가까워질수록 본능적으로 멀어지려는 나를 발견했어요',
      '상대가 먼저 연락하면 오히려 불안해지는 패턴이 있었어요',
    ],
  },
  get: {
    maskLabel: '거울형',
    count: 89,
    topMentioned: ['공감 과부하', '경계 부재', '자기 지움'],
    growthExperiences: ['타인 기대에서 분리 연습', '자기 감정 먼저 명명하기'],
  },
  set: {
    keyword: '거리두기',
    count: 63,
    maskCode: 'AX-03',
    feed: [
      '오늘 한 가지 거절을 연습했어요',
      '연락 답장을 30분 늦추는 것만으로 달랐어요',
      '스스로 선택한 침묵을 지켰어요',
    ],
  },
  me: {
    count: 41,
    grwRec: 78,
    conInt: 62,
    safPrd: 55,
  },
};

const cardStyle = (accent: string): React.CSSProperties => ({
  borderTop: `2px solid ${accent}`,
  background: C.bg2,
  borderRadius: 12,
  padding: '14px 16px',
  marginTop: 0,
});

const monoNote: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  color: C.text4,
  marginTop: 10,
  letterSpacing: '.02em',
};

function VentEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['vent'] }) {
  const { language } = useLanguageContext();
  const isKo = language !== 'en';
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>
        {isKo
          ? `지금 ${d.emotionLabel}한 사람이 ${d.count.toLocaleString()}명`
          : `${d.count.toLocaleString()} people feel ${d.emotionLabel} right now`}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {d.lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 12,
              color: C.text2,
              lineHeight: 1.6,
              paddingLeft: 10,
              borderLeft: `1px solid ${accent}`,
              margin: 0,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <p style={monoNote}>↳ {isKo ? '익명 한 줄. 댓글·반응 불가.' : 'Anonymous. No comments or reactions.'}</p>
    </div>
  );
}

function DigEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['dig'] }) {
  const { language } = useLanguageContext();
  const isKo = language !== 'en';
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: accent, background: alpha(accent, 0.12), padding: '2px 7px', borderRadius: 4 }}>
          {d.maskCode}
        </span>
        <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>
          {isKo
            ? `${d.patternLabel} 패턴을 가진 사람들이 발견한 것`
            : `What people with ${d.patternLabel} pattern discovered`}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {d.cards.map((text, i) => (
          <div key={i} style={{ background: C.bg3, borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GetEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['get'] }) {
  const { language } = useLanguageContext();
  const isKo = language !== 'en';
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>
        {isKo
          ? `같은 ${d.maskLabel} 유형 ${d.count.toLocaleString()}명`
          : `${d.count.toLocaleString()} people share the ${d.maskLabel} type`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: C.bg3, borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>
            {isKo ? '가장 자주 언급' : 'Most mentioned'}
          </p>
          {d.topMentioned.map((item, i) => (
            <p key={i} style={{ fontSize: 11, color: C.text2, margin: '2px 0', lineHeight: 1.5 }}>· {item}</p>
          ))}
        </div>
        <div style={{ background: C.bg3, borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>
            {isKo ? '공통 성장 경험' : 'Shared growth'}
          </p>
          {d.growthExperiences.map((item, i) => (
            <p key={i} style={{ fontSize: 11, color: C.text2, margin: '2px 0', lineHeight: 1.5 }}>· {item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['set'] }) {
  const { language } = useLanguageContext();
  const isKo = language !== 'en';
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: accent, background: alpha(accent, 0.12), padding: '2px 7px', borderRadius: 4 }}>
          {d.maskCode}
        </span>
        <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>
          {isKo
            ? `"${d.keyword}" 키워드로 실천하는 사람 ${d.count.toLocaleString()}명`
            : `${d.count.toLocaleString()} people practicing "${d.keyword}"`}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {d.feed.map((line, i) => (
          <p
            key={i}
            style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, paddingLeft: 10, borderLeft: `1px solid ${alpha(accent, 0.4)}`, margin: 0 }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function MeEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['me'] }) {
  const { language } = useLanguageContext();
  const isKo = language !== 'en';
  const d = data!;

  const axes = [
    { label: 'GRW-REC', pct: d.grwRec },
    { label: 'CON-INT', pct: d.conInt },
    { label: 'SAF-PRD', pct: d.safPrd },
  ];

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>
        {isKo
          ? `비슷한 V-Axis 프로필 ${d.count.toLocaleString()}명`
          : `${d.count.toLocaleString()} people with similar V-Axis profile`}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {axes.map(({ label, pct }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: C.text3 }}>{label}</span>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: accent }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 2, transition: 'width .6s ease' }} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ ...monoNote, marginTop: 12 }}>
        {isKo ? '↳ 겹침 % — 프로필 유사도 기준' : '↳ overlap % based on profile similarity'}
      </p>
    </div>
  );
}

export default function CommunityInlineEmbed({ tab, accent, data }: Props) {
  const merged: CommunityInlineEmbedData = {
    vent:  { ...MOCK.vent!,  ...(data?.vent  ?? {}) },
    dig:   { ...MOCK.dig!,   ...(data?.dig   ?? {}) },
    get:   { ...MOCK.get!,   ...(data?.get   ?? {}) },
    set:   { ...MOCK.set!,   ...(data?.set   ?? {}) },
    me:    { ...MOCK.me!,    ...(data?.me    ?? {}) },
  };

  return (
    <div style={{ margin: '12px 0' }}>
      {tab === 'vent' && <VentEmbed  accent={accent} data={merged.vent} />}
      {tab === 'dig'  && <DigEmbed   accent={accent} data={merged.dig}  />}
      {tab === 'get'  && <GetEmbed   accent={accent} data={merged.get}  />}
      {tab === 'set'  && <SetEmbed   accent={accent} data={merged.set}  />}
      {tab === 'me'   && <MeEmbed    accent={accent} data={merged.me}   />}
    </div>
  );
}
