import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { useIkigaiAlignment } from '@/hooks/useIkigaiAlignment';
import { useTranslation } from '@/hooks/useTranslation';
import { C } from '@/lib/colors';

interface Props {
  ventCount: number;
  userId: string;
}

const AXIS_KO = ['나', '업무', '관계', '사회'];
const AXIS_EN = ['Self', 'Work', 'Relation', 'Social'];
const AXIS_KEYS = ['self', 'work', 'relation', 'social'] as const;

export default function AlignmentRadar({ ventCount, userId }: Props) {
  const { language } = useTranslation();
  const isKo = language === 'ko';
  const { scores, isLoading, patterns } = useIkigaiAlignment({ userId, ventCount });

  const radarData = AXIS_KEYS.map((k, i) => ({
    axis: isKo ? AXIS_KO[i] : AXIS_EN[i],
    score: scores[k],
  }));

  return (
    <div className="vr-fade-in" style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '15px 17px' }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: C.text, display: 'block', marginBottom: 12 }}>
        {isKo ? '4축 정렬' : 'Axis Alignment'}
      </span>

      {isLoading ? (
        <div style={{ height: 220, background: C.bg, borderRadius: 10 }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="axis" tick={{ fill: C.text3, fontSize: 11 }} />
            <Radar dataKey="score" fill="#2DD4BF" fillOpacity={0.2} stroke="#2DD4BF" strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {patterns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {patterns.map((p) => (
            <div key={p.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{isKo ? p.ko : p.en}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
