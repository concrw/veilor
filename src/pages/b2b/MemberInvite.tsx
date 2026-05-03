import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useInviteMembers } from '@/hooks/useB2BOrg';
import { veilorDb } from '@/integrations/supabase/client';
import type { B2BMemberType, B2BMemberInviteInput } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    invalidEmail: '유효한 이메일을 입력해주세요.',
    inviteDone: (n: number) => `${n}명 초대 완료`,
    inviteFail: (n: number) => `${n}건 실패`,
    resultTitle: '초대 결과',
    inviteDoneLabel: '초대 완료',
    failLabel: '실패',
    addMore: '추가 초대',
    toDashboard: '대시보드로',
    title: '멤버 초대',
    subtitle: '이메일로 멤버를 초대합니다. 초대 링크가 이메일로 발송되며, 수락 시 자동으로 Pro 권한이 부여됩니다.',
    notice1: '• 개인 세션 내용은 소속사에 공개되지 않습니다.',
    notice2: '• 트레이니(미성년)는 보호자 동의 절차가 추가됩니다.',
    notice3: '• 멤버는 언제든 탈퇴하고 자신의 데이터를 가져갈 수 있습니다.',
    emailPlaceholder: (n: number) => `이메일 ${n}`,
    birthYearPlaceholder: '출생연도 (예: 2010)',
    addMember: '+ 멤버 추가',
    inviting: '초대 중...',
    inviteCount: (n: number) => `${n}명 초대하기`,
    memberTypeLabels: {
      member:  '성인 멤버 (선수/아이돌/직원)',
      trainee: '트레이니 (미성년)',
      admin:   '어드민 (담당자)',
    } as Record<B2BMemberType, string>,
  },
  en: {
    invalidEmail: 'Please enter a valid email address.',
    inviteDone: (n: number) => `${n} invited successfully`,
    inviteFail: (n: number) => `${n} failed`,
    resultTitle: 'Invitation Results',
    inviteDoneLabel: 'Invited',
    failLabel: 'Failed',
    addMore: 'Invite More',
    toDashboard: 'Go to Dashboard',
    title: 'Invite Members',
    subtitle: 'Invite members by email. An invitation link will be sent, and Pro access is granted automatically upon acceptance.',
    notice1: '• Individual session content is not shared with the organization.',
    notice2: '• Trainees (minors) require additional guardian consent.',
    notice3: '• Members can leave and take their data at any time.',
    emailPlaceholder: (n: number) => `Email ${n}`,
    birthYearPlaceholder: 'Birth year (e.g. 2010)',
    addMember: '+ Add Member',
    inviting: 'Inviting...',
    inviteCount: (n: number) => `Invite ${n}`,
    memberTypeLabels: {
      member:  'Adult Member (Athlete/Idol/Employee)',
      trainee: 'Trainee (Minor)',
      admin:   'Admin (Staff)',
    } as Record<B2BMemberType, string>,
  },
} as const;

interface MemberRow extends B2BMemberInviteInput {
  _id: string;
}

export default function MemberInvite() {
  const { orgId } = useParams<{ orgId: string }>();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState('');
  const { inviteMembers, loading } = useInviteMembers(orgId ?? '', orgName);
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  useEffect(() => {
    if (!orgId) return;
    veilorDb.from('b2b_orgs').select('name').eq('id', orgId).single().then(({ data }) => {
      if (data?.name) setOrgName(data.name);
    });
  }, [orgId]);

  const [rows, setRows] = useState<MemberRow[]>([
    { _id: crypto.randomUUID(), email: '', member_type: 'member' },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ email: string; status: 'ok' | 'error'; msg?: string }[]>([]);

  const addRow = () =>
    setRows(r => [...r, { _id: crypto.randomUUID(), email: '', member_type: 'member' }]);

  const removeRow = (id: string) =>
    setRows(r => r.filter(row => row._id !== id));

  const updateRow = (id: string, field: keyof B2BMemberInviteInput, value: string | number) =>
    setRows(r => r.map(row => row._id === id ? { ...row, [field]: value } : row));

  const handleSubmit = async () => {
    const valid = rows.filter(r => r.email.trim().includes('@'));
    if (valid.length === 0) {
      toast({ title: s.invalidEmail, variant: 'destructive' });
      return;
    }

    const out = await inviteMembers(valid);
    setResults(out);
    setSubmitted(true);

    const okCount = out.filter(r => r.status === 'ok').length;
    toast({ title: s.inviteDone(okCount), description: s.inviteFail(out.length - okCount) });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold">{s.resultTitle}</h1>
          <div className="space-y-2">
            {results.map(r => (
              <div key={r.email} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                r.status === 'ok' ? 'border-green-200 bg-green-50' : 'border-destructive/20 bg-destructive/5'
              }`}>
                <span className="font-medium">{r.email}</span>
                <span className={r.status === 'ok' ? 'text-green-600' : 'text-destructive'}>
                  {r.status === 'ok' ? s.inviteDoneLabel : r.msg ?? s.failLabel}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setSubmitted(false); setRows([{ _id: crypto.randomUUID(), email: '', member_type: 'member' }]); }} className="flex-1">
              {s.addMore}
            </Button>
            <Button onClick={() => window.location.href = `/b2b/dashboard/${orgId}`} className="flex-1">
              {s.toDashboard}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{s.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {s.subtitle}
          </p>
        </div>

        {/* 안내 배너 */}
        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
          <p>{s.notice1}</p>
          <p>{s.notice2}</p>
          <p>{s.notice3}</p>
        </div>

        {/* 멤버 행 */}
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={row._id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder={s.emailPlaceholder(i + 1)}
                  type="email"
                  value={row.email}
                  onChange={e => updateRow(row._id, 'email', e.target.value)}
                />
                <div className="flex gap-2">
                  {(Object.entries(s.memberTypeLabels) as [B2BMemberType, string][]).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => updateRow(row._id, 'member_type', type)}
                      className={`flex-1 py-1.5 rounded-md border text-xs transition-colors ${
                        row.member_type === type
                          ? 'border-primary bg-primary/5 text-foreground font-medium'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {row.member_type === 'trainee' && (
                  <Input
                    placeholder={s.birthYearPlaceholder}
                    type="number"
                    min={2000}
                    max={2020}
                    value={row.birth_year ?? ''}
                    onChange={e => updateRow(row._id, 'birth_year', parseInt(e.target.value))}
                  />
                )}
              </div>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row._id)}
                  className="mt-2.5 text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addRow} className="w-full">
          {s.addMember}
        </Button>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? s.inviting : s.inviteCount(rows.filter(r => r.email.includes('@')).length)}
        </Button>
      </div>
    </div>
  );
}
