import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrg } from '@/hooks/useB2BOrg';
import type { B2BOrgType, B2BOrgPlan } from '@/integrations/supabase/veilor-types';
import { useT } from '@/i18n/useT';

// ─────────────────────────────────────────────
// 이중언어 문자열

export default function OrgOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrg, loading, error } = useCreateOrg();
  const t = useT();
  const s = t.b2bDomain.orgOnboarding;

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
