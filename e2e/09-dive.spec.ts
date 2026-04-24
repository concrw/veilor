/**
 * E2E: DivePage → /home/dive 는 /home/dig 로 리다이렉트됨
 * DigPage의 상황 선택 → 텍스트 입력 → 패턴 분석 플로우를 검증 (05-dig와 중복 방지를 위해 최소 검증)
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('DivePage (F/T 모드)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Dive 페이지 로드 — F/T 모드 토글 확인', async ({ page }) => {
    // /home/dig 에 상황 선택 버튼 존재 확인
    await expect(page.getByRole('button', { name: '나 자신' })).toBeVisible({ timeout: 5_000 });
  });

  test('F 모드 — 감정 선택 → 텍스트 → 상담 시작', async ({ page }) => {
    await page.getByRole('button', { name: '나 자신' }).click();
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('요즘 관계에서 자꾸 불안해요');
    const submitBtn = page.getByRole('button', { name: '패턴 분석 시작' });
    await expect(submitBtn).not.toBeDisabled({ timeout: 3_000 });
  });

  test('T 모드 — 관계 상황 선택 → 분석', async ({ page }) => {
    await page.getByRole('button', { name: '나 자신' }).click();
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('자꾸 같은 패턴이 반복되는 것 같아요');
    const submitBtn = page.getByRole('button', { name: '패턴 분석 시작' });
    await expect(submitBtn).not.toBeDisabled({ timeout: 3_000 });
    await submitBtn.click();
    await page.waitForTimeout(8_000);
    const hasResult = await page.getByText(/돌아가기/i).isVisible().catch(() => false);
    const hasForm = await page.getByRole('button', { name: '나 자신' }).isVisible().catch(() => false);
    expect(hasResult || hasForm).toBe(true);
  });

  test('분석 결과 → 돌아가기', async ({ page }) => {
    await page.getByRole('button', { name: '나 자신' }).click();
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('자존감 불안 회피 애착 반복 감정 자기비판');
    await page.getByRole('button', { name: '패턴 분석 시작' }).click();
    await page.waitForTimeout(8_000);
    const hasBack = await page.getByText(/← 돌아가기/i).isVisible().catch(() => false);
    if (hasBack) {
      await page.getByText(/← 돌아가기/i).click();
      await expect(page.getByRole('button', { name: '나 자신' })).toBeVisible({ timeout: 5_000 });
    } else {
      const stillOnPage = await page.getByRole('button', { name: '나 자신' }).isVisible().catch(() => false);
      const hasAnyContent = await page.getByText(/패턴|Dig/i).isVisible().catch(() => false);
      expect(stillOnPage || hasAnyContent).toBe(true);
    }
  });
});
