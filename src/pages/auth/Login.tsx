import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    loading: '로딩 중...',
    subtitle: '관계의 가면을 발견하는 여정',
    feature1Title: '나의 관계 언어',
    feature1Desc: 'V-File 진단으로 내가 관계에서 반복하는 패턴과 가면을 발견해요.',
    feature2Title: 'AI 엠버와 대화',
    feature2Desc: '감정을 판단 없이 들어주는 AI와 함께 속마음을 꺼내보세요.',
    feature3Title: '패턴 분석 Dig',
    feature3Desc: '왜 이런 상황이 반복되는지 심층적으로 파고들어요.',
    pageTitle: '로그인',
    pageSubtitle: '당신의 관계 언어를 발견하세요',
    emailPlaceholder: '이메일',
    passwordPlaceholder: '비밀번호',
    submitting: '로그인 중...',
    submit: '로그인',
    divider: '또는',
    googleLogin: 'Google로 로그인',
    noAccount: '계정이 없으신가요?',
    signup: '회원가입',
    errRequired: '이메일과 비밀번호를 입력해주세요.',
    errGeneric: '로그인 중 오류가 발생했습니다.',
    errInvalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
    errEmailNotConfirmed: '이메일 인증이 필요합니다. 받은 편지함을 확인해 주세요.',
    errRateLimit: '잠시 후 다시 시도해 주세요.',
    errUserNotFound: '등록되지 않은 이메일입니다.',
    errNetwork: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.',
    errLoginFailed: '로그인에 실패했습니다. 다시 시도해 주세요.',
    errGoogleFailed: 'Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    errGoogleGeneric: 'Google 로그인 중 오류가 발생했습니다.',
  },
  en: {
    loading: 'Loading...',
    subtitle: 'Discover your relationship language',
    feature1Title: 'My Relationship Language',
    feature1Desc: "Discover the patterns and masks you repeat in relationships through V-File diagnosis.",
    feature2Title: 'Chat with AI Amber',
    feature2Desc: "Open up your inner thoughts with an AI that listens without judgment.",
    feature3Title: 'Pattern Analysis Dig',
    feature3Desc: "Dig deep into why the same situations keep repeating.",
    pageTitle: 'Sign In',
    pageSubtitle: 'Discover your relationship language',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    submitting: 'Signing in...',
    submit: 'Sign In',
    divider: 'or',
    googleLogin: 'Sign in with Google',
    noAccount: "Don't have an account?",
    signup: 'Sign Up',
    errRequired: 'Please enter your email and password.',
    errGeneric: 'An error occurred while signing in.',
    errInvalidCredentials: 'Incorrect email or password.',
    errEmailNotConfirmed: 'Email verification required. Please check your inbox.',
    errRateLimit: 'Please try again later.',
    errUserNotFound: 'No account found with this email.',
    errNetwork: 'A network error occurred. Please check your internet connection.',
    errLoginFailed: 'Sign in failed. Please try again.',
    errGoogleFailed: 'Google sign-in failed. Please try again later.',
    errGoogleGeneric: 'An error occurred during Google sign-in.',
  },
};

const Login = () => {
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const getAuthErrorMessage = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_grant')) {
      return s.errInvalidCredentials;
    }
    if (m.includes('email not confirmed')) {
      return s.errEmailNotConfirmed;
    }
    if (m.includes('too many requests') || m.includes('rate limit')) {
      return s.errRateLimit;
    }
    if (m.includes('user not found') || m.includes('no user found')) {
      return s.errUserNotFound;
    }
    if (m.includes('network') || m.includes('fetch')) {
      return s.errNetwork;
    }
    return s.errLoginFailed;
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(s.errRequired);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(getAuthErrorMessage(error.message));
      }
    } catch (err) {
      setError(s.errGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(s.errGoogleFailed);
      }
    } catch (err) {
      setError(s.errGoogleGeneric);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const FEATURES = [
    { title: s.feature1Title, desc: s.feature1Desc },
    { title: s.feature2Title, desc: s.feature2Desc },
    { title: s.feature3Title, desc: s.feature3Desc },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <div className="w-6 h-6 rounded-full animate-spin mx-auto mb-2" style={{ border: '2px solid #D4A574', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: '#A8A29E' }}>{s.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-14 gap-12" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest mb-3" style={{ color: '#D4A574', letterSpacing: '0.2em' }}>VEILOR</h1>
          <p className="text-base font-light" style={{ color: '#A8A29E' }}>{s.subtitle}</p>
        </div>
        <div className="space-y-6">
          {FEATURES.map(item => (
            <div key={item.title} className="flex gap-4">
              <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#D4A574', height: 40 }} />
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#E7E5E4' }}>{item.title}</p>
                <p className="text-xs font-light leading-relaxed" style={{ color: '#78716C' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 폼 영역 */}
      <div className="flex flex-col flex-1 lg:flex-none lg:w-[480px] items-center justify-center px-8 py-10">
        {/* 모바일 헤더 */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#F5F5F4' }}>VEILOR</h1>
        </div>

      <div className="w-full max-w-sm rounded-2xl px-6 py-6" style={{ background: '#292524', border: '1px solid #44403C' }}>
        <div className="text-center pb-4">
          <h2 className="text-lg font-medium" style={{ color: '#F5F5F4' }}>{s.pageTitle}</h2>
          <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
            {s.pageSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg p-3" style={{ border: '1px solid #D4A57450', background: '#D4A57410' }}>
              <p className="text-xs" style={{ color: '#D4A574' }}>{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              placeholder={s.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              onKeyPress={handleKeyPress}
              className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              style={{
                background: '#1C1917',
                border: '1px solid #44403C',
                color: '#F5F5F4',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            <input
              type="password"
              placeholder={s.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              onKeyPress={handleKeyPress}
              className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              style={{
                background: '#1C1917',
                border: '1px solid #44403C',
                color: '#F5F5F4',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-sm py-3 rounded-xl font-medium transition-opacity"
              style={{
                background: '#D4A574',
                color: '#1C1917',
                opacity: submitting ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {submitting ? s.submitting : s.submit}
            </button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full" style={{ borderTop: '1px solid #44403C' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-xs" style={{ background: '#292524', color: '#A8A29E' }}>{s.divider}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full text-sm py-3 rounded-xl font-medium transition-opacity"
            style={{
              background: 'transparent',
              border: '1px solid #44403C',
              color: '#A8A29E',
              opacity: submitting ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {s.googleLogin}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#A8A29E' }}>
              {s.noAccount}{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#D4A574' }}
              >
                {s.signup}
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
};

export default Login;
