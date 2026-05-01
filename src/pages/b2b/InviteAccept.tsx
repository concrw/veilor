import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAcceptB2BInvite } from '@/hooks/useB2BOrg';
import { useLanguageContext } from '@/context/LanguageContext';

const S = {
  ko: {
    title: 'VEILOR 초대',
    accepting: '초대를 수락하는 중...',
    success: 'Pro 멤버십이 활성화되었습니다.',
    successSub: '베일러의 모든 기능을 이용할 수 있습니다.',
    goHome: '시작하기',
    loginRequired: '초대를 수락하려면 로그인이 필요합니다.',
    loginBtn: '로그인',
    errorTitle: '초대 수락 실패',
  },
  en: {
    title: 'VEILOR Invitation',
    accepting: 'Accepting invitation...',
    success: 'Pro membership activated.',
    successSub: 'You now have full access to VEILOR.',
    goHome: 'Get Started',
    loginRequired: 'Please log in to accept this invitation.',
    loginBtn: 'Log In',
    errorTitle: 'Invitation Failed',
  },
} as const;

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const { acceptInvite, loading, error } = useAcceptB2BInvite(token ?? '');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (done || loading) return;

    acceptInvite().then(ok => {
      if (ok) setDone(true);
    });
  }, [user, authLoading]);

  if (authLoading) {
    return <LoadingScreen message={s.accepting} />;
  }

  if (!user) {
    return (
      <CenteredCard>
        <h1 className="text-xl font-light text-on-surface">{s.title}</h1>
        <p className="text-sm text-on-surface-muted mt-2">{s.loginRequired}</p>
        <button
          onClick={() => navigate('/auth', { state: { redirectTo: `/b2b/accept/${token}` } })}
          className="mt-6 w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-medium"
        >
          {s.loginBtn}
        </button>
      </CenteredCard>
    );
  }

  if (loading) {
    return <LoadingScreen message={s.accepting} />;
  }

  if (error) {
    return (
      <CenteredCard>
        <h1 className="text-xl font-light text-on-surface">{s.errorTitle}</h1>
        <p className="text-sm text-error mt-2">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full h-11 rounded-xl bg-surface-raised text-on-surface text-sm"
        >
          {s.goHome}
        </button>
      </CenteredCard>
    );
  }

  if (done) {
    return (
      <CenteredCard>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-light text-on-surface text-center">{s.success}</h1>
        <p className="text-sm text-on-surface-muted mt-1 text-center">{s.successSub}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-medium"
        >
          {s.goHome}
        </button>
      </CenteredCard>
    );
  }

  return <LoadingScreen message={s.accepting} />;
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface rounded-xl p-8 space-y-2">
        {children}
      </div>
    </div>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-on-surface-muted">{message}</p>
      </div>
    </div>
  );
}
