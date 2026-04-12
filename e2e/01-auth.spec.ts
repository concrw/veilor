/**
 * E2E: 인증 플로우
 * - 이메일/비밀번호 로그인 성공 → /home 진입
 * - 잘못된 비밀번호 → 에러 메시지 노출
 * - 로그아웃 → /auth/login 복귀
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('인증 플로우', () => {
  test('로그인 성공 → /home 진입', async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await expect(page).toHaveURL(/\/home/);
  });

  test('잘못된 비밀번호 → 에러 메시지 노출', async ({ page }) => {
    await login(page, TEST_USERS.done.email, 'wrongpassword!');
    await expect(
      page.getByRole('main').getByText(/Invalid login credentials|로그인에 실패|비밀번호/i)
    ).toBeVisible({ timeout: 5_000 });
    await expect(page).not.toHaveURL(/\/home/);
  });

  test('인증 없이 /home 접근 → /auth/login 리다이렉트', async ({ page }) => {
    await page.goto('/home/vent');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('로그아웃 → /auth/login 복귀', async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);

    // Me 탭 → 설정 열기(Sheet 슬라이드업) → 로그아웃 클릭
    await page.getByRole('link', { name: /Me/i }).click();
    await page.getByRole('button', { name: /설정 열기/i }).click();
    // Sheet 애니메이션 완료 대기 후 로그아웃 클릭
    const logoutEl = page.getByText('로그아웃').last();
    await logoutEl.waitFor({ state: 'visible', timeout: 5_000 });
    await logoutEl.click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8_000 });
  });
});
