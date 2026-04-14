import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const { user, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

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
    if (!email.trim()) { setError("이메일을 입력해주세요."); return false; }
    if (!email.includes('@')) { setError("올바른 이메일 형식을 입력해주세요."); return false; }
    if (!password.trim()) { setError("비밀번호를 입력해주세요."); return false; }
    if (password.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return false; }
    if (password !== confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return false; }
    if (!agreeToTerms) { setError("서비스 이용약관에 동의해주세요."); return false; }
    return true;
  };

  const getKoreanError = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes('user already registered') || m.includes('already been registered')) {
      return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
    }
    if (m.includes('password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
    if (m.includes('invalid email')) return '올바른 이메일 형식을 입력해주세요.';
    if (m.includes('too many requests') || m.includes('rate limit')) return '잠시 후 다시 시도해 주세요.';
    return '회원가입에 실패했습니다. 다시 시도해 주세요.';
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(getKoreanError(error.message));
      } else {
        setSuccess("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeToTerms(false);
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      setError('Google 로그인 중 오류가 발생했습니다.');
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 6) return { text: "약함", color: "#ef4444" };
    if (password.length < 8) return { text: "보통", color: "#D4A574" };
    return { text: "강함", color: "#86efac" };
  };

  const passwordStrength = getPasswordStrength();

  const inputStyle = {
    background: '#1C1917',
    border: '1px solid #44403C',
    color: '#F5F5F4',
    fontFamily: "'DM Sans', sans-serif",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <div className="w-6 h-6 rounded-full animate-spin mx-auto mb-2" style={{ border: '2px solid #D4A574', borderTopColor: 'transparent' }} />
          <p className="text-xs" style={{ color: '#A8A29E' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6" style={{ background: '#1C1917', fontFamily: "'DM Sans', sans-serif" }}>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mx-auto mt-5" style={{ color: '#F5F5F4', fontFamily: "'DM Sans', sans-serif" }}>
          VEILOR
        </h1>
      </header>

      <div className="max-w-sm mx-auto rounded-2xl px-6 py-6" style={{ background: '#292524', border: '1px solid #44403C' }}>
        <div className="text-center pb-4">
          <h2 className="text-lg font-medium" style={{ color: '#F5F5F4' }}>회원가입</h2>
          <p className="text-xs mt-1" style={{ color: '#A8A29E' }}>
            당신의 관계 언어를 발견하세요
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
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
              style={inputStyle}
            />

            <div>
              <input
                type="password"
                placeholder="비밀번호 (8자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                style={inputStyle}
              />
              {password && (
                <div className="mt-1 text-xs px-1">
                  <span style={{ color: '#A8A29E' }}>강도: </span>
                  <span style={{ color: passwordStrength.color }}>{passwordStrength.text}</span>
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                style={inputStyle}
              />
              {confirmPassword && (
                <div className="mt-1 text-xs px-1">
                  {password === confirmPassword ? (
                    <span style={{ color: '#86efac' }}>✓ 비밀번호가 일치합니다</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>✗ 비밀번호가 일치하지 않습니다</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 py-2">
              <button
                type="button"
                onClick={() => setAgreeToTerms(!agreeToTerms)}
                disabled={submitting}
                className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors"
                style={{
                  background: agreeToTerms ? '#D4A574' : 'transparent',
                  border: `1px solid ${agreeToTerms ? '#D4A574' : '#44403C'}`,
                }}
              >
                {agreeToTerms && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <label
                onClick={() => !submitting && setAgreeToTerms(!agreeToTerms)}
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: '#A8A29E' }}
              >
                서비스 이용약관 및{' '}
                <a
                  href="/privacy.html"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="underline"
                  style={{ color: '#D4A574' }}
                >
                  개인정보 처리방침
                </a>
                에 동의합니다
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
              {submitting ? '회원가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full" style={{ borderTop: '1px solid #44403C' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2" style={{ background: '#292524', color: '#A8A29E' }}>또는</span>
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
            Google로 계속하기
          </button>

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#A8A29E' }}>
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#D4A574' }}
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;
