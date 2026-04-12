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
  await page.getByRole('textbox', { name: /이메일/i }).fill(email);
  await page.getByRole('textbox', { name: /비밀번호/i }).fill(password);
  await page.getByRole('button', { name: '로그인', exact: true }).click();
}

export async function waitForHome(page: Page) {
  // 로그인 후 syncOnboarding 완료까지 대기
  // /onboarding/welcome 을 거쳐서 /home 으로 이동하는 흐름 수용
  await page.waitForURL(
    (url) => url.pathname.startsWith('/home'),
    { timeout: 30_000 }
  );
}
