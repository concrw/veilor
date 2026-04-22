import { useRef } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';
import { C } from '@/lib/colors';

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onStart?: () => void;
  onStop?: () => void;
}

export default function VoiceRecorder({ onRecordingComplete, onStart, onStop }: VoiceRecorderProps) {
  const recorderControls = useVoiceVisualizer();
  const {
    recordedBlob,
    error,
    audioRef,
    isRecordingInProgress,
    startRecording,
    stopRecording,
    clearCanvas,
  } = recorderControls;

  // 녹음 완료 시 콜백 전달
  const prevBlobRef = useRef<Blob | null>(null);
  if (recordedBlob && recordedBlob !== prevBlobRef.current) {
    prevBlobRef.current = recordedBlob;
    onRecordingComplete?.(recordedBlob);
  }

  const handleToggle = () => {
    if (isRecordingInProgress) {
      stopRecording();
      onStop?.();
    } else {
      clearCanvas();
      startRecording();
      onStart?.();
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* 파형 시각화 */}
      <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: C.bg2, border: `1px solid ${C.border}` }}>
        <VoiceVisualizer
          controls={recorderControls}
          height={64}
          width="100%"
          backgroundColor={C.bg2}
          mainBarColor={C.amberGold}
          secondaryBarColor={`${C.amberGold}55`}
          speed={3}
          barWidth={3}
          gap={1}
          rounded={5}
          isControlPanelShown={false}
          isDefaultUIShown={false}
          ref={audioRef}
        />
      </div>

      {/* 오류 표시 */}
      {error && (
        <p style={{ fontSize: 11, color: '#ef4444' }}>{error.message}</p>
      )}

      {/* 녹음 토글 버튼 */}
      <button
        onClick={handleToggle}
        aria-label={isRecordingInProgress ? '녹음 중지' : '녹음 시작'}
        style={{
          width: 48, height: 48, borderRadius: '50%',
          background: isRecordingInProgress ? '#ef4444' : C.amberGold,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {isRecordingInProgress ? (
          // 중지 아이콘
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="8" height="8" rx="1" fill="white"/>
          </svg>
        ) : (
          // 마이크 아이콘
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="7" y="2" width="6" height="10" rx="3" stroke="white" strokeWidth="1.5"/>
            <path d="M4 10a6 6 0 0 0 12 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 16v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
