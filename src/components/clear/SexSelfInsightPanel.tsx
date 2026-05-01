import { useTranslation } from '@/hooks/useTranslation';
import { SEXSELF_PROFILE_COLORS } from './clearHomeTypes';

function SexAxisBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(((value + 1) / 2) * 100);
  const color = value >= 0 ? '#f59e0b' : '#3b82f6';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 text-right shrink-0" style={{ color: '#64748b' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1e2a38' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] w-7 text-right" style={{ color }}>
        {value >= 0 ? '+' : ''}{value}
      </span>
    </div>
  );
}

interface SexSelfInsightPanelProps {
  data: Record<string, string> | null | undefined;
  onNavigate: (path: string) => void;
}

export function SexSelfInsightPanel({ data, onNavigate }: SexSelfInsightPanelProps) {
  const { translations: tr } = useTranslation();
  const c = tr.clear;

  const profileLabels: Record<string, string> = c.sexSelfProfiles;

  if (!data || !data.sexself_profile) {
    return (
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: '#111318', borderColor: '#ec489922' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
              {c.sexSelfTitle}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
              {c.sexSelfPanelDesc}
            </p>
            <p className="text-[10px]" style={{ color: '#ec489966' }}>
              {c.sexSelfOnlyMe}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/home/sexself/questions')}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: '#ec489922', color: '#ec4899' }}
          >
            {c.sexSelfStart}
          </button>
        </div>
      </div>
    );
  }

  const profile = data.sexself_profile;
  const profileColor = SEXSELF_PROFILE_COLORS[profile] ?? '#64748b';
  const profileLabel = profileLabels[profile] ?? profile;

  if (profile === 'ANXIETY_FROZEN') {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ background: '#111318', borderColor: '#6366f122' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#6366f122', color: '#6366f1' }}
          >
            {c.sexSelfLabel}
          </span>
          <span className="text-xs font-medium" style={{ color: '#6366f1' }}>{profileLabel}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
          {c.sexSelfSafeMsg}
        </p>
      </div>
    );
  }

  const leading = parseFloat(data.sexself_sex_leading ?? '0');
  const expressiveness = parseFloat(data.sexself_sex_expressiveness ?? '0');
  const intensity = parseFloat(data.sexself_sex_intensity ?? '0');
  const roleLabel = data.sexself_kink_role ?? '';
  const intensityLabel = data.sexself_kink_intensity ?? '';

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: '#111318', borderColor: `${profileColor}22` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${profileColor}22`, color: profileColor }}
          >
            {c.sexSelfLabel}
          </span>
          <span className="text-xs font-medium" style={{ color: profileColor }}>
            {profileLabel}
          </span>
        </div>
        <button
          onClick={() => onNavigate('/home/sexself/questions')}
          className="text-[10px]"
          style={{ color: '#64748b' }}
        >
          {c.sexSelfDetail}
        </button>
      </div>

      <div className="space-y-1.5">
        <SexAxisBar label={c.sexAxisLeading} value={Math.round(leading * 100) / 100} />
        <SexAxisBar label={c.sexAxisExpressiveness} value={Math.round(expressiveness * 100) / 100} />
        <SexAxisBar label={c.sexAxisIntensity} value={Math.round(intensity * 100) / 100} />
      </div>

      {(roleLabel || intensityLabel) && (
        <div className="flex gap-2">
          {roleLabel && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{ color: '#94a3b8', borderColor: '#1e2a38' }}
            >
              {roleLabel}
            </span>
          )}
          {intensityLabel && (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full border"
              style={{ color: '#94a3b8', borderColor: '#1e2a38' }}
            >
              {intensityLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
