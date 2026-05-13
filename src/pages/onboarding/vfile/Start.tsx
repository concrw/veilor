import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/useT';
import { VenetianMask } from 'lucide-react';
import { useLanguageContext } from '@/context/LanguageContext';

const LANG_LABELS: Record<string, string> = { ko: '한국어', en: 'EN', ja: '日本語' };

export default function PriperStart() {
  const navigate = useNavigate();
  const t = useT();
  const s = t.vfileStart;
  const { language, setLanguage } = useLanguageContext();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <div className="flex items-center gap-4 mb-3">
            <img src="/icon-192x192.png" alt="VEILOR" className="w-12 h-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-widest" style={{ color: '#E0B48A', letterSpacing: '0.2em' }}>VEILOR</h1>
          </div>
          <p className="text-base font-light" style={{ color: '#B8B3AF' }}>{s.subtitle}</p>
        </div>
        <div className="space-y-4">
          <p className="text-2xl font-light leading-snug" style={{ color: '#F5F5F4' }}>
            {s.sidebarHeading.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#9C9590' }}>
            {s.sidebarSubtext.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
        </div>
        <p className="text-xs" style={{ color: '#44403C' }}>© 2026 VEILOR</p>
      </div>

      {/* 우측 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        {/* 언어 토글 */}
        <div className="flex justify-end">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #44403C' }}>
            {(['en', 'ko', 'ja'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: language === lang ? '#E0B48A' : 'transparent',
                  color: language === lang ? '#1C1917' : '#B8B3AF',
                }}
              >
                {LANG_LABELS[lang] ?? lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {/* 가면 아이콘 */}
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
          style={{ background: '#E0B48A15', border: '1px solid #E0B48A40' }}
        >
          <VenetianMask size={40} color="#E0B48A" strokeWidth={1.25} />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold" style={{ color: '#F5F5F4' }}>{s.heading}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#B8B3AF' }}>
            {s.subtext}
          </p>
        </div>

        <div
          className="rounded-xl p-5 text-left space-y-3"
          style={{ background: '#292524', border: '1px solid #44403C' }}
        >
          {(['⏱', '💡', '🔒', '↩️'] as const).map((icon, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ color: '#F5F5F4' }}>
              <span>{icon}</span>
              <span>{s.items[i]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/onboarding/vfile/questions', { state: { context: 'social' } })}
          className="w-full h-12 text-base rounded-xl font-medium transition-opacity"
          style={{
            background: '#E0B48A',
            color: '#1C1917',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {s.btnStart}
        </button>

        <p className="text-[10px] leading-relaxed px-2" style={{ color: '#87817C' }}>
          {s.disclaimer.split('\n').map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && ' '}</span>)}
        </p>
      </div>
      </div>
    </div>
  );
}
