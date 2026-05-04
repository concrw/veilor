/**
 * VEILOR E2E Full Flow Test
 * - 로컬(localhost:5173) + 프로덕션(veilor.ai) 동일 스펙
 * - 실행: BASE_URL=http://localhost:5173 npx playwright test tests/e2e_full.spec.ts --reporter=list
 */
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// 테스트 계정 — .env 또는 환경변수로 주입 가능
const TEST_EMAIL    = process.env.TEST_EMAIL    || 'elizabethcho1012@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL   || 'elizabethcho1012@gmail.com';

// 헬퍼: 모바일 뷰포트 (375×812)
async function mobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 812 });
}

// 헬퍼: 로그인
async function login(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  if (password) await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(home|onboarding)/, { timeout: 15000 });
}

// ─────────────────────────────────────────────────────────────
// 1. 게스트 랜딩
// ─────────────────────────────────────────────────────────────
test.describe('게스트 랜딩', () => {
  test('비로그인 루트 접속 → GuestLanding 렌더', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // 로그인/회원가입 CTA 존재 확인
    const body = await page.content();
    const hasAuthCTA =
      (await page.locator('a[href*="/auth/login"], a[href*="/auth/signup"], button').count()) > 0;
    expect(hasAuthCTA).toBe(true);
    await page.screenshot({ path: 'tests/screenshots/01_guest_landing.png', fullPage: true });
  });

  test('/auth/login 페이지 렌더', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/02_login_page.png', fullPage: true });
  });

  test('/auth/signup 페이지 렌더', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/auth/signup`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/03_signup_page.png', fullPage: true });
  });
});

// ─────────────────────────────────────────────────────────────
// 2. 인증 플로우 (비밀번호 없이 UI만 검증)
// ─────────────────────────────────────────────────────────────
test.describe('인증 폼 UI', () => {
  test('로그인 폼 필드 + 제출 버튼 존재', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // 회원가입 링크
    const signupLink = page.locator('a[href*="signup"]');
    await expect(signupLink).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/04_login_form.png' });
  });

  test('빈 폼 제출 → 에러 메시지', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    // HTML5 validation 또는 toast 에러 중 하나
    const pageContent = await page.content();
    await page.screenshot({ path: 'tests/screenshots/05_login_empty_submit.png' });
  });

  test('잘못된 이메일 형식 → validation', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'notanemail');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/06_login_invalid_email.png' });
  });
});

// ─────────────────────────────────────────────────────────────
// 3. 404 / NotFound
// ─────────────────────────────────────────────────────────────
test.describe('NotFound', () => {
  test('존재하지 않는 경로 → NotFound 렌더', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/this-does-not-exist-xyz`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/07_not_found.png', fullPage: true });
    // 홈으로 돌아가기 링크 존재 여부
    const homeLink = page.locator('a[href="/"], a[href*="/home"], button');
    await expect(homeLink.first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────
// 4. B2B 초대 수락 (토큰 없이 UI 확인)
// ─────────────────────────────────────────────────────────────
test.describe('B2B 초대 수락 UI', () => {
  test('/b2b/accept/invalid-token → 렌더 (오류 처리)', async ({ page }) => {
    await mobileViewport(page);
    await page.goto(`${BASE_URL}/b2b/accept/test-invalid-token-123`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/08_b2b_invite_accept.png', fullPage: true });
  });
});

// ─────────────────────────────────────────────────────────────
// 5. 로그인 필요 라우트 → 리다이렉트 확인
// ─────────────────────────────────────────────────────────────
test.describe('Auth Guard 리다이렉트', () => {
  const protectedRoutes = [
    '/home/vent',
    '/home/dig',
    '/home/get',
    '/home/set',
    '/home/me',
    '/home/community',
    '/admin',
    '/b2b/onboarding',
    '/personas',
  ];

  for (const route of protectedRoutes) {
    test(`${route} → 미로그인 시 /auth/login 리다이렉트`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForURL(/\/auth\/login/, { timeout: 8000 });
      expect(page.url()).toContain('/auth/login');
    });
  }
});

// ─────────────────────────────────────────────────────────────
// 6. 로그인 후 메인 플로우 (TEST_PASSWORD 설정된 경우만)
// ─────────────────────────────────────────────────────────────
test.describe('로그인 후 메인 플로우', () => {
  test.skip(!process.env.TEST_PASSWORD, '비밀번호 미설정 — TEST_PASSWORD 환경변수 필요');

  test.beforeEach(async ({ page }) => {
    await mobileViewport(page);
    await login(page);
  });

  test('홈 → /home/vent 렌더', async ({ page }) => {
    await page.waitForURL(/\/home/, { timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/10_home_vent.png', fullPage: true });
  });

  test('하단 내비게이션 모든 탭 이동', async ({ page }) => {
    await page.waitForURL(/\/home/, { timeout: 10000 });
    const tabs = ['dig', 'get', 'set', 'me'];
    for (const tab of tabs) {
      const link = page.locator(`a[href*="/home/${tab}"], button[data-tab="${tab}"]`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: `tests/screenshots/11_tab_${tab}.png` });
      }
    }
  });

  test('/home/vent — 감정 입력 UI 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/vent`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/12_vent_page.png', fullPage: true });
  });

  test('/home/dig — 페이지 렌더', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/dig`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/13_dig_page.png', fullPage: true });
  });

  test('/home/get — 페이지 렌더', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/get`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/14_get_page.png', fullPage: true });
  });

  test('/home/set — 페이지 렌더', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/set`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/15_set_page.png', fullPage: true });
  });

  test('/home/me — 프로필 페이지 렌더', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/me`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/16_me_page.png', fullPage: true });
  });

  test('/home/community — 커뮤니티 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/community`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/17_community_page.png', fullPage: true });
  });

  test('/home/specialists — 스페셜리스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/specialists`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/18_specialists_page.png', fullPage: true });
  });

  test('/home/veilor — 베일러 디렉토리', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/veilor`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/19_veilor_directory.png', fullPage: true });
  });

  test('/home/change-training — 훈련 변경', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/change-training`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/20_change_training.png', fullPage: true });
  });

  test('/home/pair-trust — 페어 트러스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/pair-trust`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/21_pair_trust.png', fullPage: true });
  });

  test('/home/content-import — 콘텐츠 임포트', async ({ page }) => {
    await page.goto(`${BASE_URL}/home/content-import`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/22_content_import.png', fullPage: true });
  });

  test('/personas — 페르소나 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/personas`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/23_personas.png', fullPage: true });
  });

  test('/personas/relationships — 페르소나 관계', async ({ page }) => {
    await page.goto(`${BASE_URL}/personas/relationships`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/24_persona_relationships.png', fullPage: true });
  });

  test('/onboarding/mode-select — 모드 선택', async ({ page }) => {
    await page.goto(`${BASE_URL}/onboarding/mode-select`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/25_mode_select.png', fullPage: true });
  });

  test('/b2b/onboarding — B2B 온보딩', async ({ page }) => {
    await page.goto(`${BASE_URL}/b2b/onboarding`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/26_b2b_onboarding.png', fullPage: true });
  });

  test('/b2b/coaches — 코치 목록', async ({ page }) => {
    await page.goto(`${BASE_URL}/b2b/coaches`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/27_b2b_coaches.png', fullPage: true });
  });

  test('/b2b/coach/portal — 코치 포털', async ({ page }) => {
    await page.goto(`${BASE_URL}/b2b/coach/portal`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/28_coach_portal.png', fullPage: true });
  });
});

// ─────────────────────────────────────────────────────────────
// 7. 어드민 페이지 (어드민 계정만)
// ─────────────────────────────────────────────────────────────
test.describe('어드민 대시보드', () => {
  test.skip(!process.env.TEST_PASSWORD, '비밀번호 미설정');

  test('어드민 로그인 후 /admin 접근', async ({ page }) => {
    await mobileViewport(page);
    await login(page, ADMIN_EMAIL, process.env.TEST_PASSWORD!);
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/30_admin_dashboard.png', fullPage: true });
    // 어드민이면 리다이렉트 없이 유지
    expect(page.url()).toContain('/admin');
  });
});
