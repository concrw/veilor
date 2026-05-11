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
  // 로그인 후 syncOnboarding 완료까지 대기
  // 프로덕션 cold start + Supabase syncOnboarding 쿼리 시간 수용 (60초)
  await page.waitForURL(
    (url) => url.pathname.startsWith('/home'),
    { timeout: 60_000 }
  );
  // URL 도달 후 PageLoader 스피너 소멸 대기 (lazy chunk 완료)
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
}
