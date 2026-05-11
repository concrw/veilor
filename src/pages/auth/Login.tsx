import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n/useT";

const Login = () => {
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const s = t.loginPage;

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
          <div className="w-6 h-6 rounded-full animate-spin mx-auto mb-2" style={{ border: '2px solid #E0B48A', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: '#B8B3AF' }}>{s.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-dvh flex" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>

      {/* 좌측 브랜드 패널 — PC 전용 */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-14 gap-12" style={{ borderRight: '1px solid #2A2624' }}>
        <div>
          <div className="flex items-center gap-4 mb-3">
            <img src="/icon-192x192.png" alt="VEILOR" className="w-12 h-12 rounded-xl" />
            <h1 className="text-4xl font-bold tracking-widest" style={{ color: '#E0B48A', letterSpacing: '0.2em' }}>VEILOR</h1>
          </div>
          <p className="text-base font-light" style={{ color: '#B8B3AF' }}>{s.subtitle}</p>
        </div>
        <div className="space-y-6">
          {FEATURES.map(item => (
            <div key={item.title} className="flex gap-4">
              <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#E0B48A', height: 40 }} />
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: '#E7E5E4' }}>{item.title}</p>
                <p className="text-xs font-light leading-relaxed" style={{ color: '#9C9590' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 폼 영역 */}
      <div className="flex flex-col flex-1 h-full lg:flex-none lg:w-[480px] items-center justify-center px-8 py-10">

      <div className="w-full max-w-sm rounded-2xl px-6 py-6" style={{ background: '#292524', border: '1px solid #44403C' }}>
        <div className="text-center pb-4">
          <img src="/icon-192x192.png" alt="VEILOR" className="lg:hidden w-12 h-12 rounded-xl mx-auto mb-3" />
          <h2 className="text-lg font-medium" style={{ color: '#F5F5F4' }}>{s.pageTitle}</h2>
          <p className="text-xs mt-1" style={{ color: '#B8B3AF' }}>
            {s.pageSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg p-3" style={{ border: '1px solid #E0B48A50', background: '#E0B48A10' }}>
              <p className="text-xs" style={{ color: '#E0B48A' }}>{error}</p>
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
              className="w-full rounded-xl px-4 py-3 outline-none transition-colors"
              style={{
                background: '#1C1917',
                border: '1px solid #44403C',
                color: '#F5F5F4',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
              }}
            />

            <input
              type="password"
              placeholder={s.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              onKeyPress={handleKeyPress}
              className="w-full rounded-xl px-4 py-3 outline-none transition-colors"
              style={{
                background: '#1C1917',
                border: '1px solid #44403C',
                color: '#F5F5F4',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-sm py-3 rounded-xl font-medium transition-opacity"
              style={{
                background: '#E0B48A',
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
              <span className="px-2 text-xs" style={{ background: '#292524', color: '#B8B3AF' }}>{s.divider}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full text-sm py-3 rounded-xl font-medium transition-opacity"
            style={{
              background: 'transparent',
              border: '1px solid #44403C',
              color: '#B8B3AF',
              opacity: submitting ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {s.googleLogin}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#B8B3AF' }}>
              {s.noAccount}{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#E0B48A' }}
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
