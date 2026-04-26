import { useState } from 'react';
import { useCreateInvite, useInviteCodeInput } from '@/hooks/usePartner';

export default function InviteSection() {
  const createInvite = useCreateInvite();
  const [copied, setCopied] = useState(false);
  const inviteInput = useInviteCodeInput();
  const [showInput, setShowInput] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <p className="text-sm font-medium">파트너 초대하기</p>
        <p className="text-xs text-muted-foreground">
          초대코드를 파트너에게 보내세요. 파트너가 코드를 입력하면 두 사람의 V-프로필이 연결됩니다.
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
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              7일 후 만료 · 1회 사용 가능
            </p>
          </div>
        ) : (
          <button
            onClick={() => createInvite.mutate()}
            disabled={createInvite.isPending}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {createInvite.isPending ? '발급 중...' : '초대코드 발급'}
          </button>
        )}
      </div>

      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <button onClick={() => setShowInput(v => !v)} className="w-full text-left">
          <p className="text-sm font-medium">초대코드 입력하기</p>
          <p className="text-xs text-muted-foreground">파트너에게 받은 코드를 입력하세요</p>
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
              <p className="text-[11px] text-emerald-600 text-center">연결 완료! 파트너 분석을 확인해보세요.</p>
            )}
            <button
              onClick={inviteInput.handleSubmit}
              disabled={inviteInput.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {inviteInput.isPending ? '연결 중...' : '연결하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
