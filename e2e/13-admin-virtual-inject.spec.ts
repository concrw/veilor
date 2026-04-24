/**
 * E2E: 관리자 대시보드 — 가상유저 활동 주입 탭
 * - /admin 접근 → 관리자 로그인 후 진입
 * - "가상유저 활동" 탭 클릭 → 탭 렌더링 확인
 * - 주입 버튼 클릭 → Edge Function 호출 → 결과 카드 노출
 */
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'elizabethcho1012@gmail.com';
const ADMIN_PW    = process.env.E2E_ADMIN_PW    ?? '';

test.describe('관리자 대시보드 — 가상유저 활동 주입', () => {
  test.skip(!ADMIN_PW, 'E2E_ADMIN_PW 환경변수가 없으면 건너뜁니다');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10_000 });
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PW);
    await page.locator('button', { hasText: '로그인' }).first().click();
    await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 30_000 });
  });

  test('/admin 진입 → B2C 탭 기본 렌더링', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'B2C 유저 분석' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: '가상유저 활동' })).toBeVisible({ timeout: 10_000 });
  });

  test('가상유저 활동 탭 클릭 → 주입 UI 렌더링', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '가상유저 활동' }).click();

    await expect(page.getByText('가상유저 활동 주입')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/가상유저 활동 주입.*커뮤니티/)).toBeVisible({ timeout: 8_000 });
  });

  test('주입 버튼 클릭 → Edge Function 호출 → 결과 표시', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '가상유저 활동' }).click();
    await expect(page.getByText('가상유저 활동 주입')).toBeVisible({ timeout: 8_000 });

    // Edge Function 응답 대기 (최대 30초)
    const injectBtn = page.getByRole('button', { name: /가상유저 활동 주입/ });
    await expect(injectBtn).toBeVisible({ timeout: 5_000 });
    await injectBtn.click();

    // 주입 중 상태 확인
    await expect(page.getByText('주입 중...')).toBeVisible({ timeout: 5_000 });

    // 결과 카드 노출 대기
    await expect(
      page.getByText(/커뮤니티|코드탁|완료|inserted/i)
    ).toBeVisible({ timeout: 30_000 });
  });
});
