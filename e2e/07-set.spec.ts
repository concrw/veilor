/**
 * E2E: SetPage
 * - 페이지 로드, 탭 확인 (키워드/경계/도구/실천/스토리)
 * - Codetalk 키워드 텍스트 입력 → 저장
 * - 경계 설정 입력 → 저장
 * - Feed 탭 진입
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('SetPage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('Set 페이지 로드 — 헤더 및 탭 확인', async ({ page }) => {
    await expect(page.getByText('오늘의 언어로 나를 재설정해요.')).toBeVisible({ timeout: 5_000 });
    // 탭바: 7개 탭 (키워드·경계 설정·만트라·Us·도구·실천·스토리)
    // 모바일 375px에서 overflow-hidden — 각 탭 존재 여부를 DOM으로 확인
    const tabButtons = page.locator('.bg-card.border.rounded-2xl button');
    const count = await tabButtons.count();
    expect(count).toBe(7);
    // 첫 탭(키워드)과 마지막 탭(스토리) DOM 존재 확인
    await expect(tabButtons.first()).toContainText('키워드');
    await expect(tabButtons.last()).toContainText('스토리');
  });

  test('Codetalk — 3-mode 허브 카드 렌더 확인', async ({ page }) => {
    // CodetalkHub 리뉴얼 후: ① DAILY ② DEEP DIVE ③ WITH 카드 3개
    await expect(page.getByText(/RAPAILLE IMPRINT METHOD/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/그날의 코드토크|Daily Codetalk/i)).toBeVisible();
    // strict mode 위반 방지 — first() 사용
    await expect(page.getByText(/카테고리별|By Category/i).first()).toBeVisible();
    await expect(page.getByText(/관계별|By Relation/i).first()).toBeVisible();
  });

  test('Codetalk — DAILY 카드 클릭 → 작성 화면 진입', async ({ page }) => {
    // DAILY 카드 (첫 번째 버튼) 클릭
    await expect(page.getByText(/그날의 코드토크|Daily Codetalk/i)).toBeVisible({ timeout: 5_000 });
    await page.getByText(/그날의 코드토크|Daily Codetalk/i).click();
    await page.waitForTimeout(1_000);
    // 에러 없이 작성 모드 진입 확인
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('경계 탭 → 감정적 경계 입력 → 저장', async ({ page }) => {
    await page.getByRole('button', { name: '경계' }).click();
    await page.waitForTimeout(500);

    const placeholder = '예: 감정적으로 압도당할 때 혼자만의 시간이 필요해요';
    const textarea = page.getByPlaceholder(placeholder);
    await expect(textarea).toBeVisible({ timeout: 3_000 });

    await textarea.fill('감정이 힘들 때 혼자만의 공간이 필요해요.');
    // 경계 저장 버튼 (같은 row에 있는 첫 번째 저장)
    const saveButtons = page.getByRole('button', { name: '저장' });
    await saveButtons.first().click();
    await page.waitForTimeout(1_500);

    const hasError = await page.getByText(/저장 실패|오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('도구 탭 진입 — 에러 없음', async ({ page }) => {
    await page.getByRole('button', { name: '도구' }).click();
    await page.waitForTimeout(1_000);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('스토리 탭 진입 — Feed 로드', async ({ page }) => {
    await page.getByRole('button', { name: '스토리' }).click();
    await page.waitForTimeout(1_500);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
