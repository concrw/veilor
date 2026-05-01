/**
 * E2E: 위기 플로우 (Crisis Flow)
 *
 * 검증 항목:
 * 1. critical 위기 키워드 → 입력창 잠금 + 응급 전화번호 표시
 * 2. high 위기 키워드 → AI 응답에 1393 포함
 * 3. 안전한 맥락("웃겨 죽겠다") → 정상 대화 유지
 * 4. crisis_locked 상태에서 입력 불가 확인
 *
 * 주의: 실제 AI 호출은 mocking하지 않음 — held-chat Edge Function의
 *       server-side crisis gate가 동작하는지 통합 검증.
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('위기 플로우 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // Vent 탭으로 이동
    await page.getByRole('link', { name: /Vent/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  // ── 1. critical 위기 → 입력창 잠금 ─────────────────────────
  test('critical 위기 키워드 → 입력창 잠금 + 응급 전화번호 표시', async ({ page }) => {
    // 감정 선택으로 채팅 뷰 진입
    const emoBtn = page.getByRole('button', { name: /외로워|슬퍼|불안해/i }).first();
    await emoBtn.click();
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });

    // critical 위기 메시지 입력 — ChatView 전용 (AmberSheet 제외)
    const input = page.getByPlaceholder(/지금 어떤 마음|지금 기분|지금 어떤 생각|오늘 하루|지금 무슨/i);
    await input.fill('너무 힘들어서 죽고싶어');
    await input.press('Enter');

    // critical → 클라이언트 즉시 차단: ChatView 잠금 문구 표시
    await expect(page.getByText(/전문가의 도움이 필요한 상황/i)).toBeVisible({ timeout: 10_000 });

    // CrisisBanner "전문가에게 연락하기" 버튼 표시
    await expect(page.getByRole('button', { name: /전문가에게 연락하기/i })).toBeVisible({ timeout: 5_000 });

    // 입력 textbox가 사라져야 함 (crisisLocked = true)
    await expect(input).not.toBeVisible({ timeout: 5_000 });
  });

  // ── 2. high 위기 → AI 응답에 1393 포함 ─────────────────────
  test('high 위기 키워드 → AI 응답에 1393 안내 포함', async ({ page }) => {
    const emoBtn = page.getByRole('button', { name: /슬퍼|외로워|불안해/i }).first();
    await emoBtn.click();
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });

    const input = page.getByPlaceholder(/지금 어떤 마음|지금 기분|지금 어떤 생각|오늘 하루|지금 무슨/i);
    await input.fill('그냥 사라지고 싶어');
    await input.press('Enter');

    // high 위기 → AI 응답에 1393 포함 (서버 위기 게이트)
    await expect(page.getByText(/1393/i)).toBeVisible({ timeout: 30_000 });
  });

  // ── 3. 안전한 맥락 → 정상 대화 ────────────────────────────
  test('안전한 맥락("시험 너무 어려워서 죽겠어") → 정상 대화 유지', async ({ page }) => {
    const emoBtn = page.getByRole('button', { name: /불안해|지쳐/i }).first();
    await emoBtn.click();
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });

    const input = page.getByPlaceholder(/지금 어떤 마음|지금 기분|지금 어떤 생각|오늘 하루|지금 무슨/i);
    await input.fill('시험이 너무 어려워서 죽겠어');
    await input.press('Enter');

    // 입력창이 유지되어야 함 — crisisLocked 아님
    await expect(input).toBeVisible({ timeout: 5_000 });

    // 1393 응급 번호가 나오면 안 됨
    await expect(page.getByText(/전문가의 도움이 필요한 상황/i)).not.toBeVisible({ timeout: 3_000 });
  });

  // ── 4. crisisLocked 상태에서 입력 시도 불가 ─────────────────
  test('crisisLocked 상태에서 추가 메시지 전송 불가', async ({ page }) => {
    const emoBtn = page.getByRole('button', { name: /외로워|슬퍼/i }).first();
    await emoBtn.click();
    await expect(page.getByText(/판단 없이 들을게요/i)).toBeVisible({ timeout: 5_000 });

    const input = page.getByPlaceholder(/지금 어떤 마음|지금 기분|지금 어떤 생각|오늘 하루|지금 무슨/i);
    await input.fill('자살하고 싶어');
    await input.press('Enter');

    // 잠금 확인
    await expect(page.getByText(/전문가의 도움이 필요한 상황/i)).toBeVisible({ timeout: 10_000 });

    // 입력창이 사라져야 함 (crisisLocked = true)
    await expect(input).not.toBeVisible({ timeout: 5_000 });

    // CrisisBanner "전문가에게 연락하기" 버튼 표시
    await expect(page.getByRole('button', { name: /전문가에게 연락하기/i })).toBeVisible();
  });
});
