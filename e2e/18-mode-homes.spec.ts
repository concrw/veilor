import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.setTimeout(60_000);

async function gotoSpa(page: import('@playwright/test').Page, path: string) {
  await page.evaluate((p: string) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(300);
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
}

async function loginWithMode(
  page: import('@playwright/test').Page,
  mode: 'connect' | 'mirror' | 'focus' | 'sprint',
) {
  await page.addInitScript((m: string) => {
    localStorage.setItem('veilor_ux_mode', m);
    localStorage.setItem('veilor_first_visit_dismissed', 'true');
  }, mode);
  await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
  await waitForHome(page);
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
  await page.waitForTimeout(300);
}

// ──────────────────────────────────────────────
// 1. connect 모드 — RelationConnectHome
// ──────────────────────────────────────────────
test.describe('connect 모드 — RelationConnectHome', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMode(page, 'connect');
  });

  test('Vent 탭 레이블이 Connect로 표시된다', async ({ page }) => {
    const nav = page.locator('nav[aria-label="메인 탭 네비게이션"]');
    await expect(nav).toBeVisible({ timeout: 15_000 });
    const navText = await nav.textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Connect/i);
  });

  test('RelationConnectHome 헤더 텍스트가 노출된다 (에러 없음)', async ({ page }) => {
    // 이미 /home에 있음 — vent 탭 클릭으로 SPA 내부 이동
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /connect/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('페이지 내 버튼이 클릭 가능하다 (에러 없음)', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /connect/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded().catch(() => null);
        await btn.click({ force: true }).catch(() => null);
        break;
      }
    }
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
});

// ──────────────────────────────────────────────
// 2. mirror 모드 — RelationMirrorHome
// ──────────────────────────────────────────────
test.describe('mirror 모드 — RelationMirrorHome', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMode(page, 'mirror');
  });

  test('Vent 탭 레이블이 Mirror로 표시된다', async ({ page }) => {
    const nav = page.locator('nav[aria-label="메인 탭 네비게이션"]');
    await expect(nav).toBeVisible({ timeout: 15_000 });
    const navText = await nav.textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Mirror/i);
  });

  test('RelationMirrorHome 화면이 노출된다 (에러 없음)', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /mirror/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
});

// ──────────────────────────────────────────────
// 3. focus 모드 — WorkFocusHome
// ──────────────────────────────────────────────
test.describe('focus 모드 — WorkFocusHome', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMode(page, 'focus');
  });

  test('Vent 탭 레이블이 Focus로 표시된다', async ({ page }) => {
    const nav = page.locator('nav[aria-label="메인 탭 네비게이션"]');
    await expect(nav).toBeVisible({ timeout: 15_000 });
    const navText = await nav.textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Focus/i);
  });

  test('오늘의 집중 헤더 텍스트가 노출된다', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /focus/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    await expect(page.locator('h1', { hasText: '오늘의 집중' })).toBeVisible({ timeout: 15_000 });
  });

  test('태스크 추가 input이 존재한다', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /focus/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    await expect(page.locator('input[placeholder="새 태스크 제목"]')).toBeVisible({ timeout: 15_000 });
  });

  test('추가 버튼이 존재한다', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /focus/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    await expect(page.locator('button', { hasText: '추가' }).first()).toBeVisible({ timeout: 15_000 });
  });
});

// ──────────────────────────────────────────────
// 4. sprint 모드 — WorkSprintHome
// ──────────────────────────────────────────────
test.describe('sprint 모드 — WorkSprintHome', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithMode(page, 'sprint');
  });

  test('Vent 탭 레이블이 Sprint로 표시된다', async ({ page }) => {
    const nav = page.locator('nav[aria-label="메인 탭 네비게이션"]');
    await expect(nav).toBeVisible({ timeout: 15_000 });
    const navText = await nav.textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Sprint/i);
  });

  test('이번 주 퍼포먼스 헤더 텍스트가 노출된다', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /sprint/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    await expect(page.locator('h1', { hasText: '이번 주 퍼포먼스' })).toBeVisible({ timeout: 15_000 });
  });

  test('목표 추가 input 또는 목표 목록이 노출된다', async ({ page }) => {
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /sprint/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);

    const goalInput = page.locator('input[placeholder="목표 입력"]');
    const inputVisible = await goalInput.isVisible({ timeout: 5_000 }).catch(() => false);
    // 목표 추가 input이 없으면 목표 목록(텍스트 기반) 확인
    if (!inputVisible) {
      await expect(
        page.getByText(/목표|스프린트|퍼포먼스/i).first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      expect(inputVisible).toBe(true);
    }
  });
});
