import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL as string;
const CLONE_ENDPOINT   = `${SUPABASE_URL}/functions/v1/elevenlabs-voice-clone`;

const MIN_SECONDS = 30;
const MAX_SECONDS = 300;

export type CloneState = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

export function useVoiceClone() {
  const [state,         setState]         = useState<CloneState>('idle');
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');
    } catch {
      setErrorMsg('마이크 접근이 거부되었어요.');
      setState('error');
    }
  }, []);

  const stopRecordingAndUpload = useCallback(async (voiceName?: string) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    setState('uploading');

    await new Promise<void>(resolve => {
      recorder.onstop = () => resolve();
      recorder.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('로그인이 필요합니다.');

      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const form = new FormData();
      if (voiceName) form.append('name', voiceName);
      form.append('files', audioBlob, 'recording.webm');

      const res = await fetch(CLONE_ENDPOINT, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Voice Clone 오류 (${res.status})`);
      }

      const data = await res.json() as { voice_id: string };
      setClonedVoiceId(data.voice_id);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '업로드 중 오류가 발생했어요.');
      setState('error');
    }
  }, []);

  const cancelRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    chunksRef.current = [];
    setState('idle');
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setErrorMsg(null);
    setClonedVoiceId(null);
  }, []);

  return {
    state,
    errorMsg,
    clonedVoiceId,
    minSeconds: MIN_SECONDS,
    maxSeconds: MAX_SECONDS,
    startRecording,
    stopRecordingAndUpload,
    cancelRecording,
    reset,
  };
}
