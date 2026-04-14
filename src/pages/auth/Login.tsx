import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const getKoreanError = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_grant')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    if (m.includes('email not confirmed')) {
      return '이메일 인증이 필요합니다. 받은 편지함을 확인해 주세요.';
    }
    if (m.includes('too many requests') || m.includes('rate limit')) {
      return '잠시 후 다시 시도해 주세요.';
    }
    if (m.includes('user not found') || m.includes('no user found')) {
      return '등록되지 않은 이메일입니다.';
    }
    if (m.includes('network') || m.includes('fetch')) {
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.';
    }
    return '로그인에 실패했습니다. 다시 시도해 주세요.';
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(getKoreanError(error.message));
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError('Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (err) {
      setError('Google 로그인 중 오류가 발생했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
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
          <h2 className="text-lg font-medium" style={{ color: '#F5F5F4' }}>로그인</h2>
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

          <div className="space-y-3">
            <input
              type="email"
              placeholder="이메일"
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
              placeholder="비밀번호"
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
              {submitting ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full" style={{ borderTop: '1px solid #44403C' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-xs" style={{ background: '#292524', color: '#A8A29E' }}>또는</span>
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
            Google로 로그인
          </button>

          <div className="text-center pt-2">
            <p className="text-xs" style={{ color: '#A8A29E' }}>
              계정이 없으신가요?{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="underline hover:no-underline bg-transparent border-none p-0 cursor-pointer"
                style={{ color: '#D4A574' }}
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
