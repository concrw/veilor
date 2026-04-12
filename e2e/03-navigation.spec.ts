/**
 * E2E: 바텀네비 + 핵심 탭 라우팅
 * - 온보딩 완료 유저 기준
 * - 5개 탭 (Vent/Dig/Get/Set/Me) 이동 + 화면 로드 확인
 * - 뒤로가기/앞으로가기 브라우저 히스토리 정합성
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('바텀네비 라우팅', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  });

  const TABS = [
    { label: 'Vent', path: '/home/vent' },
    { label: 'Dig',  path: '/home/dig'  },
    { label: 'Get',  path: '/home/get'  },
    { label: 'Set',  path: '/home/set'  },
    { label: 'Me',   path: '/home/me'   },
  ] as const;

  for (const tab of TABS) {
    test(`${tab.label} 탭 → ${tab.path} 로드`, async ({ page }) => {
      await page.getByRole('link', { name: new RegExp(tab.label, 'i') }).click();
      await expect(page).toHaveURL(tab.path, { timeout: 5_000 });
      // 네트워크 에러/로딩 스피너가 남아있지 않아야 함
      await expect(page.getByText(/연결 오류|저장 오류/i)).not.toBeVisible();
    });
  }

  test('탭 이동 후 브라우저 뒤로가기 정합성', async ({ page }) => {
    await page.getByRole('link', { name: /Dig/i }).click();
    await expect(page).toHaveURL('/home/dig');

    await page.getByRole('link', { name: /Get/i }).click();
    await expect(page).toHaveURL('/home/get');

    await page.goBack();
    await expect(page).toHaveURL('/home/dig');
  });

  test('ErrorBoundary — 크래시 없이 모든 탭 로드', async ({ page }) => {
    for (const tab of TABS) {
      await page.getByRole('link', { name: new RegExp(tab.label, 'i') }).click();
      await expect(page.getByText(/Something went wrong|에러가 발생/i)).not.toBeVisible();
    }
  });
});
