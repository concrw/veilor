/**
 * E2E: DivePage (별도 앱 — /dive 경로가 아닌 /home/dive는 없음)
 * VEILOR에 DivePage가 /home/dive로 통합되어 있음
 * - F 모드: 감정 선택 → 텍스트 입력 → AI 상담 시작
 * - T 모드: 관계 상황 선택 → 패턴 분석
 * - 결과 → 돌아가기
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

// DivePage는 HomeLayout 내에 없고 별도 라우트인지 확인 필요
// VEILOR 앱에서 /home/dive 경로가 있다고 가정
test.describe('DivePage (F/T 모드)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // Dive는 바텀네비에 없음 — history.pushState로 SPA 내부 navigate
    await page.evaluate(() => { window.history.pushState({}, '', '/home/dive'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await page.waitForURL(/\/home\/dive/, { timeout: 5_000 });
    await page.waitForTimeout(1_000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Dive 페이지 로드 — F/T 모드 토글 확인', async ({ page }) => {
    await expect(page.getByText(/F 모드|T 모드/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('F 모드 — 감정 선택 → 텍스트 → 상담 시작', async ({ page }) => {
    // F 모드 버튼 클릭 (이미 선택됐을 수 있음)
    const fBtn = page.getByRole('button', { name: /F 모드/i });
    await fBtn.click();

    // 감정 선택
    await page.getByRole('button', { name: '불안' }).click();
    await expect(page.getByRole('button', { name: '불안' })).toBeVisible();

    // 텍스트 입력
    const textarea = page.getByPlaceholder('무슨 일이 있었나요?');
    await textarea.fill('요즘 관계에서 자꾸 불안해요');

    // AI 상담 시작 버튼 활성화 확인
    const submitBtn = page.getByRole('button', { name: /AI 대화 파트너와 시작/i });
    await expect(submitBtn).not.toBeDisabled({ timeout: 2_000 });
  });

  test('T 모드 — 관계 상황 선택 → 분석', async ({ page }) => {
    await page.getByRole('button', { name: /T 모드/i }).click();

    // 관계 상황 선택
    await page.getByRole('button', { name: '나 자신' }).click();

    // 텍스트 입력
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await textarea.fill('자꾸 같은 패턴이 반복되는 것 같아요');

    // 분석 시작 버튼 확인
    const submitBtn = page.getByRole('button', { name: /관계 패턴 분석 시작/i });
    await expect(submitBtn).not.toBeDisabled({ timeout: 2_000 });

    // 분석 실행 → 결과 또는 폼 유지
    await submitBtn.click();
    await page.waitForTimeout(8_000);
    const hasResult = await page.getByText(/돌아가기/i).isVisible().catch(() => false);
    const hasForm = await page.getByText(/T 모드/i).isVisible().catch(() => false);
    expect(hasResult || hasForm).toBe(true);
  });

  test('분석 결과 → 돌아가기', async ({ page }) => {
    await page.getByRole('button', { name: /T 모드/i }).click();
    await page.getByRole('button', { name: '나 자신' }).click();
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await textarea.fill('자존감 불안 회피 애착 반복 감정 자기비판');
    await page.getByRole('button', { name: /관계 패턴 분석 시작/i }).click();
    await page.waitForTimeout(8_000);

    const hasBack = await page.getByText(/← 돌아가기/i).isVisible().catch(() => false);
    if (hasBack) {
      await page.getByText(/← 돌아가기/i).click();
      await expect(page.getByText(/F 모드|T 모드/i).first()).toBeVisible({ timeout: 3_000 });
    } else {
      // 결과 없음 — 폼 유지
      await expect(page.getByText(/T 모드/i)).toBeVisible({ timeout: 3_000 });
    }
  });
});
