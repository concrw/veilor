import { Page } from '@playwright/test';

// 테스트 전용 계정 (Supabase에 미리 생성된 시드 유저)
export const TEST_USERS = {
  // 온보딩 미완료 유저 — 항상 /onboarding/welcome 에서 시작
  fresh: {
    email: process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test',
    password: process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!',
  },
  // 온보딩 완료 유저 — /home/vent 에서 시작
  done: {
    email: process.env.E2E_USER_DONE_EMAIL ?? 'e2e.done@veilor.test',
    password: process.env.E2E_USER_DONE_PW ?? 'Veilor2026!',
  },
};

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  // 이미 인증된 세션이 있으면 Login.tsx가 '/'로 즉시 리다이렉트 — input 없이 통과
  const result = await Promise.race([
    page.waitForSelector('input[type="email"]', { timeout: 8_000 }).then(() => 'form'),
    page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 8_000 }).then(() => 'redirected'),
  ]).catch(() => 'form');
  if (result === 'redirected') return;

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  // Login.tsx: button은 type 속성 없음, text로 찾음
  await page.locator('button', { hasText: '로그인' }).first().click();
}

export async function waitForHome(page: Page) {
  // 로그인 후 syncOnboarding 완료까지 대기 (60초)
  // 경유 가능 URL:
  //   - /onboarding/mode-select : isFirstVisit=true (새 브라우저 컨텍스트)
  //   - /onboarding/vfile/start : AuthContext 순서 수정 전 레거시 케이스 보험
  await page.waitForURL(
    (url) =>
      url.pathname.startsWith('/home') ||
      url.pathname === '/onboarding/mode-select' ||
      url.pathname === '/onboarding/vfile/start',
    { timeout: 60_000 }
  );

  const currentPath = new URL(page.url()).pathname;

  if (currentPath === '/onboarding/mode-select') {
    // 기존 veilor_ux_mode 보존 (loginWithMode 등이 미리 설정한 값 유지)
    const savedMode = await page.evaluate(() => localStorage.getItem('veilor_ux_mode'));
    // ModeSelect의 첫 번째 확인 버튼(도메인 선택) 클릭 → 두 번째 확인 버튼(모드 선택) 클릭
    // → SPA 내부 navigate로 /home/vent 진입 (full reload 없음)
    const confirmBtn = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first();
    await confirmBtn.waitFor({ timeout: 10_000 }).catch(() => null);
    await confirmBtn.click().catch(() => null);
    // 두 번째 단계 버튼 (step=2)
    await page.waitForTimeout(500);
    const confirmBtn2 = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first();
    await confirmBtn2.click().catch(() => null);
    await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 30_000 });
    // 보존된 모드 복원 (ModeSelect.handleConfirm이 setMode('original')로 덮었을 수 있음)
    if (savedMode && savedMode !== 'original') {
      await page.evaluate((m) => {
        localStorage.setItem('veilor_ux_mode', m);
        document.documentElement.setAttribute('data-ux-mode', m);
      }, savedMode);
    }

  } else if (currentPath === '/onboarding/vfile/start') {
    // AuthContext 재초기화 없이 SPA navigate: history.pushState + popstate
    await page.evaluate(() => {
      localStorage.setItem('veilor_mode_selected', 'true');
      localStorage.setItem('veilor_ux_mode', 'original');
      window.history.pushState({}, '', '/home/vent');
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    });
    await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 30_000 })
      .catch(async () => {
        // fallback: React Router가 popstate를 무시한 경우 goto 사용
        await page.goto('/home/vent');
        // syncOnboarding 완료까지 스피너 대기
        await page.locator('.animate-spin').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => null);
        await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
        await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 30_000 });
      });
  }

  // PageLoader 스피너 소멸 대기
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
}
