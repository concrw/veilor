/**
 * E2E: 관리자 대시보드 — 가상유저 활동 주입 탭
 * - /admin 접근 → 관리자 로그인 후 진입
 * - "가상유저 활동" 탭 클릭 → 탭 렌더링 확인
 * - 주입 버튼 클릭 → Edge Function 호출 → 결과 카드 노출
 *
 * NOTE: page.goto('/admin')은 AuthContext INITIAL_SESSION이 재발화되지 않아
 * loading=true 무한 스피너 현상 발생. pushState + popstate 방식으로 이동해야 함.
 */
import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'concrecrw@gmail.com';
const ADMIN_PW    = process.env.E2E_ADMIN_PW    ?? '';

async function navigateToAdmin(page: import('@playwright/test').Page) {
  await page.evaluate(() => window.history.pushState({}, '', '/admin'));
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state })));
}

test.describe('관리자 대시보드 — 가상유저 활동 주입', () => {
  test.skip(!ADMIN_PW, 'E2E_ADMIN_PW 환경변수가 없으면 건너뜁니다');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForSelector('input[type="email"]', { timeout: 15_000 });
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PW);
    await page.locator('button', { hasText: '로그인' }).first().click();
    await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 40_000 });
  });

  test('/admin 진입 → B2C·가상유저 탭 렌더링', async ({ page }) => {
    await navigateToAdmin(page);
    await expect(page.getByRole('button', { name: 'B2C 유저 분석' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: '가상유저 활동' })).toBeVisible({ timeout: 5_000 });
  });

  test('가상유저 활동 탭 클릭 → 주입 UI 렌더링', async ({ page }) => {
    await navigateToAdmin(page);
    await expect(page.getByRole('button', { name: '가상유저 활동' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: '가상유저 활동' }).click();
    await expect(page.getByRole('heading', { name: '가상유저 활동 주입' })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /가상유저 활동 주입/ })).toBeVisible({ timeout: 5_000 });
  });

  test('주입 버튼 클릭 → Edge Function 호출 → 결과 표시', async ({ page }) => {
    await navigateToAdmin(page);
    await expect(page.getByRole('button', { name: '가상유저 활동' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: '가상유저 활동' }).click();
    await expect(page.getByRole('heading', { name: '가상유저 활동 주입' })).toBeVisible({ timeout: 8_000 });

    const injectBtn = page.getByRole('button', { name: /가상유저 활동 주입/ });
    await injectBtn.click();

    await expect(page.getByText('주입 중...')).toBeVisible({ timeout: 5_000 });
    // 성공: "주입 완료" 텍스트(green-400), 실패: "오류:" 텍스트(red-400)
    await expect(page.getByText(/^주입 완료$|^오류:/).first()).toBeVisible({ timeout: 30_000 });
  });
});
