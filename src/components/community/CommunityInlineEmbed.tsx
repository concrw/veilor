import { C, alpha } from '@/lib/colors';
import { useT } from '@/i18n/useT';

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

function useMock(): CommunityInlineEmbedData {
  const m = useT().community.inlineEmbed.mock;
  return {
    vent: { emotionLabel: m.ventEmotionLabel, count: 214, lines: m.ventLines },
    dig:  { patternLabel: m.digPatternLabel, maskCode: 'AX-07', cards: m.digCards },
    get:  { maskLabel: m.getMaskLabel, count: 89, topMentioned: m.getTopMentioned, growthExperiences: m.getGrowthExperiences },
    set:  { keyword: m.setKeyword, count: 63, maskCode: 'AX-03', feed: m.setFeed },
    me:   { count: 41, grwRec: 78, conInt: 62, safPrd: 55 },
  };
}

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
  const ie = useT().community.inlineEmbed;
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>
        {ie.ventCount(d.emotionLabel, d.count.toLocaleString())}
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
      <p style={monoNote}>↳ {ie.anonymousNote}</p>
    </div>
  );
}

function DigEmbed({ accent, data }: { accent: string; data: CommunityInlineEmbedData['dig'] }) {
  const ie = useT().community.inlineEmbed;
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: accent, background: alpha(accent, 0.12), padding: '2px 7px', borderRadius: 4 }}>
          {d.maskCode}
        </span>
        <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>
          {ie.digCount(d.patternLabel)}
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
  const ie = useT().community.inlineEmbed;
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>
        {ie.getCount(d.maskLabel, d.count.toLocaleString())}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: C.bg3, borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>
            {ie.mostMentioned}
          </p>
          {d.topMentioned.map((item, i) => (
            <p key={i} style={{ fontSize: 11, color: C.text2, margin: '2px 0', lineHeight: 1.5 }}>· {item}</p>
          ))}
        </div>
        <div style={{ background: C.bg3, borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, color: C.text4, marginBottom: 6 }}>
            {ie.sharedGrowth}
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
  const ie = useT().community.inlineEmbed;
  const d = data!;

  return (
    <div style={cardStyle(accent)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: accent, background: alpha(accent, 0.12), padding: '2px 7px', borderRadius: 4 }}>
          {d.maskCode}
        </span>
        <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>
          {ie.setCount(d.keyword, d.count.toLocaleString())}
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
  const ie = useT().community.inlineEmbed;
  const d = data!;

  const axes = [
    { label: 'GRW-REC', pct: d.grwRec },
    { label: 'CON-INT', pct: d.conInt },
    { label: 'SAF-PRD', pct: d.safPrd },
  ];

  return (
    <div style={cardStyle(accent)}>
      <p style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>
        {ie.meCount(d.count.toLocaleString())}
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
        {ie.overlapNote}
      </p>
    </div>
  );
}

export default function CommunityInlineEmbed({ tab, accent, data }: Props) {
  const mock = useMock();
  const merged: CommunityInlineEmbedData = {
    vent:  { ...mock.vent!,  ...(data?.vent  ?? {}) },
    dig:   { ...mock.dig!,   ...(data?.dig   ?? {}) },
    get:   { ...mock.get!,   ...(data?.get   ?? {}) },
    set:   { ...mock.set!,   ...(data?.set   ?? {}) },
    me:    { ...mock.me!,    ...(data?.me    ?? {}) },
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
