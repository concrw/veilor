/**
 * E2E: VentPage
 * - 감정 선택 → AI 대화 → 마무리 → 요약
 * - 나의 레이어 탭 토글
 * - Amber 시트 열기/메시지 전송
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('VentPage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Vent/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 5_000 });
    // 전역 AI 대화 다이얼로그가 열려있으면 닫기 (Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('감정 선택 → AI 대화 시작', async ({ page }) => {
    await page.getByRole('button', { name: '불안해' }).click();
    // 300ms 후 chat 뷰 전환 — 엠버 AI 판단 없이 메시지 등장
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });
  });

  test('메시지 입력 → 전송 → AI 응답', async ({ page }) => {
    await page.getByRole('button', { name: '외로워' }).click();
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });

    // 메시지 입력 후 전송 (ChatView input — placeholder로 특정)
    const input = page.getByPlaceholder(/지금 어떤 마음|지금 기분|지금 어떤 생각|오늘 하루|지금 무슨/i);
    await input.fill('요즘 혼자 있는 시간이 너무 많아요');
    await input.press('Enter');

    // AI 응답 대기 — fallback 포함 다양한 응답 텍스트 (strict mode: .first())
    await expect(page.getByText(/특정 사람|언제부터|외로움|어떤 종류/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test('나의 레이어 탭 → 그룹 토글', async ({ page }) => {
    await page.getByRole('button', { name: /나의 레이어/i }).click();
    // 사회적인 나 그룹 토글
    await page.getByText('사회적인 나').click();
    await expect(page.getByText('직장 / 학교에서의 나')).toBeVisible({ timeout: 3_000 });
  });

  test('커뮤니티 탭 진입', async ({ page }) => {
    await page.getByRole('button', { name: /커뮤니티/i }).click();
    await expect(page.getByText(/사람들 속에서|혼자인 사람들/i).first()).toBeVisible({ timeout: 3_000 });
  });

  test('Amber 시트 열기 → 메시지 전송', async ({ page }) => {
    await page.getByRole('button', { name: /Amber AI 상담 열기/i }).click();
    // AmberSheet 안의 메시지 (dialog 밖 별도 레이어)
    await expect(page.getByText('지금 어떤 감정인지 꺼내놔도 괜찮아요. 여기 있어요.')).toBeVisible({ timeout: 3_000 });

    // AmberSheet 안의 입력 (placeholder: "엠버에게 말해요...")
    const input = page.getByPlaceholder(/엠버에게 말해요/i);
    await input.fill('힘들어요');
    await input.press('Enter');
    // 사용자 메시지 전송 확인
    await expect(page.getByText('힘들어요')).toBeVisible({ timeout: 5_000 });
    // AI 응답 대기 — thinking 인디케이터가 사라진 후 응답 텍스트 등장
    // AmberSheet 내 AI 응답은 vr-fade-in 클래스 박스로 표시됨
    await expect(page.locator('.vr-fade-in').nth(1)).toBeVisible({ timeout: 30_000 });
  });
});
