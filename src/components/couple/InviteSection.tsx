import { useState } from 'react';
import { useCreateInvite, useInviteCodeInput } from '@/hooks/usePartner';
import { useT } from '@/i18n/useT';


export default function InviteSection() {
  const createInvite = useCreateInvite();
  const [copied, setCopied] = useState(false);
  const inviteInput = useInviteCodeInput();
  const [showInput, setShowInput] = useState(false);
  const t = useT();
  const s = t.coupleDomain.inviteSection;

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
