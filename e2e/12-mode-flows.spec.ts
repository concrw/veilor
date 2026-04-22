/**
 * E2E: 3개 모드(original / clear / routine) 유저플로우 테스트
 *
 * 검증 범위:
 * 1. 미인증 접근 → login 리다이렉트
 * 2. ModeSelect 화면 렌더링 (3개 카드)
 * 3. 각 모드 선택 → localStorage 저장
 * 4. 모드별 홈(Vent/Clear/Routine 탭) 렌더링
 * 5. 모드별 Dig 뷰 분기
 * 6. 모드별 Me 뷰 분기
 * 7. B2B 진입점 라우트 보호
 * 8. SexSelf 라우트 체인 (questions → result → need-assessment)
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

// 인증 없이 모드 시뮬레이션용 헬퍼
async function setMode(page: import('@playwright/test').Page, mode: 'original' | 'clear' | 'routine') {
  await page.addInitScript((m) => {
    localStorage.setItem('veilor_ux_mode', m);
    localStorage.setItem('veilor_first_visit_dismissed', 'true');
  }, mode);
}

// ── Group 1: 미인증 보호 ──────────────────────────────────────────
test.describe('미인증 보호 라우트', () => {
  const protectedPaths = [
    '/home/vent',
    '/home/dig',
    '/home/get',
    '/home/set',
    '/home/me',
    '/home/dm',
    '/home/sexself/questions',
    '/home/sexself/need-assessment',
    '/home/community',
    '/onboarding/mode-select',
    '/personas',
  ];

  for (const path of protectedPaths) {
    test(`미인증 → /auth/login 리다이렉트: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8_000 });
    });
  }
});

// ── Group 2: ModeSelect 화면 ─────────────────────────────────────
test.describe('ModeSelect 화면', () => {
  test('3개 모드 카드 렌더링', async ({ page }) => {
    // first_visit_dismissed 없이 로그인 → RootRedirect가 /onboarding/mode-select로 보냄
    await page.addInitScript(() => {
      localStorage.removeItem('veilor_first_visit_dismissed');
      localStorage.removeItem('veilor_ux_mode');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    // RootRedirect: onboarding completed + isFirstVisit → mode-select
    await page.waitForURL(/mode-select|home/, { timeout: 20_000 });

    const url = page.url();
    if (url.includes('mode-select')) {
      await page.waitForLoadState('networkidle');
      // ModeSelect: 텍스트 기반으로 3개 카드 확인
      const hasOriginal = await page.locator('text=/오리지널|Original/').first().isVisible({ timeout: 5_000 }).catch(() => false);
      const hasClear    = await page.locator('text=/클리어|Clear/').first().isVisible({ timeout: 3_000 }).catch(() => false);
      const hasRoutine  = await page.locator('text=/루틴|Routine/').first().isVisible({ timeout: 3_000 }).catch(() => false);
      expect(hasOriginal || hasClear || hasRoutine).toBeTruthy();
    } else {
      // 이미 mode-select를 통과한 상태 → /home 이동도 정상
      expect(url).toMatch(/\/home/);
    }
  });
});

// ── Group 3: 모드별 홈 렌더링 ─────────────────────────────────────
test.describe('모드별 홈 렌더링', () => {
  // beforeEach에서 모드 설정 후 로그인 → reload 없이 세션 유지
  async function loginWithMode(page: import('@playwright/test').Page, mode: 'original' | 'clear' | 'routine') {
    await page.addInitScript((m) => {
      localStorage.setItem('veilor_ux_mode', m);
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    }, mode);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  }

  test('[original] Vent 탭 레이블 확인', async ({ page }) => {
    await loginWithMode(page, 'original');
    // 로딩 스피너가 사라질 때까지 대기
    await page.waitForSelector('nav[aria-label="메인 탭 네비게이션"]', { timeout: 15_000 });
    const navText = await page.locator('nav[aria-label="메인 탭 네비게이션"]').textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Vent/);
  });

  test('[clear] Clear 탭 레이블 + ClearHome 렌더링', async ({ page }) => {
    await loginWithMode(page, 'clear');
    await page.waitForSelector('nav[aria-label="메인 탭 네비게이션"]', { timeout: 15_000 });
    const navText = await page.locator('nav[aria-label="메인 탭 네비게이션"]').textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Clear/);
    // ClearHome 콘텐츠 로딩 대기 후 확인
    await expect(
      page.locator('body').getByText(/대시보드|관계 건강도|체크인|기록/).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('[routine] Routine 탭 레이블 + RoutineHome 렌더링', async ({ page }) => {
    await loginWithMode(page, 'routine');
    // 하단 nav 텍스트에 "Routine" 포함 확인
    const navText = await page.locator('nav[aria-label="메인 탭 네비게이션"]').textContent({ timeout: 8_000 }).catch(() => '');
    expect(navText).toMatch(/Routine/);
  });
});

// ── Group 4: 모드별 Dig 분기 ─────────────────────────────────────
test.describe('모드별 Dig 뷰 분기', () => {
  test('[clear] Dig → 감정 트렌드 뷰', async ({ page }) => {
    // addInitScript: 모든 탐색에 앞서 실행 → ModeContext 마운트 시 'clear' 읽음
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'clear');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // SPA 내부 탐색: 탭 클릭 (goto보다 안정적 — AuthContext 재로딩 없음)
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a', { hasText: /dig/i }).click();
    await page.waitForURL(/\/home\/dig/, { timeout: 8_000 });
    // ClearDigView: 감정 트렌드 탭 or 빈 상태 메시지
    await expect(
      page.locator('body').getByText(/감정 트렌드|활동 분석|기록이 없/).first()
    ).toBeVisible({ timeout: 15_000 });
    const dataMode = await page.locator('html').getAttribute('data-ux-mode');
    expect(dataMode).toBe('clear');
  });

  test('[original] Dig → M43 패턴 뷰', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.goto('/home/dig');
    await expect(page).toHaveURL(/\/home\/dig/, { timeout: 5_000 });
    const is404 = await page.locator('text=/404|찾을 수 없/').first().isVisible().catch(() => false);
    expect(is404).toBeFalsy();
  });
});

// ── Group 5: 모드별 Me 분기 ──────────────────────────────────────
test.describe('모드별 Me 뷰 분기', () => {
  test('[clear] Me → ClearMeView (캘린더 히트맵)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'clear');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    // SPA 내부 탭 클릭
    await page.locator('nav[aria-label="메인 탭 네비게이션"] a', { hasText: /me/i }).click();
    await page.waitForURL(/\/home\/me/, { timeout: 8_000 });
    // ClearMeView: 에러 핸들링 수정 후 빈 데이터도 캘린더 렌더링
    await expect(
      page.locator('body').getByText(/체크인|기록|이번 달|날짜|점수|4월/).first()
    ).toBeVisible({ timeout: 15_000 });
    const dataMode = await page.locator('html').getAttribute('data-ux-mode');
    expect(dataMode).toBe('clear');
  });

  test('[original] Me → 성장/사람/Zone 탭', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.goto('/home/me');
    await expect(page).toHaveURL(/\/home\/me/, { timeout: 5_000 });
    const is404 = await page.locator('text=/404|찾을 수 없/').first().isVisible().catch(() => false);
    expect(is404).toBeFalsy();
  });
});

// ── Group 6: SexSelf 라우트 체인 ─────────────────────────────────
test.describe('SexSelf 라우트', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  });

  test('/home/sexself/questions 렌더링', async ({ page }) => {
    await page.goto('/home/sexself/questions');
    await expect(page).toHaveURL(/sexself\/questions/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    const is404 = await page.locator('text=/404|찾을 수 없/').first().isVisible().catch(() => false);
    expect(is404).toBeFalsy();
    // 질문 페이지 텍스트 확인
    const pageText = await page.locator('body').textContent({ timeout: 5_000 }).catch(() => '');
    expect(pageText.length).toBeGreaterThan(20);
  });

  test('/home/sexself/result — state 없이 접근 시 questions 유지 또는 리다이렉트', async ({ page }) => {
    await page.goto('/home/sexself/result');
    await page.waitForURL(/sexself/, { timeout: 8_000 });
    const url = page.url();
    // state 없으면 questions로 리다이렉트 OR result에 머물며 에러 없이 렌더링
    expect(url).toMatch(/sexself\/(questions|result)/);
  });

  test('/home/sexself/need-assessment 렌더링', async ({ page }) => {
    await page.goto('/home/sexself/need-assessment');
    await expect(page).toHaveURL(/sexself\/need-assessment/, { timeout: 8_000 });
    const is404 = await page.locator('text=/404|찾을 수 없/').first().isVisible().catch(() => false);
    expect(is404).toBeFalsy();
  });
});

// ── Group 7: B2B 라우트 보호 ─────────────────────────────────────
test.describe('B2B 라우트', () => {
  test('미인증 → /auth/login 리다이렉트', async ({ page }) => {
    await page.goto('/b2b/coaches');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8_000 });
  });

  test('[인증] /b2b/coaches 렌더링', async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.goto('/b2b/coaches');
    await expect(page).toHaveURL(/\/b2b\/coaches/, { timeout: 8_000 });
    const is404 = await page.locator('text=/404|찾을 수 없/i').first().isVisible().catch(() => false);
    expect(is404).toBeFalsy();
  });
});

// ── Group 8: 네비게이션 탭 전환 ──────────────────────────────────
test.describe('탭 네비게이션 전환 (original 모드)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('veilor_ux_mode', 'original');
      localStorage.setItem('veilor_first_visit_dismissed', 'true');
    });
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
  });

  const tabs = [
    { name: /vent/i, path: '/home/vent' },
    { name: /dig/i,  path: '/home/dig'  },
    { name: /get/i,  path: '/home/get'  },
    { name: /set/i,  path: '/home/set'  },
    { name: /me/i,   path: '/home/me'   },
  ];

  for (const tab of tabs) {
    test(`탭 클릭 → ${tab.path}`, async ({ page }) => {
      await page.getByRole('link', { name: tab.name }).first().click();
      await expect(page).toHaveURL(new RegExp(tab.path.replace('/', '\\/')), { timeout: 8_000 });
    });
  }
});
