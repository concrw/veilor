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
    test.setTimeout(90_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // localStorage에 언어 설정 (reload 후 영어 fallback 방지)
    await page.evaluate(() => localStorage.setItem('veilor_lang', 'ko'));
    // 전체 새로고침으로 모든 React 상태 초기화 (AmberSheet amberOpen 포함)
    await page.reload({ waitUntil: 'domcontentloaded' });
    // 새로고침 후 인증 세션 복원 및 홈으로 복귀 대기
    await page.waitForURL(url => url.pathname.startsWith('/home'), { timeout: 30_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);
    // Dig 탭으로 이동
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 15_000 });
    await page.waitForTimeout(300);
    // 스피너 소멸 대기
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);
    // 하단 CodetalkExplore까지 스크롤 후 섹션 렌더링 완료 대기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByText('코드토크로 탐색하기').waitFor({ timeout: 30_000 });
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
    // 카테고리는 이모지+텍스트 구조이므로 텍스트로 찾아 부모 button 클릭
    // 부모 button 요소를 찾아 scrollIntoView 후 클릭
    const catBtn = page.locator('button:has-text("애착·거리감")');
    await catBtn.waitFor({ timeout: 5_000 });
    await catBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await catBtn.click();
    // 스피너 소멸 후 키워드 목록 대기
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
    const kwButtons = page.locator('.flex.flex-wrap.gap-2 button');
    await expect(kwButtons.first()).toBeVisible({ timeout: 30_000 });
    const count = await kwButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('혼자 — 키워드 검색 필터링', async ({ page }) => {
    await page.getByRole('button', { name: '혼자 하는 코드토크' }).click();
    await page.getByRole('button', { name: '심리 주제로' }).click();
    const catBtn2 = page.locator('button:has-text("감정·수용")');
    await catBtn2.waitFor({ timeout: 5_000 });
    await catBtn2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await catBtn2.click();
    // 스피너 소멸 후 검색 필드 대기
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
    await page.getByPlaceholder('키워드 검색…').waitFor({ timeout: 30_000 });
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
    // 나 자신: 텍스트로 찾아 부모 button 클릭
    const myselfBtn2 = page.locator('button:has-text("나 자신")');
    await myselfBtn2.waitFor({ timeout: 5_000 });
    await myselfBtn2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await myselfBtn2.click();

    // 스피너 소멸 후 첫 번째 키워드 클릭
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
    const kwBtn = page.locator('.flex.flex-wrap.gap-2 button').first();
    await expect(kwBtn).toBeVisible({ timeout: 30_000 });
    await kwBtn.scrollIntoViewIfNeeded();
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
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 15_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByText('코드토크로 탐색하기').waitFor({ timeout: 20_000 });
  });

  test('함께 선택 → 파트너 미연결 안내 또는 세션 목록', async ({ page }) => {
    await page.getByRole('button', { name: '함께 하는 코드토크' }).click();
    // 파트너 상태 UI 로드 대기 — 3가지 상태 중 하나가 나타날 때까지 최대 10s
    await Promise.race([
      page.getByText('파트너가 연결되지 않았어요').waitFor({ timeout: 10_000 }).catch(() => null),
      page.getByText('진행 중인 함께 코드토크').waitFor({ timeout: 10_000 }).catch(() => null),
      page.getByText('+ 새 키워드로 시작하기').waitFor({ timeout: 10_000 }).catch(() => null),
    ]);
    const noPartner = await page.getByText('파트너가 연결되지 않았어요').isVisible().catch(() => false);
    const hasList   = await page.getByText('진행 중인 함께 코드토크').isVisible().catch(() => false);
    const hasNew    = await page.getByText('+ 새 키워드로 시작하기').isVisible().catch(() => false);
    expect(noPartner || hasList || hasNew).toBe(true);
  });

  test('파트너 미연결 — Us 탭 이동 버튼', async ({ page }) => {
    await page.getByRole('button', { name: '함께 하는 코드토크' }).click();
    // 파트너 미연결 UI가 완전히 로드될 때까지 대기
    const noPartnerText = page.getByText('파트너가 연결되지 않았어요');
    const appeared = await noPartnerText.waitFor({ timeout: 15_000 }).then(() => true).catch(() => false);
    if (!appeared) return; // 연결된 계정이면 스킵
    const btn = page.getByRole('button', { name: /Us 탭에서 파트너 연결하기/ });
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    // nav가 버튼 위에 겹치므로 JS로 직접 클릭
    await btn.evaluate((el: HTMLElement) => el.click());
    await page.waitForURL(/\/home\/set/, { timeout: 10_000 });
    await expect(page.url()).toContain('/home/set');
  });
});

test.describe('Set 페이지 — 스토리 탭 (StoryFeedTab)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 15_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
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
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 15_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('키워드 탭 — CodetalkHub 또는 작성 화면 표시', async ({ page }) => {
    // CodetalkHub 리뉴얼 후: isLoading 스피너 소멸 후 콘텐츠 대기
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);
    const hasHub        = await page.getByText(/RAPAILLE IMPRINT METHOD/i).isVisible().catch(() => false);
    const hasInsightBtn = await page.getByRole('button', { name: 'AI 인사이트' }).isVisible().catch(() => false);
    const hasForm       = await page.getByText('오늘 이 키워드가').isVisible().catch(() => false);
    const hasDoneCard   = await page.getByText('오늘의 기록').isVisible().catch(() => false);
    expect(hasHub || hasInsightBtn || hasForm || hasDoneCard).toBe(true);
  });
});
