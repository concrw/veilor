/**
 * E2E: Set/Me 미커버 탭 + Admin 탭
 * - SetPage: 만트라·Us·실천 탭
 * - MePage: FrostBtn → Frost AI 시트, Impact 탭 (social 도메인 전용)
 * - AdminDashboard: B2C 유저 분석 탭, B2B 조직·코치 탭
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'e2e.test.1777802660865@gmail.com';
const ADMIN_PW    = process.env.E2E_ADMIN_PW    ?? 'E2eAdmin2026!';

// ──────────────────────────────────────────────
// 1. SetPage 미커버 탭
// ──────────────────────────────────────────────
test.describe('SetPage — 미커버 탭', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Set/i }).click();
    await page.waitForURL(/\/home\/set/, { timeout: 10_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('만트라 탭 — MantraCorner 렌더링', async ({ page }) => {
    const mantraBtn = page.getByRole('button', { name: '만트라' });
    if (!(await mantraBtn.isVisible())) return;

    await mantraBtn.click();
    await page.waitForTimeout(1_000);

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // 만트라 텍스트 또는 도메인 레이블 존재 확인
    await expect(
      page.getByText(/내 페이스|오늘 한 걸음|깊게|듣는 게|관심은|자아|일|관계|사회|Mantra/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Us 탭 — 파트너 연결 안내 또는 관계 분석 화면 노출', async ({ page }) => {
    const usBtn = page.getByRole('button', { name: 'Us', exact: true }).first();
    if (!(await usBtn.isVisible())) return;

    await usBtn.click();
    await page.waitForTimeout(1_000);

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // 파트너 연결 안내 또는 관계 콘텐츠 존재 — PartnerInvite heading (ko.ts:10)
    await expect(
      page.getByText('파트너와 함께해요').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('실천 탭 — 에러 없음 + 콘텐츠 노출', async ({ page }) => {
    const practiceBtn = page.getByRole('button', { name: '실천' });
    if (!(await practiceBtn.isVisible())) return;

    await practiceBtn.click();
    await page.waitForTimeout(1_000);

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // RelationshipSimulation.tsx:10 title='관계 시뮬레이션'
    // RelationshipCoaching.tsx:11 label='12주 코칭'
    await expect(
      page.getByText(/관계 시뮬레이션|12주 코칭|대화법|관계 정리/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────
// 2. MePage 미커버 기능
// ──────────────────────────────────────────────
test.describe('MePage — 미커버 기능', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Me/i }).click();
    await page.waitForURL(/\/home\/me/, { timeout: 10_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('FrostBtn 클릭 → Frost AI 시트/오버레이 열림', async ({ page }) => {
    const frostBtn = page.getByRole('button', { name: 'Frost AI 분석 열기' });
    if (!(await frostBtn.isVisible())) return;

    await frostBtn.click();
    await page.waitForTimeout(600);

    // 시트 또는 오버레이 내 Frost AI 관련 콘텐츠 확인
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    await expect(
      page.getByText(/Frost|패턴|분석|인사이트|frost/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Impact 탭 — social 도메인 전용, 없으면 skip', async ({ page }) => {
    const impactBtn = page.getByRole('button', { name: /임팩트|Impact/i });
    if (!(await impactBtn.isVisible())) return;

    await impactBtn.click();
    await page.waitForTimeout(1_000);

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});

// ──────────────────────────────────────────────
// 3. Admin 탭
// ──────────────────────────────────────────────
test.describe('AdminDashboard — B2C·B2B 탭', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PW);
    await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 40_000 });
    // pushState 방식으로 /admin 이동 (page.goto 시 loading 무한 현상 방지)
    await page.evaluate(() => {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
    await page.waitForTimeout(500);
  });

  test('B2C 유저 분석 탭 클릭 → 분포 차트 또는 데이터 섹션 노출', async ({ page }) => {
    const b2cBtn = page.getByRole('button', { name: 'B2C 유저 분석' });
    await expect(b2cBtn).toBeVisible({ timeout: 15_000 });

    await b2cBtn.click();
    await page.waitForTimeout(1_500);

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // 차트, 통계 수치, 또는 섹션 헤딩 존재 확인
    await expect(
      page.getByText(/유저|분석|가입|도메인|모드|분포|총|명/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('B2B 조직·코치 탭 클릭 → 조직 목록 또는 빈 상태 텍스트 노출', async ({ page }) => {
    const b2bBtn = page.getByRole('button', { name: /B2B 조직|B2B Orgs/i });
    await expect(b2bBtn).toBeVisible({ timeout: 15_000 });

    await b2bBtn.click();
    // 스피너 사라질 때까지 대기 후 콘텐츠 확인
    await page.waitForFunction(
      () => !document.querySelector('.animate-spin'),
      { timeout: 20_000 }
    ).catch(() => {});

    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // 조직 목록 또는 빈 상태 안내 텍스트
    await expect(
      page.getByText(/전체 조직|등록된 조직이 없|없습니다|코치 관리|코치/i).first()
    ).toBeVisible({ timeout: 20_000 });
  });
});
