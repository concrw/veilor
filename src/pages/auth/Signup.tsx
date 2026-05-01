import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguageContext } from "@/context/LanguageContext";

const S = {
  ko: {
    loading: '로딩 중...',
    subtitle: '관계의 가면을 발견하는 여정',
    feature1Title: 'V-File 진단',
    feature1Desc: '4분 만에 나의 관계 패턴과 가면 유형을 발견해요.',
    feature2Title: 'AI 엠버',
    feature2Desc: '판단 없이 들어주는 AI와 함께 속마음을 꺼내보세요.',
    feature3Title: 'Dig 패턴 분석',
    feature3Desc: '반복되는 상황의 뿌리를 함께 파고들어요.',
    pageTitle: '회원가입',
    pageSubtitle: '당신의 관계 언어를 발견하세요',
    emailPlaceholder: '이메일',
    passwordPlaceholder: '비밀번호 (8자 이상)',
    confirmPasswordPlaceholder: '비밀번호 확인',
    strengthLabel: '강도: ',
    strengthWeak: '약함',
    strengthFair: '보통',
    strengthStrong: '강함',
    passwordMatch: '✓ 비밀번호가 일치합니다',
    passwordMismatch: '✗ 비밀번호가 일치하지 않습니다',
    termsPrefix: '서비스 이용약관 및',
    termsLink: '개인정보 처리방침',
    termsSuffix: '에 동의합니다',
    submitting: '회원가입 중...',
    submit: '회원가입',
    divider: '또는',
    googleSignup: 'Google로 계속하기',
    hasAccount: '이미 계정이 있으신가요?',
    login: '로그인',
    successMessage: '회원가입이 완료되었습니다! 이메일을 확인해주세요.',
    errEmailRequired: '이메일을 입력해주세요.',
    errEmailInvalid: '올바른 이메일 형식을 입력해주세요.',
    errPasswordRequired: '비밀번호를 입력해주세요.',
    errPasswordTooShort: '비밀번호는 8자 이상이어야 합니다.',
    errPasswordMismatch: '비밀번호가 일치하지 않습니다.',
    errTermsRequired: '서비스 이용약관에 동의해주세요.',
    errGeneric: '회원가입 중 오류가 발생했습니다.',
    errAlreadyRegistered: '이미 가입된 이메일입니다. 로그인을 시도해 주세요.',
    errPasswordLength: '비밀번호는 6자 이상이어야 합니다.',
    errInvalidEmail: '올바른 이메일 형식을 입력해주세요.',
    errRateLimit: '잠시 후 다시 시도해 주세요.',
    errSignupFailed: '회원가입에 실패했습니다. 다시 시도해 주세요.',
    errGoogleFailed: 'Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    errGoogleGeneric: 'Google 로그인 중 오류가 발생했습니다.',
  },
  en: {
    loading: 'Loading...',
    subtitle: 'Discover your relationship language',
    feature1Title: 'V-File Diagnosis',
    feature1Desc: "Discover your relationship pattern and mask type in just 4 minutes.",
    feature2Title: 'AI Amber',
    feature2Desc: "Open up your inner thoughts with an AI that listens without judgment.",
    feature3Title: 'Dig Pattern Analysis',
    feature3Desc: "Dig into the roots of recurring situations together.",
    pageTitle: 'Sign Up',
    pageSubtitle: 'Discover your relationship language',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password (8+ characters)',
    confirmPasswordPlaceholder: 'Confirm Password',
    strengthLabel: 'Strength: ',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthStrong: 'Strong',
    passwordMatch: '✓ Passwords match',
    passwordMismatch: '✗ Passwords do not match',
    termsPrefix: 'I agree to the Terms of Service and',
    termsLink: 'Privacy Policy',
    termsSuffix: '',
    submitting: 'Signing up...',
    submit: 'Sign Up',
    divider: 'or',
    googleSignup: 'Continue with Google',
    hasAccount: 'Already have an account?',
    login: 'Sign In',
    successMessage: 'Sign up complete! Please check your email.',
    errEmailRequired: 'Please enter your email.',
    errEmailInvalid: 'Please enter a valid email address.',
    errPasswordRequired: 'Please enter a password.',
    errPasswordTooShort: 'Password must be at least 8 characters.',
    errPasswordMismatch: 'Passwords do not match.',
    errTermsRequired: 'Please agree to the Terms of Service.',
    errGeneric: 'An error occurred during sign up.',
    errAlreadyRegistered: 'This email is already registered. Please sign in.',
    errPasswordLength: 'Password must be at least 6 characters.',
    errInvalidEmail: 'Please enter a valid email address.',
    errRateLimit: 'Please try again later.',
    errSignupFailed: 'Sign up failed. Please try again.',
    errGoogleFailed: 'Google sign-in failed. Please try again later.',
    errGoogleGeneric: 'An error occurred during Google sign-in.',
  },
};

const Signup = () => {
  const { user, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const s = S[language] ?? S.ko;

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

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 6) return { text: s.strengthWeak, color: "#ef4444" };
    if (password.length < 8) return { text: s.strengthFair, color: "#D4A574" };
    return { text: s.strengthStrong, color: "#86efac" };
  };

  const passwordStrength = getPasswordStrength();

  const inputStyle = {
    background: '#1C1917',
    border: '1px solid #44403C',
    color: '#F5F5F4',
    fontFamily: "'DM Sans', sans-serif",
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
                  <span style={{ color: '#A8A29E' }}>{s.strengthLabel}</span>
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
                className="flex-shrink-0 mt-0.5 cursor-pointer accent-[#D4A574]"
              />
              <label
                htmlFor="agree-terms"
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: '#A8A29E' }}
              >
                {s.termsPrefix}{' '}
                <a
                  href="/privacy.html"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline"
                  style={{ color: '#D4A574' }}
                >
                  {s.termsLink}
                </a>
                {s.termsSuffix && <>{' '}{s.termsSuffix}</>}
              </label>
            </div>

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
              <span className="px-2" style={{ background: '#292524', color: '#A8A29E' }}>{s.divider}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
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
            {s.googleSignup}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#A8A29E' }}>
              {s.hasAccount}{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#D4A574' }}
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
