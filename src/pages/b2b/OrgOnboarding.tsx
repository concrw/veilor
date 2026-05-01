import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrg } from '@/hooks/useB2BOrg';
import type { B2BOrgType, B2BOrgPlan } from '@/integrations/supabase/veilor-types';
import { useLanguageContext } from '@/context/LanguageContext';

// ─────────────────────────────────────────────
// 이중언어 문자열
// ─────────────────────────────────────────────
const S = {
  ko: {
    registerDone: '고객사 등록 완료',
    registerDoneDesc: (name: string) => `${name} 서비스를 시작합니다.`,
    registerFail: '등록 실패',
    retryMsg: '다시 시도해주세요.',
    steps: ['고객사 정보', '플랜 선택', '확인 및 시작'] as const,
    step0Title: '고객사 정보를 입력해주세요',
    step0Subtitle: '베일러 B2B 서비스를 시작합니다.',
    orgNameLabel: '고객사명',
    orgNamePlaceholder: '예: OO스포츠단, OO엔터테인먼트',
    orgTypeLabel: '고객사 유형',
    step1Title: '플랜을 선택해주세요',
    step1Subtitle: '멤버 수에 맞는 플랜을 선택하세요.',
    planNote: '* 코칭 세션 2회/인/월 포함. 추가 세션 55,000원/회.',
    step2Title: '등록 내용을 확인해주세요',
    confirmOrgName: '고객사명',
    confirmType: '유형',
    confirmPlan: '플랜',
    confirmPrice: '인당 요금',
    confirmContractStart: '계약 시작일',
    notice1: '• 개인 세션 내용은 소속사에 공개되지 않습니다.',
    notice2: '• 집계 데이터(팀 평균)만 어드민 대시보드에 표시됩니다.',
    notice3: '• 계약 해지 시 개인 데이터는 개인 소유로 유지됩니다.',
    prev: '이전',
    next: '다음',
    starting: '등록 중...',
    startService: '서비스 시작하기',
    planInfo: {
      starter:       { label: '스타터',        price: '89,000원/인/월', range: '5~20명' },
      growth:        { label: '그로스',         price: '69,000원/인/월', range: '21~50명' },
      enterprise:    { label: '엔터프라이즈',   price: '협의 (49,000원~)', range: '51명+' },
      trainee_basic: { label: '트레이니 베이직', price: '59,000원/인/월', range: '5~30명' },
      trainee_full:  { label: '트레이니 풀',    price: '45,000원/인/월', range: '31명+' },
    } as Record<B2BOrgPlan, { label: string; price: string; range: string }>,
    orgTypeLabels: {
      sports:        '스포츠 (구단/아카데미)',
      entertainment: '엔터테인먼트 (소속사)',
      corporate:     '기업',
    } as Record<B2BOrgType, string>,
  },
  en: {
    registerDone: 'Organization Registered',
    registerDoneDesc: (name: string) => `Starting ${name} service.`,
    registerFail: 'Registration failed',
    retryMsg: 'Please try again.',
    steps: ['Organization Info', 'Select Plan', 'Review & Start'] as const,
    step0Title: 'Enter your organization details',
    step0Subtitle: 'Start VEILOR B2B service.',
    orgNameLabel: 'Organization Name',
    orgNamePlaceholder: 'e.g. OO Sports Club, OO Entertainment',
    orgTypeLabel: 'Organization Type',
    step1Title: 'Choose a plan',
    step1Subtitle: 'Select the plan that fits your team size.',
    planNote: '* Includes 2 coaching sessions/person/month. Additional session: ₩55,000/session.',
    step2Title: 'Review your registration',
    confirmOrgName: 'Organization',
    confirmType: 'Type',
    confirmPlan: 'Plan',
    confirmPrice: 'Price per person',
    confirmContractStart: 'Contract Start',
    notice1: '• Individual session content is not shared with the organization.',
    notice2: '• Only aggregated data (team averages) is shown in the admin dashboard.',
    notice3: '• Personal data remains individually owned upon contract termination.',
    prev: 'Previous',
    next: 'Next',
    starting: 'Registering...',
    startService: 'Start Service',
    planInfo: {
      starter:       { label: 'Starter',        price: '₩89,000/person/month', range: '5–20 people' },
      growth:        { label: 'Growth',          price: '₩69,000/person/month', range: '21–50 people' },
      enterprise:    { label: 'Enterprise',      price: 'Custom (from ₩49,000)', range: '51+ people' },
      trainee_basic: { label: 'Trainee Basic',   price: '₩59,000/person/month', range: '5–30 people' },
      trainee_full:  { label: 'Trainee Full',    price: '₩45,000/person/month', range: '31+ people' },
    } as Record<B2BOrgPlan, { label: string; price: string; range: string }>,
    orgTypeLabels: {
      sports:        'Sports (Club/Academy)',
      entertainment: 'Entertainment (Agency)',
      corporate:     'Corporate',
    } as Record<B2BOrgType, string>,
  },
} as const;

export default function OrgOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrg, loading, error } = useCreateOrg();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    org_type: '' as B2BOrgType | '',
    plan: '' as B2BOrgPlan | '',
    contract_start: new Date().toISOString().split('T')[0],
    admin_email: '',
  });

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0 && form.org_type !== '';
    if (step === 1) return form.plan !== '';
    return true;
  };

  const handleSubmit = async () => {
    if (!form.org_type || !form.plan) return;

    const org = await createOrg({
      name: form.name.trim(),
      org_type: form.org_type,
      plan: form.plan,
      contract_start: form.contract_start,
      admin_email: form.admin_email,
    });

    if (org) {
      toast({ title: s.registerDone, description: s.registerDoneDesc(org.name) });
      navigate(`/b2b/dashboard/${org.id}`);
    } else {
      toast({ title: s.registerFail, description: error ?? s.retryMsg, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {s.steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < s.steps.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* 스텝 0 — 고객사 정보 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{s.step0Title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">{s.step0Subtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{s.orgNameLabel}</label>
                <Input
                  placeholder={s.orgNamePlaceholder}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{s.orgTypeLabel}</label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.entries(s.orgTypeLabels) as [B2BOrgType, string][]).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => setForm(f => ({ ...f, org_type: type }))}
                      className={`p-3.5 rounded-lg border text-left text-sm transition-colors ${
                        form.org_type === type
                          ? 'border-primary bg-primary/5 text-foreground font-medium'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 스텝 1 — 플랜 선택 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{s.step1Title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">{s.step1Subtitle}</p>
            </div>

            <div className="space-y-2">
              {(Object.entries(s.planInfo) as [B2BOrgPlan, { label: string; price: string; range: string }][]).map(([plan, info]) => (
                <button
                  key={plan}
                  onClick={() => setForm(f => ({ ...f, plan }))}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    form.plan === plan
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{info.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{info.range}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{info.price}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {s.planNote}
            </p>
          </div>
        )}

        {/* 스텝 2 — 확인 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{s.step2Title}</h1>
            </div>

            <div className="rounded-lg border p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.confirmOrgName}</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.confirmType}</span>
                <span className="font-medium">{form.org_type ? s.orgTypeLabels[form.org_type] : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.confirmPlan}</span>
                <span className="font-medium">{form.plan ? s.planInfo[form.plan].label : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.confirmPrice}</span>
                <span className="font-medium text-primary">{form.plan ? s.planInfo[form.plan].price : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{s.confirmContractStart}</span>
                <span className="font-medium">{form.contract_start}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <p>{s.notice1}</p>
              <p>{s.notice2}</p>
              <p>{s.notice3}</p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(prev => prev - 1)} disabled={loading} className="flex-1">
              {s.prev}
            </Button>
          )}
          {step < s.steps.length - 1 ? (
            <Button onClick={() => setStep(prev => prev + 1)} disabled={!canNext()} className="flex-1">
              {s.next}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canNext()} className="flex-1">
              {loading ? s.starting : s.startService}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
