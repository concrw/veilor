/**
 * E2E: MePage
 * - 페이지 로드 (헤더, 탭)
 * - 나의 성장 탭 — 레이더 차트, 씨드 카드
 * - Zone 탭 — 토글 확인
 * - 설정 시트 열기
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('MePage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Me/i }).click();
    await page.waitForURL(/\/home\/me/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Me 페이지 로드 — 헤더 및 탭 확인', async ({ page }) => {
    await expect(page.getByText('나를 알아가고 있어요')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: '나의 성장' })).toBeVisible();
    await expect(page.getByRole('button', { name: '내 사람들' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zone' })).toBeVisible();
  });

  test('설정 열기 버튼 → 설정 시트 슬라이드업', async ({ page }) => {
    await page.getByRole('button', { name: '설정 열기' }).click();
    // SettingsSheet 애니메이션 대기
    await page.waitForTimeout(400);
    // 시트 내 로그아웃 버튼 존재 확인
    const logoutEl = page.getByText('로그아웃').last();
    await expect(logoutEl).toBeVisible({ timeout: 3_000 });
  });

  test('나의 성장 탭 — 콘텐츠 로드 확인', async ({ page }) => {
    // 기본 탭이 '나의 성장'
    await page.waitForTimeout(1_000);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
    // 씨드 카드 또는 레이더 차트 텍스트 존재
    await expect(
      page.getByText(/씨앗|패턴|뿌리|꽃|나의 정밀도|성장/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('Zone 탭 → 토글 클릭', async ({ page }) => {
    await page.getByRole('button', { name: 'Zone' }).click();
    await page.waitForTimeout(500);

    // 적어도 하나의 Zone 레이어 그룹 텍스트 확인
    await expect(
      page.getByText(/사회적인 나|일반적인 나|비밀스러운 나/i).first()
    ).toBeVisible({ timeout: 3_000 });

    // toggle 클릭 (첫 번째 visible 체크박스 / 스위치 요소)
    const toggles = page.getByRole('checkbox');
    const count = await toggles.count();
    if (count > 0) {
      await toggles.first().click();
      await page.waitForTimeout(500);
    }

    // 에러 없음
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('내 사람들 탭 진입 — 에러 없음', async ({ page }) => {
    await page.getByRole('button', { name: '내 사람들' }).click();
    await page.waitForTimeout(1_000);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Amber AI 버튼 → AISheet 열림', async ({ page }) => {
    await page.getByRole('button', { name: 'Amber AI 상담 열기' }).click();
    await page.waitForTimeout(400);
    // AISheet 내 입력 또는 AI 텍스트 확인
    await expect(
      page.getByText(/엠버|Amber|여기 있어요|어떤 감정/i).first()
    ).toBeVisible({ timeout: 3_000 });
  });
});
