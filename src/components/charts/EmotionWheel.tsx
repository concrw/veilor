/**
 * EmotionWheel — D3.js 기반 플루칙 8감정 Wheel
 * 현재 감정 상태를 방사형으로 시각화
 */
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { C } from '@/lib/colors';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    ariaLabel: '감정 휠 — 현재 감정 분포',
    emotions: ['기쁨', '신뢰', '두려움', '놀람', '슬픔', '혐오', '분노', '기대'],
  },
  en: {
    ariaLabel: 'Emotion Wheel — current emotion distribution',
    emotions: ['Joy', 'Trust', 'Fear', 'Surprise', 'Sadness', 'Disgust', 'Anger', 'Anticipation'],
  },
} as const;

// 플루칙 8개 기본 감정 + 색상 (ko 레이블 기준 유지, 렌더링 시 언어 교체)
const PLUTCHIK_EMOTIONS = [
  { label: '기쁨',   en: 'joy',       color: '#f6d860' },
  { label: '신뢰',   en: 'trust',     color: '#8bc34a' },
  { label: '두려움', en: 'fear',      color: '#4caf50' },
  { label: '놀람',   en: 'surprise',  color: '#26c6da' },
  { label: '슬픔',   en: 'sadness',   color: '#5c6bc0' },
  { label: '혐오',   en: 'disgust',   color: '#ab47bc' },
  { label: '분노',   en: 'anger',     color: '#ef5350' },
  { label: '기대',   en: 'anticipation', color: '#ffa726' },
];

export interface EmotionScore {
  emotion: string;   // 한국어 레이블
  score: number;     // 0~1
}

interface EmotionWheelProps {
  scores?: EmotionScore[];
  size?: number;
  showLabels?: boolean;
}

export default function EmotionWheel({
  scores = [],
  size = 260,
  showLabels = true,
}: EmotionWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 20;
    const innerR = outerR * 0.25;
    const n = PLUTCHIK_EMOTIONS.length;
    const angleSlice = (2 * Math.PI) / n;

    const scoreMap = new Map(scores.map(s => [s.emotion, s.score]));

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // 배경 원 (3단계)
    [0.33, 0.66, 1.0].forEach(t => {
      g.append('circle')
        .attr('r', innerR + (outerR - innerR) * t)
        .attr('fill', 'none')
        .attr('stroke', C.border)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.4);
    });

    // 구분선
    PLUTCHIK_EMOTIONS.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', Math.cos(angle) * innerR)
        .attr('y1', Math.sin(angle) * innerR)
        .attr('x2', Math.cos(angle) * outerR)
        .attr('y2', Math.sin(angle) * outerR)
        .attr('stroke', C.border)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.4);
    });

    // 감정 섹터 (점수 반영)
    PLUTCHIK_EMOTIONS.forEach((emo, i) => {
      const startAngle = angleSlice * i - Math.PI / 2 - angleSlice / 2;
      const endAngle   = startAngle + angleSlice;
      const score = scoreMap.get(emo.label) ?? 0;
      const r = innerR + (outerR - innerR) * Math.max(score, 0.08);

      const arc = d3.arc<unknown, unknown>()
        .innerRadius(innerR)
        .outerRadius(r)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.02)
        .cornerRadius(3);

      g.append('path')
        .attr('d', arc as unknown as string)
        .attr('fill', emo.color)
        .attr('opacity', score > 0 ? 0.75 + score * 0.2 : 0.18)
        .attr('stroke', 'none');
    });

    // 레이블
    if (showLabels) {
      PLUTCHIK_EMOTIONS.forEach((emo, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = outerR + 14;
        const x = Math.cos(angle) * labelR;
        const y = Math.sin(angle) * labelR;
        const score = scoreMap.get(emo.label) ?? 0;
        const displayLabel = s.emotions[i] ?? emo.label;

        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', score > 0.3 ? emo.color : C.text4)
          .attr('font-size', 10)
          .attr('font-family', "'DM Sans', sans-serif")
          .attr('font-weight', score > 0.3 ? '500' : '300')
          .text(displayLabel);
      });
    }

    // 중앙 텍스트
    const topEmotion = scores.length > 0
      ? scores.reduce((a, b) => a.score > b.score ? a : b)
      : null;

    if (topEmotion && topEmotion.score > 0.1) {
      const matchedEmo = PLUTCHIK_EMOTIONS.find(e => e.label === topEmotion.emotion);
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', -6)
        .attr('fill', matchedEmo?.color ?? C.amberGold)
        .attr('font-size', 11)
        .attr('font-family', "'Cormorant Garamond', serif")
        .attr('font-weight', '400')
        .text(topEmotion.emotion);
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', 8)
        .attr('fill', C.text4)
        .attr('font-size', 9)
        .attr('font-family', "'DM Sans', sans-serif")
        .text(`${Math.round(topEmotion.score * 100)}%`);
    }

  }, [scores, size, showLabels, s]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      aria-label={s.ariaLabel}
      role="img"
      style={{ overflow: 'visible' }}
    />
  );
}
