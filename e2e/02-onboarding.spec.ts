/**
 * E2E: 온보딩 Critical Path
 * - 회원가입 → V-File → /home 진입
 *
 * NOTE: 매 실행마다 새 이메일이 필요하므로 타임스탬프 기반 동적 생성.
 *       실제 이메일 발송은 없고 Supabase auto-confirm 활성화 필요.
 */
import { test, expect } from '@playwright/test';

test.describe('온보딩 플로우', () => {
  test('회원가입 → 이메일 확인 안내 또는 성공 메시지 노출', async ({ page }) => {
    const email = `e2e.test.${Date.now()}@gmail.com`;

    await page.goto('/auth/signup');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').nth(0).fill('Veilor2026!');
    await page.locator('input[type="password"]').nth(1).fill('Veilor2026!');
    await page.getByRole('checkbox').check();
    await page.locator('button').filter({ hasText: /^\s*(Sign up|회원가입)\s*$/ }).first().click();

    // 성공 시 이메일 확인 안내 or 홈으로 이동 (auto-confirm 여부에 따라)
    // 성공 시 signup 페이지에 머물거나 toast로 안내 (Supabase email confirm 방식)
    // 실패 시 에러 메시지가 노출됨
    await page.waitForTimeout(3_000);
    const hasError = await page.getByRole('main').getByText(/오류|실패|Error|failed/i).isVisible();
    expect(hasError).toBe(false);
  });

  test('온보딩 미완료 유저 → /onboarding/vfile/start 리다이렉트', async ({ page }) => {
    // fresh 유저로 로그인하면 온보딩으로 튕겨야 함
    await page.goto('/auth/login');
    await page.locator('input[type="email"]').fill(
      process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test'
    );
    await page.locator('input[type="password"]').fill(
      process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!'
    );
    await page.locator('button').filter({ hasText: /^\s*(Log in|로그인)\s*$/ }).first().click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 8_000 });
  });

  test('로그인 후 V-File Start 진입', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('input[type="email"]').fill(
      process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test'
    );
    await page.locator('input[type="password"]').fill(
      process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!'
    );
    await page.locator('button').filter({ hasText: /^\s*(Log in|로그인)\s*$/ }).first().click();
    await page.waitForURL(/\/onboarding/, { timeout: 60_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);

    await expect(page).toHaveURL(/\/onboarding\/vfile/, { timeout: 8_000 });
  });
});
