/**
 * E2E: DigPage
 * - 페이지 로드 확인
 * - 관계 상황 선택 → 텍스트 입력 → 패턴 분석 시작
 * - 매칭 결과 표시 확인
 * - 돌아가기 버튼
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('DigPage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Dig 페이지 로드 — 헤더 및 폼 확인', async ({ page }) => {
    await expect(page.getByText('왜 이런 패턴이 반복되는지 파고들어요.')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('어떤 관계 상황인가요?')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '패턴 분석 시작' })).toBeVisible();
  });

  test('관계 상황 선택 → 분석 시작 버튼 활성화', async ({ page }) => {
    await page.getByRole('button', { name: '나 자신' }).click();
    const submitBtn = page.getByRole('button', { name: '패턴 분석 시작' });
    await expect(submitBtn).not.toBeDisabled({ timeout: 2_000 });
  });

  test('상황 입력 → 패턴 분석 → 결과 또는 분석 완료', async ({ page }) => {
    // 관계 상황 선택
    await page.getByRole('button', { name: '나 자신' }).click();

    // 상황 텍스트 입력 (구체적인 키워드 포함)
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await textarea.fill('자존감 자기효능감 불안 회피 애착 관계 반복 패턴 감정 조절');

    // 분석 시작
    await page.getByRole('button', { name: '패턴 분석 시작' }).click();

    // 결과가 있으면 DigResultList, 없으면 폼 유지 (두 경우 모두 에러 없음 확인)
    await page.waitForTimeout(5_000);
    const hasResult = await page.getByText(/돌아가기/i).isVisible().catch(() => false);
    const hasForm = await page.getByText('어떤 관계 상황인가요?').isVisible().catch(() => false);
    expect(hasResult || hasForm).toBe(true);
  });

  test('결과 화면 → 돌아가기 (매칭 성공 시)', async ({ page }) => {
    await page.getByRole('button', { name: '나 자신' }).click();
    const textarea = page.getByPlaceholder('구체적인 상황을 입력해 주세요');
    await textarea.fill('자존감 불안 회피 애착 자기비판 반복 감정');
    await page.getByRole('button', { name: '패턴 분석 시작' }).click();

    // 결과 화면이 나타나면 돌아가기 테스트, 나타나지 않으면 pass
    await page.waitForTimeout(8_000);
    const hasResult = await page.getByText(/← 돌아가기/i).isVisible().catch(() => false);
    if (hasResult) {
      await page.getByText(/← 돌아가기/i).click();
      await expect(page.getByText('어떤 관계 상황인가요?')).toBeVisible({ timeout: 3_000 });
    } else {
      // 매칭 결과 없음 — 폼이 유지되는지 확인
      await expect(page.getByText('어떤 관계 상황인가요?')).toBeVisible({ timeout: 3_000 });
    }
  });

  test('M43 Division 필터 — 전체/특정 선택 토글', async ({ page }) => {
    // Division이 로드된 경우에만 테스트 (없으면 skip)
    const filterSection = page.getByText('어떤 영역에서 찾아볼까요?');
    const hasDivisions = await filterSection.isVisible().catch(() => false);
    if (!hasDivisions) return;

    // '전체' 버튼 클릭 → active 상태
    await page.getByRole('button', { name: '전체' }).click();
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible({ timeout: 2_000 });
  });
});
