import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCreateOrg } from '@/hooks/useB2BOrg';
import type { B2BOrgType, B2BOrgPlan } from '@/integrations/supabase/veilor-types';

// 플랜별 설명
const PLAN_INFO: Record<B2BOrgPlan, { label: string; price: string; range: string }> = {
  starter:       { label: '스타터',        price: '89,000원/인/월', range: '5~20명' },
  growth:        { label: '그로스',         price: '69,000원/인/월', range: '21~50명' },
  enterprise:    { label: '엔터프라이즈',   price: '협의 (49,000원~)', range: '51명+' },
  trainee_basic: { label: '트레이니 베이직', price: '59,000원/인/월', range: '5~30명' },
  trainee_full:  { label: '트레이니 풀',    price: '45,000원/인/월', range: '31명+' },
};

const ORG_TYPE_LABELS: Record<B2BOrgType, string> = {
  sports:        '스포츠 (구단/아카데미)',
  entertainment: '엔터테인먼트 (소속사)',
  corporate:     '기업',
};

const STEPS = ['고객사 정보', '플랜 선택', '확인 및 시작'] as const;

export default function OrgOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrg, loading, error } = useCreateOrg();

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
      toast({ title: '고객사 등록 완료', description: `${org.name} 서비스를 시작합니다.` });
      navigate(`/b2b/dashboard/${org.id}`);
    } else {
      toast({ title: '등록 실패', description: error ?? '다시 시도해주세요.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
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
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* 스텝 0 — 고객사 정보 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">고객사 정보를 입력해주세요</h1>
              <p className="text-muted-foreground mt-1 text-sm">베일러 B2B 서비스를 시작합니다.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">고객사명</label>
                <Input
                  placeholder="예: OO스포츠단, OO엔터테인먼트"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">고객사 유형</label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.entries(ORG_TYPE_LABELS) as [B2BOrgType, string][]).map(([type, label]) => (
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
              <h1 className="text-2xl font-bold">플랜을 선택해주세요</h1>
              <p className="text-muted-foreground mt-1 text-sm">멤버 수에 맞는 플랜을 선택하세요.</p>
            </div>

            <div className="space-y-2">
              {(Object.entries(PLAN_INFO) as [B2BOrgPlan, typeof PLAN_INFO[B2BOrgPlan]][]).map(([plan, info]) => (
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
              * 코칭 세션 2회/인/월 포함. 추가 세션 55,000원/회.
            </p>
          </div>
        )}

        {/* 스텝 2 — 확인 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">등록 내용을 확인해주세요</h1>
            </div>

            <div className="rounded-lg border p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">고객사명</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">유형</span>
                <span className="font-medium">{form.org_type ? ORG_TYPE_LABELS[form.org_type] : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">플랜</span>
                <span className="font-medium">{form.plan ? PLAN_INFO[form.plan].label : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">인당 요금</span>
                <span className="font-medium text-primary">{form.plan ? PLAN_INFO[form.plan].price : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">계약 시작일</span>
                <span className="font-medium">{form.contract_start}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <p>• 개인 세션 내용은 소속사에 공개되지 않습니다.</p>
              <p>• 집계 데이터(팀 평균)만 어드민 대시보드에 표시됩니다.</p>
              <p>• 계약 해지 시 개인 데이터는 개인 소유로 유지됩니다.</p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading} className="flex-1">
              이전
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="flex-1">
              다음
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canNext()} className="flex-1">
              {loading ? '등록 중...' : '서비스 시작하기'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
