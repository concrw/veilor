import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguageContext } from '@/context/LanguageContext';
import { useT } from '@/i18n/useT';
import { veilorDb } from '@/integrations/supabase/client';
import type { Domain } from '@/context/DomainContext';

const DOMAIN_COLOR: Record<Domain, string> = {
  self: '#E0B48A', work: '#38BDF8', relation: '#FB7185', social: '#7FB89A',
};

const TOTAL = 10;

interface MantraCornerProps {
  domain: Domain;
}

export default function MantraCorner({ domain }: MantraCornerProps) {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const t = useT();
  const s = t.set.mantraCorner;

  const mantras = s.mantras[domain] ?? [];
  const color = DOMAIN_COLOR[domain];
  const domainName = s.domainNames[domain] ?? domain;

  const [mantraIdx, setMantraIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCount, setModalCount] = useState(0);
  const [modalCompleted, setModalCompleted] = useState(false);

  // 도메인 변경 시 리셋
  useEffect(() => {
    setMantraIdx(0);
    setCount(0);
    setCompleted(false);
    setSaved(false);
  }, [domain]);

  const mantraText = mantras[mantraIdx];

  const handleSpeak = () => {
    if (completed) return;
    const next = count + 1;
    setCount(next);
    if (next >= TOTAL) {
      setCompleted(true);
    }
  };

  // 완료 시 DB 저장 (1회)
  useEffect(() => {
    if (!completed || saved || !user) return;
    setSaved(true);
    veilorDb.from('tab_conversations').insert({
      user_id: user.id,
      tab: 'set',
      stage: 'mantra_done',
      role: 'user',
      content: mantraText,
      lang: language,
    }).then(() => {});
  }, [completed, saved, user, mantraText, language]);

  const selectMantra = (idx: number) => {
    if (idx === mantraIdx) return;
    setMantraIdx(idx);
    setCount(0);
    setCompleted(false);
    setSaved(false);
  };

  const goNextMantra = () => {
    const next = (mantraIdx + 1) % mantras.length;
    setMantraIdx(next);
    setCount(0);
    setCompleted(false);
    setSaved(false);
  };

  const openModal = () => {
    setModalCount(0);
    setModalCompleted(false);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalSpeak = () => {
    if (modalCompleted) return;
    const next = modalCount + 1;
    setModalCount(next);
    if (next >= TOTAL) {
      setModalCompleted(true);
      // 카드 상태도 완료로 동기화
      setCount(TOTAL);
      setCompleted(true);
      setTimeout(() => {
        setModalOpen(false);
      }, 3000);
    }
  };

  // 완료 시 DB 저장 (모달 경로)
  useEffect(() => {
    if (!modalCompleted || saved || !user) return;
    setSaved(true);
    veilorDb.from('tab_conversations').insert({
      user_id: user.id,
      tab: 'set',
      stage: 'mantra_done',
      role: 'user',
      content: mantraText,
      lang: language,
    }).then(() => {});
  }, [modalCompleted, saved, user, mantraText, language]);

  const modal = modalOpen ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(60% 50% at 50% 30%, color-mix(in oklch, ${color} 6%, transparent), transparent 70%), var(--background)`,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color,
          }}
        >
          {s.header}{domainName}
        </span>
        <button
          onClick={closeModal}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            fontSize: '20px',
            lineHeight: 1,
            padding: '4px',
          }}
          aria-label={t.common.close}
        >
          ✕
        </button>
      </div>

      {/* 중앙 콘텐츠 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          gap: '20px',
          textAlign: 'center',
        }}
      >
        {modalCompleted ? (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '15px',
              letterSpacing: '0.12em',
              color,
            }}
          >
            {s.trainingComplete}
          </p>
        ) : (
          <>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted-foreground)',
              }}
            >
              {modalCount}{s.countOf}
            </span>
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '36px',
                lineHeight: 1.18,
                color: 'var(--foreground)',
              }}
            >
              "{mantraText}"
            </p>
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '12px',
                color: 'var(--muted-foreground)',
              }}
            >
              {s.sayAloud}
            </p>
          </>
        )}
      </div>

      {/* 하단 버튼 + 프로그레스 */}
      {!modalCompleted && (
        <div style={{ padding: '0 0 env(safe-area-inset-bottom, 0)' }}>
          <button
            onClick={handleModalSpeak}
            style={{
              width: '100%',
              padding: '20px',
              background: color,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {s.saidIt}
          </button>
          <div style={{ display: 'flex', height: '3px' }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: i < modalCount ? color : 'var(--border)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <div className="bg-card border rounded-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${color}22` }}>
          <span className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color }}>
            {s.header}{domainName}
          </span>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* 만트라 텍스트 */}
          <div className="min-h-[80px] flex items-center justify-center text-center">
            <p
              className="text-[28px] leading-tight font-serif italic"
              style={{ color }}
            >
              "{mantraText}"
            </p>
          </div>

          {/* 진행 표시 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {completed ? s.complete : `${count} / ${TOTAL}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {s.repeatTimes}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: i < count ? color : `${color}30`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          {!completed ? (
            <div className="space-y-2">
              <button
                onClick={openModal}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: color,
                  color: '#fff',
                  border: 'none',
                }}
              >
                {s.startTraining}
              </button>
              <button
                onClick={handleSpeak}
                className="w-full py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{
                  background: `${color}18`,
                  color,
                  border: `1.5px solid ${color}40`,
                }}
              >
                {s.saidIt}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                style={{ background: `${color}18`, color }}
              >
                🎉 {s.trainingComplete}
              </div>
              <button
                onClick={goNextMantra}
                className="w-full py-2.5 rounded-xl text-xs font-medium transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {s.nextMantra}
              </button>
            </div>
          )}

          {/* 만트라 선택 칩 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {mantras.map((m, i) => (
              <button
                key={i}
                onClick={() => selectMantra(i)}
                className="px-2.5 py-1 rounded-full text-[11px] transition-all"
                style={{
                  background: mantraIdx === i ? `${color}20` : 'transparent',
                  color: mantraIdx === i ? color : 'var(--muted-foreground)',
                  border: `1px solid ${mantraIdx === i ? color + '60' : 'var(--border)'}`,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal && createPortal(modal, document.body)}
    </>
  );
}
