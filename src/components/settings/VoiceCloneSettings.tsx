import { useState, useEffect } from 'react';
import { C } from '@/lib/colors';
import { useVoiceClone } from '@/hooks/useVoiceClone';
import { useAuth } from '@/context/AuthContext';
import { useVeilorSubscription } from '@/hooks/useVeilorSubscription';
import { veilorDb } from '@/integrations/supabase/client';

const MIN_SECONDS = 30;
const MAX_SECONDS = 300;

export default function VoiceCloneSettings() {
  const { user } = useAuth();
  const { isPro } = useVeilorSubscription();
  const { state, errorMsg, clonedVoiceId, startRecording, stopRecordingAndUpload, cancelRecording, reset } = useVoiceClone();

  // Pro 아닌 경우 업그레이드 안내
  if (!isPro) {
    return (
      <div style={{
        padding: '24px 20px', borderRadius: 14,
        background: `${C.amberGold}08`, border: `1px solid ${C.amberGold}22`,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 22, marginBottom: 12 }}>🔒</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 8 }}>
          Pro 전용 기능
        </p>
        <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.7, marginBottom: 20 }}>
          내 목소리로 엠버와 대화하고 싶다면<br />
          Pro 플랜으로 업그레이드하세요.
        </p>
        <button
          onClick={() => window.location.href = '/settings/subscription'}
          style={{
            padding: '10px 24px', borderRadius: 10,
            background: C.amberGold, border: 'none', cursor: 'pointer',
            color: C.bg, fontSize: 13, fontWeight: 500,
          }}
        >
          Pro 플랜 보기
        </button>
      </div>
    );
  }
  const [seconds,       setSeconds]       = useState(0);
  const [savedVoiceId,  setSavedVoiceId]  = useState<string | null>(null);
  const [voiceName,     setVoiceName]     = useState('내 목소리');

  // 저장된 voice_id 로드
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

  // 녹음 타이머
  useEffect(() => {
    if (state !== 'recording') { setSeconds(0); return; }
    const id = setInterval(() => setSeconds(s => {
      if (s + 1 >= MAX_SECONDS) { stopRecordingAndUpload(voiceName); return s; }
      return s + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [state, stopRecordingAndUpload, voiceName]);

  const canStop = state === 'recording' && seconds >= MIN_SECONDS;
  const progress = Math.min(seconds / MIN_SECONDS, 1);

  return (
    <div style={{ padding: '20px 0' }}>
      <p style={{ fontSize: 13, color: C.text3, marginBottom: 20, lineHeight: 1.7 }}>
        자신의 목소리로 녹음하면 엠버가 그 목소리로 대화합니다.<br />
        최소 {MIN_SECONDS}초 이상 자연스럽게 말해주세요.
      </p>

      {/* 저장된 목소리 상태 */}
      {(savedVoiceId || clonedVoiceId) && state !== 'recording' && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: `${C.amberGold}11`, border: `1px solid ${C.amberGold}33`,
          marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 12, color: C.amberGold, marginBottom: 2 }}>내 목소리 등록됨</p>
            <p style={{ fontSize: 10, color: C.text4 }}>엠버가 이 목소리로 대화합니다</p>
          </div>
          <button
            onClick={reset}
            style={{
              fontSize: 11, color: C.text4, background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            다시 등록
          </button>
        </div>
      )}

      {/* 목소리 이름 입력 */}
      {state === 'idle' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: C.text4, display: 'block', marginBottom: 6 }}>
            목소리 이름 (선택)
          </label>
          <input
            value={voiceName}
            onChange={e => setVoiceName(e.target.value)}
            placeholder="내 목소리"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: C.bg2, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* 녹음 진행 바 */}
      {state === 'recording' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: C.text3 }}>
              {seconds < MIN_SECONDS
                ? `${MIN_SECONDS - seconds}초 더 말해주세요`
                : '충분해요! 중지해도 됩니다'}
            </p>
            <p style={{ fontSize: 12, color: C.text4 }}>{seconds}초</p>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: C.amberGold,
              width: `${progress * 100}%`,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}

      {/* 오류 */}
      {errorMsg && (
        <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{errorMsg}</p>
      )}

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 10 }}>
        {state === 'idle' && (
          <button
            onClick={startRecording}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              background: C.amberGold, border: 'none', cursor: 'pointer',
              color: C.bg, fontSize: 13, fontWeight: 500,
            }}
          >
            녹음 시작
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={() => stopRecordingAndUpload(voiceName)}
              disabled={!canStop}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                background: canStop ? C.amberGold : C.border,
                color: canStop ? C.bg : C.text4,
                cursor: canStop ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 500,
              }}
            >
              {canStop ? '녹음 중지 및 등록' : `${MIN_SECONDS - seconds}초 대기 중...`}
            </button>
            <button
              onClick={cancelRecording}
              style={{
                padding: '12px 16px', borderRadius: 10,
                background: C.bg2, border: `1px solid ${C.border}`,
                color: C.text4, cursor: 'pointer', fontSize: 13,
              }}
            >
              취소
            </button>
          </>
        )}

        {state === 'uploading' && (
          <div style={{
            flex: 1, padding: '12px 0', borderRadius: 10,
            background: C.bg2, border: `1px solid ${C.border}`,
            textAlign: 'center', fontSize: 13, color: C.text3,
          }}>
            목소리 등록 중...
          </div>
        )}

        {state === 'done' && (
          <button
            onClick={reset}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              background: C.bg2, border: `1px solid ${C.amberGold}44`,
              color: C.amberGold, cursor: 'pointer', fontSize: 13,
            }}
          >
            다시 녹음하기
          </button>
        )}

        {state === 'error' && (
          <button
            onClick={reset}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              background: C.bg2, border: `1px solid ${C.border}`,
              color: C.text3, cursor: 'pointer', fontSize: 13,
            }}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
