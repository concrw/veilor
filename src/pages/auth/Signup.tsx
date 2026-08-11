import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n/useT";
import { isNativeApp } from "@/lib/platform";

const Signup = () => {
  const { user, loading, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const nativeApp = isNativeApp();
  const navigate = useNavigate();
  const t = useT();
  const s = t.signupPage;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!email.trim()) { setError(s.errEmailRequired); return false; }
    if (!email.includes('@')) { setError(s.errEmailInvalid); return false; }
    if (!password.trim()) { setError(s.errPasswordRequired); return false; }
    if (password.length < 8) { setError(s.errPasswordTooShort); return false; }
    if (password !== confirmPassword) { setError(s.errPasswordMismatch); return false; }
    if (!agreeToTerms) { setError(s.errTermsRequired); return false; }
    return true;
  };

  const getAuthErrorMessage = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes('user already registered') || m.includes('already been registered')) {
      return s.errAlreadyRegistered;
    }
    if (m.includes('password should be at least')) return s.errPasswordLength;
    if (m.includes('invalid email')) return s.errInvalidEmail;
    if (m.includes('too many requests') || m.includes('rate limit')) return s.errRateLimit;
    return s.errSignupFailed;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(getAuthErrorMessage(error.message));
      } else {
        setSuccess(s.successMessage);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeToTerms(false);
      }
    } catch (err) {
      setError(s.errGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(s.errGoogleFailed);
      }
    } catch (err) {
      setError(s.errGoogleGeneric);
    }
  };

  const handleAppleSignup = async () => {
    try {
      const { error } = await signInWithApple();
      if (error) {
        setError(s.errAppleFailed);
      }
    } catch (err) {
      setError(s.errAppleGeneric);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 6) return { text: s.strengthWeak, color: "#ef4444" };
    if (password.length < 8) return { text: s.strengthFair, color: "#E0B48A" };
    return { text: s.strengthStrong, color: "#86efac" };
  };

  const passwordStrength = getPasswordStrength();

  const inputStyle = {
    background: '#1C1917',
    border: '1px solid #44403C',
    color: '#F5F5F4',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
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

          {success && (
            <div className="rounded-lg p-3" style={{ border: '1px solid #86efac50', background: '#86efac10' }}>
              <p className="text-xs" style={{ color: '#86efac' }}>{success}</p>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              placeholder={s.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              style={inputStyle}
            />

            <div>
              <input
                type="password"
                placeholder={s.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                style={inputStyle}
              />
              {password && (
                <div className="mt-1 text-xs px-1">
                  <span style={{ color: '#B8B3AF' }}>{s.strengthLabel}</span>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder={s.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                style={inputStyle}
              />
              {confirmPassword && (
                <div className="mt-1 text-xs px-1">
                  {password === confirmPassword ? (
                    <span style={{ color: '#86efac' }}>{s.passwordMatch}</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>{s.passwordMismatch}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
                disabled={submitting}
                className="flex-shrink-0 mt-0.5 cursor-pointer accent-[#E0B48A]"
              />
              <label
                htmlFor="agree-terms"
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: '#B8B3AF' }}
              >
                {s.termsPrefix && <>{s.termsPrefix}{' '}</>}
                <a
                  href="/privacy.html"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline"
                  style={{ color: '#E0B48A' }}
                >
                  {s.termsLink}
                </a>
                {s.termsSuffix && <>{' '}{s.termsSuffix}{' '}</>}
                <a
                  href="/terms.html"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline"
                  style={{ color: '#E0B48A' }}
                >
                  {s.termsOfServiceLink}
                </a>
              </label>
            </div>

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
              <span className="px-2" style={{ background: '#292524', color: '#B8B3AF' }}>{s.divider}</span>
            </div>
          </div>

          <button
            onClick={handleAppleSignup}
            disabled={submitting}
            className="w-full text-sm py-3 rounded-xl font-medium transition-opacity"
            style={{
              background: '#000000',
              border: '1px solid #44403C',
              color: '#FFFFFF',
              opacity: submitting ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="17" height="20" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-36.8-155.5-127.4C46 790.8 0 663 0 541.8c0-207.1 100.9-316.5 201.1-316.5 34.7 0 93.3 29.1 117.9 29.1 24.5 0 89.1-34.8 148.2-34.8 28.2 0 91.8 17.5 142.8 87.6zm-67.3-222.1c28.1-36.5 48.5-87.5 48.5-138.4 0-7.1-.6-14.3-1.9-20.1-46.1 1.9-101.7 33.8-135.4 75.2-26.2 31.3-50.7 82.2-50.7 133.8 0 7.8 1.3 15.5 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 41.4 0 93.6-30.1 124-69.9z"/>
            </svg>
            {s.appleSignup}
          </button>

          {!nativeApp && (
            <button
              onClick={handleGoogleSignup}
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
              {s.googleSignup}
            </button>
          )}

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#B8B3AF' }}>
              {s.hasAccount}{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#E0B48A' }}
              >
                {s.login}
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
};

export default Signup;
