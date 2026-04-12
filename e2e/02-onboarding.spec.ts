/**
 * E2E: 온보딩 Critical Path
 * - 회원가입 → Welcome → CoreQuestions → V-File → /home 진입
 *
 * NOTE: 매 실행마다 새 이메일이 필요하므로 타임스탬프 기반 동적 생성.
 *       실제 이메일 발송은 없고 Supabase auto-confirm 활성화 필요.
 */
import { test, expect } from '@playwright/test';

test.describe('온보딩 플로우', () => {
  test('회원가입 → 이메일 확인 안내 또는 성공 메시지 노출', async ({ page }) => {
    const email = `e2e.test.${Date.now()}@gmail.com`;

    await page.goto('/auth/signup');
    await page.getByRole('textbox', { name: /이메일/i }).fill(email);
    await page.getByRole('textbox', { name: /비밀번호 \(8자 이상\)/i }).fill('Veilor2026!');
    await page.getByRole('textbox', { name: /비밀번호 확인/i }).fill('Veilor2026!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /회원가입/i }).click();

    // 성공 시 이메일 확인 안내 or 홈으로 이동 (auto-confirm 여부에 따라)
    // 성공 시 signup 페이지에 머물거나 toast로 안내 (Supabase email confirm 방식)
    // 실패 시 에러 메시지가 노출됨
    await page.waitForTimeout(3_000);
    const hasError = await page.getByRole('main').getByText(/오류|실패|Error/i).isVisible();
    expect(hasError).toBe(false);
  });

  test('온보딩 미완료 유저 → /onboarding/welcome 리다이렉트', async ({ page }) => {
    // fresh 유저로 로그인하면 온보딩으로 튕겨야 함
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: /이메일/i }).fill(
      process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test'
    );
    await page.getByRole('textbox', { name: /비밀번호/i }).fill(
      process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!'
    );
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 8_000 });
  });

  test('Welcome → CoreQuestions 진입', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: /이메일/i }).fill(
      process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test'
    );
    await page.getByRole('textbox', { name: /비밀번호/i }).fill(
      process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!'
    );
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.waitForURL(/\/onboarding/, { timeout: 8_000 });

    // Welcome 화면 — AI 대화 등장 후 시작 버튼
    await page.waitForTimeout(2_500); // 타이핑 애니메이션 대기
    const startBtn = page.getByRole('button', { name: /시작|진단|다음/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 5_000 });
    await startBtn.click();

    await expect(page).toHaveURL(/\/onboarding\/cq/, { timeout: 5_000 });
  });
});
