import { useState } from 'react';
import { useCreateInvite, useInviteCodeInput } from '@/hooks/usePartner';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    inviteTitle: '파트너 초대하기',
    inviteDesc: '초대코드를 파트너에게 보내세요. 파트너가 코드를 입력하면 두 사람의 V-프로필이 연결됩니다.',
    copied: '복사됨',
    copy: '복사',
    expiry: '7일 후 만료 · 1회 사용 가능',
    issuing: '발급 중...',
    issueCode: '초대코드 발급',
    enterCodeTitle: '초대코드 입력하기',
    enterCodeDesc: '파트너에게 받은 코드를 입력하세요',
    connectSuccess: '연결 완료! 파트너 분석을 확인해보세요.',
    connecting: '연결 중...',
    connect: '연결하기',
  },
  en: {
    inviteTitle: 'Invite Partner',
    inviteDesc: 'Send the invite code to your partner. Once they enter it, your V-Profiles will be linked.',
    copied: 'Copied',
    copy: 'Copy',
    expiry: 'Expires in 7 days · One-time use',
    issuing: 'Generating...',
    issueCode: 'Generate Invite Code',
    enterCodeTitle: 'Enter Invite Code',
    enterCodeDesc: 'Enter the code you received from your partner',
    connectSuccess: 'Connected! Check your partner analysis.',
    connecting: 'Connecting...',
    connect: 'Connect',
  },
};

export default function InviteSection() {
  const createInvite = useCreateInvite();
  const [copied, setCopied] = useState(false);
  const inviteInput = useInviteCodeInput();
  const [showInput, setShowInput] = useState(false);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-sm font-medium">{s.inviteTitle}</p>
        <p className="text-xs text-muted-foreground">
          {s.inviteDesc}
        </p>
        {createInvite.data ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-3">
              <span className="flex-1 text-lg font-mono font-bold tracking-widest text-center">
                {createInvite.data.inviteCode}
              </span>
              <button
                onClick={() => handleCopy(createInvite.data!.inviteCode)}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
              >
                {copied ? s.copied : s.copy}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {s.expiry}
            </p>
          </div>
        ) : (
          <button
            onClick={() => createInvite.mutate()}
            disabled={createInvite.isPending}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {createInvite.isPending ? s.issuing : s.issueCode}
          </button>
        )}
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <button onClick={() => setShowInput(v => !v)} className="w-full text-left">
          <p className="text-sm font-medium">{s.enterCodeTitle}</p>
          <p className="text-xs text-muted-foreground">{s.enterCodeDesc}</p>
        </button>
        {showInput && (
          <div className="space-y-2">
            <input
              value={inviteInput.code}
              onChange={e => inviteInput.setCode(e.target.value)}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full text-center text-lg font-mono tracking-widest bg-muted/40 rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary"
            />
            {inviteInput.error && (
              <p className="text-[11px] text-destructive text-center">{inviteInput.error}</p>
            )}
            {inviteInput.isSuccess && (
              <p className="text-[11px] text-emerald-600 text-center">{s.connectSuccess}</p>
            )}
            <button
              onClick={inviteInput.handleSubmit}
              disabled={inviteInput.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {inviteInput.isPending ? s.connecting : s.connect}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
