import { useState, useEffect } from 'react';
import { C } from '@/lib/colors';
import { useVoiceClone } from '@/hooks/useVoiceClone';
import { useAuth } from '@/context/AuthContext';
import { useVeilorSubscription } from '@/hooks/useVeilorSubscription';
import { veilorDb } from '@/integrations/supabase/client';
import { useT } from '@/i18n/useT';

const MIN_SECONDS = 30;
const MAX_SECONDS = 300;

export default function VoiceCloneSettings() {
  const { user } = useAuth();
  const { isPro } = useVeilorSubscription();
  const t = useT();
  const s = t.voiceCloneSettings;
  const { state, errorMsg, clonedVoiceId, startRecording, stopRecordingAndUpload, cancelRecording, reset } = useVoiceClone();

  if (!isPro) {
    return (
      <div style={{
        padding: '24px 20px', borderRadius: 14,
        background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 22, marginBottom: 12 }}>🔒</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 8 }}>{s.proOnly}</p>
        <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.7, marginBottom: 20 }}>
          {s.proDesc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>
        <p style={{ fontSize: 12, color: C.text3 }}>{s.proCta}</p>
      </div>
    );
  }

  const [seconds,      setSeconds]      = useState(0);
  const [savedVoiceId, setSavedVoiceId] = useState<string | null>(null);
  const [voiceName,    setVoiceName]    = useState(s.defaultVoiceName);

  useEffect(() => {
    if (!user?.id) return;
    veilorDb.from('user_profiles')
      .select('elevenlabs_voice_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data && (data as { elevenlabs_voice_id?: string }).elevenlabs_voice_id) {
          setSavedVoiceId((data as { elevenlabs_voice_id?: string }).elevenlabs_voice_id ?? null);
        }
      });
  }, [user?.id, clonedVoiceId]);

  useEffect(() => {
    if (state !== 'recording') { setSeconds(0); return; }
    const id = setInterval(() => setSeconds(sec => {
      if (sec + 1 >= MAX_SECONDS) { stopRecordingAndUpload(voiceName); return sec; }
      return sec + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [state, stopRecordingAndUpload, voiceName]);

  const canStop = state === 'recording' && seconds >= MIN_SECONDS;
  const progress = Math.min(seconds / MIN_SECONDS, 1);

  return (
    <div style={{ padding: '20px 0' }}>
      <p style={{ fontSize: 13, color: C.text3, marginBottom: 20, lineHeight: 1.7 }}>
        {s.intro(MIN_SECONDS).split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
      </p>

      {(savedVoiceId || clonedVoiceId) && state !== 'recording' && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: `${C.amberGold}11`, border: `1px solid ${C.amberGold}33`,
          marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 12, color: C.amberGold, marginBottom: 2 }}>{s.voiceRegistered}</p>
            <p style={{ fontSize: 10, color: C.text4 }}>{s.voiceAmberUsing}</p>
          </div>
          <button onClick={reset}
            style={{ fontSize: 11, color: C.text4, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            {s.reRegister}
          </button>
        </div>
      )}

      {state === 'idle' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 6 }}>
            {s.voiceNameLabel}
          </label>
          <input
            value={voiceName}
            onChange={e => setVoiceName(e.target.value)}
            placeholder={s.voiceNamePlaceholder}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: C.bg2, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {state === 'recording' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: C.text3 }}>
              {canStop ? s.canStop : s.needMore(MIN_SECONDS - seconds)}
            </p>
            <p style={{ fontSize: 12, color: C.text4 }}>{seconds}s</p>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, background: C.amberGold,
              width: `${progress * 100}%`, transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}

      {errorMsg && (
        <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{errorMsg}</p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {state === 'idle' && (
          <button onClick={startRecording}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: C.amberGold, border: 'none', cursor: 'pointer', color: C.bg, fontSize: 13, fontWeight: 500 }}>
            {s.startRecording}
          </button>
        )}

        {state === 'recording' && (
          <>
            <button onClick={() => stopRecordingAndUpload(voiceName)} disabled={!canStop}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                background: canStop ? C.amberGold : C.border,
                color: canStop ? C.bg : C.text4,
                cursor: canStop ? 'pointer' : 'default', fontSize: 13, fontWeight: 500,
              }}>
              {canStop ? s.stopAndRegister : s.waitFmt(MIN_SECONDS - seconds)}
            </button>
            <button onClick={cancelRecording}
              style={{ padding: '12px 16px', borderRadius: 10, background: C.bg2, border: `1px solid ${C.border}`, color: C.text4, cursor: 'pointer', fontSize: 13 }}>
              {s.cancel}
            </button>
          </>
        )}

        {state === 'uploading' && (
          <div style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: C.bg2, border: `1px solid ${C.border}`, textAlign: 'center', fontSize: 13, color: C.text3 }}>
            {s.uploading}
          </div>
        )}

        {state === 'done' && (
          <button onClick={reset}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: C.bg2, border: `1px solid ${C.amberGold}44`, color: C.amberGold, cursor: 'pointer', fontSize: 13 }}>
            {s.reRecord}
          </button>
        )}

        {state === 'error' && (
          <button onClick={reset}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: C.bg2, border: `1px solid ${C.border}`, color: C.text3, cursor: 'pointer', fontSize: 13 }}>
            {s.retry}
          </button>
        )}
      </div>
    </div>
  );
}
