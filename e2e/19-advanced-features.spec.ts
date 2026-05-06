import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

async function gotoSpa(page: import('@playwright/test').Page, path: string) {
  await page.evaluate((p: string) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(300);
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => null);
}

// ── 1. AILeadOverlay ──────────────────────────────────────────────────────────
async function fireCtrlShiftA(page: import('@playwright/test').Page) {
  // HomeLayout useEffect에 window.addEventListener('keydown') 등록됨 (HomeLayout.tsx:222)
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'A', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true,
    }));
  });
  await page.waitForTimeout(300);
}

test.describe('AILeadOverlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // HomeLayout이 마운트된 /home/vent 탭으로 이동 후 리스너 활성화 대기
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /vent/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);
    await page.waitForTimeout(500);
  });

  test('Ctrl+Shift+A 단축키로 AILeadOverlay 열림', async ({ page }) => {
    test.setTimeout(60_000);

    await fireCtrlShiftA(page);

    // role="dialog" aria-modal="true" 로 렌더링됨 (AILeadOverlay.tsx:290-291)
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // 닫기 버튼 노출 확인 (aria-label="대화 모드 닫기")
    await expect(
      page.getByRole('button', { name: '대화 모드 닫기' }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('열린 상태에서 닫기 버튼 클릭 → AILeadOverlay 닫힘', async ({ page }) => {
    test.setTimeout(60_000);

    await fireCtrlShiftA(page);
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: '대화 모드 닫기' }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  });
});

// ── 2. VoiceModeButton ────────────────────────────────────────────────────────
test.describe('VoiceModeButton', () => {
  test.use({ permissions: ['microphone'] });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // SPA 내부 탭 클릭으로 /home/vent 이동
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a').filter({ hasText: /vent/i }).click();
    await page.waitForURL(/\/home\/vent/, { timeout: 10_000 });
    await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => null);
  });

  test('음성 입력 버튼 노출 확인', async ({ page }) => {
    test.setTimeout(60_000);

    // VoiceModeButton: aria-label="음성 입력 시작/중지"
    const voiceBtn = page.locator(
      'button[aria-label="음성 입력 시작"], button[aria-label="음성 입력 중지"]',
    );
    await expect(voiceBtn.first()).toBeVisible({ timeout: 10_000 });
  });

  test('음성 모드 버튼 클릭 → 에러 없음 + 상태 변화', async ({ page }) => {
    test.setTimeout(60_000);

    const startBtn = page.locator('button[aria-label="음성 입력 시작"]');
    await expect(startBtn).toBeVisible({ timeout: 10_000 });
    await startBtn.click();

    // 클릭 후 "음성 입력 중지" 또는 "음성 모드 비활성화" 버튼 중 하나 노출
    const activeBtn = page.locator(
      'button[aria-label="음성 입력 중지"], button[aria-label="음성 모드 비활성화"]',
    );
    await expect(activeBtn.first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });
});

// ── 3. Personas (/personas) ───────────────────────────────────────────────────
test.describe('Personas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  });

  test('페이지 진입 → 에러 없음', async ({ page }) => {
    test.setTimeout(60_000);

    await gotoSpa(page, '/personas');

    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
    expect(page.url()).toContain('/personas');
  });

  test('빈 상태 또는 메인 페르소나 카드 노출', async ({ page }) => {
    test.setTimeout(60_000);

    await gotoSpa(page, '/personas');

    // 페르소나 없음 텍스트 또는 '나의 페르소나들' 헤더 중 하나 노출
    const emptyState = page.getByText('페르소나가 아직 생성되지 않았습니다');
    const pageTitle  = page.getByText('나의 페르소나들');

    const eitherVisible = await Promise.race([
      emptyState.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true),
      pageTitle.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true),
    ]).catch(() => false);

    expect(eitherVisible).toBe(true);
  });

  test('빈 상태 CTA — Why 분석 시작하기 버튼 노출', async ({ page }) => {
    test.setTimeout(60_000);

    await gotoSpa(page, '/personas');

    // 빈 상태 CTA (ko.ts:17 noPersonaCta: 'Why 분석 시작하기') 또는 페르소나 목록 중 하나 노출
    const emptyStateCta = page.getByRole('button', { name: 'Why 분석 시작하기' });
    const personaTitle  = page.getByText('나의 페르소나들');

    const eitherVisible = await Promise.race([
      emptyStateCta.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true),
      personaTitle.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true),
    ]).catch(() => false);

    expect(eitherVisible).toBe(true);
  });
});

// ── 4. PersonaRelationships (/personas/relationships) ─────────────────────────
test.describe('PersonaRelationships', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/personas/relationships');
  });

  test('페르소나 통합 분석 헤더 노출', async ({ page }) => {
    test.setTimeout(60_000);

    await expect(
      page.getByText('페르소나 통합 분석'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('관계 분석 / 브랜딩 전략 / 성장 추적 탭 3개 노출', async ({ page }) => {
    test.setTimeout(60_000);

    // tab role로 한정 — getByText는 strict mode 위반 위험
    await expect(page.getByRole('tab', { name: '관계 분석' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('tab', { name: '브랜딩 전략' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('tab', { name: '성장 추적' })).toBeVisible({ timeout: 10_000 });
  });

  test('탭 클릭 시 에러 없음', async ({ page }) => {
    test.setTimeout(60_000);

    await page.getByRole('tab', { name: '브랜딩 전략' }).click();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);

    await page.getByRole('tab', { name: '성장 추적' }).click();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);

    await page.getByRole('tab', { name: '관계 분석' }).click();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });
});

// ── 5. UserProfilePage (/users/:userId) ───────────────────────────────────────
test.describe('UserProfilePage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  });

  test('존재하지 않는 userId 접근 → 크래시 없음 (에러 상태 또는 빈 프로필)', async ({ page }) => {
    test.setTimeout(60_000);

    await gotoSpa(page, '/users/nonexistent-test-user-id-00000');

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    expect(page.url()).not.toContain('/auth/login');
  });
});
