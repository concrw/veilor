// 위기 감지 시 표시되는 긴급 안전 배너
// 자살예방상담전화 1393, 정신건강위기상담전화 1577-0199
import { useState, memo } from 'react';
import { C, alpha } from '@/lib/colors';

interface CrisisBannerProps {
  severity: 'high' | 'critical';
  onDismiss?: () => void;
}

export const CrisisBanner = memo(function CrisisBanner({ severity, onDismiss }: CrisisBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const isCritical = severity === 'critical';

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: 80,
        left: 12,
        right: 12,
        zIndex: 9999,
        background: isCritical ? '#DC2626' : '#D97706',
        borderRadius: 16,
        padding: '14px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
          {isCritical ? '🆘' : '⚠️'}
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
            {isCritical
              ? '지금 많이 힘드시군요. 혼자 감당하지 않아도 돼요.'
              : '힘든 감정이 느껴지시나요? 도움을 요청할 수 있어요.'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 1.5 }}>
            이 앱은 전문 상담을 대체하지 않습니다.
            {isCritical && ' 지금 바로 전문가와 이야기해 주세요.'}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="배너 닫기"
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
              fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 전화 연결 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <a
          href="tel:1393"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 0',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          📞 자살예방상담 1393
        </a>
        <a
          href="tel:1577-0199"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 0',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          📞 정신건강위기 1577-0199
        </a>
      </div>

      {/* 더 보기 */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            display: 'block', width: '100%', marginTop: 8,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            fontSize: 11, cursor: 'pointer', textAlign: 'center',
          }}
        >
          더 많은 도움 →
        </button>
      )}

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
            • 자살예방상담전화 <strong>1393</strong> (24시간)<br />
            • 정신건강위기상담전화 <strong>1577-0199</strong> (24시간)<br />
            • 생명의전화 <strong>1588-9191</strong> (24시간)<br />
            • 청소년 전화 <strong>1388</strong> (24시간)<br />
            • 경찰 <strong>112</strong> / 응급 <strong>119</strong>
          </p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            VEILRUM은 자기탐색 도구이며, 전문 심리상담 또는 치료를 대체하지 않습니다.
            위급한 상황에서는 반드시 전문가에게 연락해 주세요.
          </p>
        </div>
      )}
    </div>
  );
});
