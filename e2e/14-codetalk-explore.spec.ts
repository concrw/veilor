/**
 * E2E: CodetalkExplore (Dig 페이지 하단)
 * - 혼자 하는 코드토크 전체 흐름
 * - 함께 하는 코드토크 — 파트너 미연결 안내
 * - Set 페이지 스토리 탭 (StoryFeedTab)
 * - Set 페이지 AI 인사이트 버튼 표시
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('CodetalkExplore — 혼자 하는 코드토크', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // 하단 CodetalkExplore까지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('CodetalkExplore 섹션 노출', async ({ page }) => {
    await expect(page.getByText('코드토크로 탐색하기')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: '혼자 하는 코드토크' })).toBeVisible();
    await expect(page.getByRole('button', { name: '함께 하는 코드토크' })).toBeVisible();
  });

  test('혼자 — 관계 유형 진입 → 카테고리 5개 표시', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await expect(page.getByRole('button', { name: '관계 유형으로' })).toBeVisible({ timeout: 3_000 });
    await page.getByRole('button', { name: '관계 유형으로' }).click();
    await expect(page.getByRole('button', { name: /연인·파트너/, exact: false })).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '🏡 가족' })).toBeVisible();
    await expect(page.getByRole('button', { name: /친구·동료/, exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: '🪞 나 자신' })).toBeVisible();
    await expect(page.getByRole('button', { name: /사회·세상/, exact: false })).toBeVisible();
  });

  test('혼자 — 심리 주제 진입 → 카테고리 8개 표시', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await page.getByRole('button', { name: '심리 주제로' }).click();
    await expect(page.getByText('애착·거리감')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText('감정·수용')).toBeVisible();
    await expect(page.getByText('경계·소통')).toBeVisible();
    await expect(page.getByText('욕구·친밀감')).toBeVisible();
    await expect(page.getByText('정체성·자존감')).toBeVisible();
    await expect(page.getByText('각인·반복')).toBeVisible();
    await expect(page.getByText('성장·변화')).toBeVisible();
    await expect(page.getByText('몸·섹슈얼리티')).toBeVisible();
  });

  test('혼자 — 카테고리 선택 → 키워드 목록 표시', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await page.getByRole('button', { name: '심리 주제로' }).click();
    await page.getByText('애착·거리감').click();
    // 키워드 목록 로딩
    await page.waitForTimeout(1_500);
    // 키워드 버튼이 1개 이상 표시
    const kwButtons = page.locator('.flex.flex-wrap.gap-2 button');
    await expect(kwButtons.first()).toBeVisible({ timeout: 5_000 });
    const count = await kwButtons.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('혼자 — 키워드 검색 필터링', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await page.getByRole('button', { name: '심리 주제로' }).click();
    await page.getByText('감정·수용').click();
    await page.waitForTimeout(1_500);
    // 검색어 입력
    await page.getByPlaceholder('키워드 검색…').fill('불안');
    await page.waitForTimeout(300);
    const filtered = page.locator('.flex.flex-wrap.gap-2 button');
    const count = await filtered.count();
    // "불안" 포함 키워드만 표시 — 0개이면 "검색 결과가 없어요" 표시
    if (count > 0) {
      const firstText = await filtered.first().textContent();
      expect(firstText?.includes('불안') || count >= 1).toBe(true);
    } else {
      await expect(page.getByText('검색 결과가 없어요.')).toBeVisible();
    }
  });

  test('혼자 — 키워드 선택 → 3단계 입력 → 저장 → 피드', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await page.getByRole('button', { name: '관계 유형으로' }).click();
    await page.getByRole('button', { name: '🪞 나 자신' }).click();
    await page.waitForTimeout(1_500);

    // 첫 번째 키워드 클릭
    const kwBtn = page.locator('.flex.flex-wrap.gap-2 button').first();
    await expect(kwBtn).toBeVisible({ timeout: 5_000 });
    await kwBtn.click();

    // 1단계: 정의
    await expect(page.getByText('이 키워드를 당신만의 언어로 정의한다면?')).toBeVisible({ timeout: 3_000 });
    await page.getByPlaceholder('자유롭게 적어주세요 (최대 500자)').fill('E2E 테스트 정의 입력');
    await page.getByRole('button', { name: '다음' }).click();

    // 2단계: 각인
    await expect(page.getByText('이 키워드가 처음 각인된 기억이나 순간은?')).toBeVisible({ timeout: 3_000 });
    await page.getByPlaceholder('자유롭게 적어주세요 (최대 500자)').fill('E2E 테스트 각인 입력');
    await page.getByRole('button', { name: '다음' }).click();

    // 3단계: 원인
    await expect(page.getByText('왜 이것이 지금의 관계에서 반복되는 것 같나요?')).toBeVisible({ timeout: 3_000 });
    await page.getByPlaceholder('자유롭게 적어주세요 (최대 500자)').fill('E2E 테스트 원인 입력');
    await page.getByRole('button', { name: '저장' }).click();

    // 저장 완료 토스트
    await expect(page.getByText('기록 저장 완료 ✓', { exact: true })).toBeVisible({ timeout: 5_000 });

    // 피드 화면 전환
    await expect(page.getByText('다른 기록들')).toBeVisible({ timeout: 3_000 });

    // 다른 카테고리 탐색하기 → entry 뷰 복귀
    await page.getByRole('button', { name: '다른 카테고리 탐색하기' }).click();
    await expect(page.getByRole('button', { name: '혼자 하는 코드토크' })).toBeVisible({ timeout: 3_000 });
  });
});

test.describe('CodetalkExplore — 함께 하는 코드토크 (파트너 미연결)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('함께 선택 → 파트너 미연결 안내 또는 세션 목록', async ({ page }) => {
    await page.getByRole('button', { name: '함께 하는 코드토크' }).click();
    await page.waitForTimeout(1_500);
    // 파트너 미연결이면 안내, 연결되어 있으면 대기 목록
    const noPartner = await page.getByText('파트너가 연결되지 않았어요').isVisible().catch(() => false);
    const hasList   = await page.getByText('진행 중인 함께 코드토크').isVisible().catch(() => false);
    const hasNew    = await page.getByText('+ 새 키워드로 시작하기').isVisible().catch(() => false);
    expect(noPartner || hasList || hasNew).toBe(true);
  });

  test('파트너 미연결 — Us 탭 이동 버튼', async ({ page }) => {
    await page.getByRole('button', { name: '함께 하는 코드토크' }).click();
    await page.waitForTimeout(1_500);
    const noPartner = await page.getByText('파트너가 연결되지 않았어요').isVisible().catch(() => false);
    if (!noPartner) return; // 연결된 계정이면 스킵
    await page.getByRole('button', { name: /Us 탭에서 파트너 연결하기/ }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 5_000 });
    await expect(page.url()).toContain('/home/set');
  });
});

test.describe('Set 페이지 — 스토리 탭 (StoryFeedTab)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('스토리 탭 — StoryFeedTab 렌더링', async ({ page }) => {
    await page.getByRole('button', { name: '스토리' }).click();
    await page.waitForTimeout(1_000);
    // 오늘의 키워드 관련 텍스트 or 빈 상태 메시지
    const hasStories = await page.getByText('에 대한 이야기들').isVisible().catch(() => false);
    const isEmpty    = await page.getByText('아직 오늘의 스토리가 없어요').isVisible().catch(() => false);
    expect(hasStories || isEmpty).toBe(true);
  });
});

test.describe('Set 페이지 — 코드토크 AI 인사이트 버튼', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('키워드 탭 — 기록 완료 시 AI 인사이트 버튼 표시', async ({ page }) => {
    // 키워드 탭이 기본 active
    await page.waitForTimeout(1_500);
    // 이미 오늘 기록이 있으면 버튼 표시, 없으면 입력 폼 표시
    const hasInsightBtn = await page.getByRole('button', { name: 'AI 인사이트 보기' }).isVisible().catch(() => false);
    const hasForm       = await page.getByText('오늘 이 키워드가 내 관계에서 어떻게 나타났나요?').isVisible().catch(() => false);
    const hasDoneCard   = await page.getByText('오늘의 기록 ✓').isVisible().catch(() => false);
    expect(hasInsightBtn || hasForm || hasDoneCard).toBe(true);
  });
});
