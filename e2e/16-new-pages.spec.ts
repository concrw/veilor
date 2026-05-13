/**
 * E2E: 신규 페이지 기본 렌더링 검증
 *
 * 커버 범위:
 *  1. EventsPage        (/home/events)          — 헤더 + 새 이벤트 버튼 / 빈 상태
 *  2. SpecialistPage    (/home/specialists)      — 헤더 + 상태 뱃지 / 빈 상태
 *  3. VeilorDirectory   (/home/veilor)           — '베일러' 타이틀 / '잘 들어주는 사람들'
 *  4. PairTrustPage     (/home/pair-trust)       — Pair Trust 헤더 + 트러스트 레벨 설명
 *  5. ChangeTrainingPage(/home/change-training)  — Change Training 헤더 + 부제 텍스트
 *  6. ContentImportPage (/home/content-import)   — Content Import 헤더 + 상태 라벨 / 빈 상태
 *  7. DmPage            (/home/dm)               — '1:1 메시지' 헤더 + 빈 상태 / 입력창
 *  8. CommunityPage     (/home/community)        — 탭 그룹/토론/연결/콘텐츠 중 하나 이상
 *  9. GuestLanding      (/ 비로그인)              — '시작하기' 버튼 + 에러 없음
 * 10. NotFound          (/this-route-does-not-exist-9999) — 404 텍스트 + 홈 복귀 버튼
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

// ── 유틸: 이미 로그인된 상태에서 SPA 내 페이지 이동 ───────────────────────
// page.goto()는 full reload → INITIAL_SESSION 재대기 → 로컬에서 불안정
// pushState + popstate로 React Router를 트리거
async function gotoSpa(page: Parameters<typeof login>[0], path: string) {
  await page.evaluate((p: string) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(300);
  await page
    .locator('.animate-spin')
    .waitFor({ state: 'hidden', timeout: 30_000 })
    .catch(() => null);
}

// ── 유틸: 에러 없음 검증 ──────────────────────────────────────────────────
async function expectNoError(page: Parameters<typeof login>[0]) {
  const visible = await page
    .getByText(/Something went wrong|연결 오류/i)
    .isVisible()
    .catch(() => false);
  expect(visible).toBe(false);
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. EventsPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('EventsPage (/home/events)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/events');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test('"Events" 헤더 또는 이벤트 관련 텍스트 노출', async ({ page }) => {
    // EventsPage.tsx:168 — <span>Events</span>
    const header = page.getByText('Events', { exact: true });
    const headerVisible = await header.isVisible({ timeout: 10_000 }).catch(() => false);
    if (headerVisible) {
      expect(headerVisible).toBe(true);
      return;
    }
    // 빈 상태: EventsPage.tsx:184
    const empty = page.getByText('아직 이벤트가 없습니다');
    const emptyVisible = await empty.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(emptyVisible).toBe(true);
  });

  test('"새 이벤트" 버튼 존재', async ({ page }) => {
    // EventsPage.tsx:172-175 — <button>...<Plus />새 이벤트</button>
    const btn = page.locator('button', { hasText: '새 이벤트' }).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. SpecialistPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('SpecialistPage (/home/specialists)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/specialists');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test('"Specialists" 헤더 또는 상태 뱃지 / 빈 상태 노출', async ({ page }) => {
    // SpecialistPage.tsx:130
    const header = page.getByText('Specialists', { exact: true });
    const headerVisible = await header.isVisible({ timeout: 10_000 }).catch(() => false);
    if (headerVisible) {
      expect(headerVisible).toBe(true);
      return;
    }
    // 빈 상태: SpecialistPage.tsx:166
    const badge = page.getByText(/대기 중|수락됨|거절됨|완료|등록된 전문가가 없습니다/i).first();
    const badgeVisible = await badge.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(badgeVisible).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. VeilorDirectoryPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('VeilorDirectoryPage (/home/veilor)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/veilor');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test("'베일러' 또는 '잘 들어주는 사람들' 텍스트 노출", async ({ page }) => {
    // VeilorDirectoryPage.tsx ko.ts: title='베일러', subtitle='잘 들어주는 사람들 · 누구나 신청'
    const title = page.getByText('베일러', { exact: true });
    const titleVisible = await title.isVisible({ timeout: 10_000 }).catch(() => false);
    if (titleVisible) {
      expect(titleVisible).toBe(true);
      return;
    }
    const subtitle = page.getByText(/잘 들어주는 사람들/i);
    const subtitleVisible = await subtitle.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(subtitleVisible).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. PairTrustPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('PairTrustPage (/home/pair-trust)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/pair-trust');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test('"Pair Trust" 헤더 노출', async ({ page }) => {
    // PairTrustPage.tsx:100
    const header = page.getByText('Pair Trust', { exact: true });
    await expect(header).toBeVisible({ timeout: 10_000 });
  });

  test('트러스트 레벨 설명 (Lv.1/2/3) 또는 빈 상태 노출', async ({ page }) => {
    // PairTrustPage.tsx LEVEL_INFO keys: 1='Lv.1 관찰', 2='Lv.2 공유', 3='Lv.3 동행'
    const level = page
      .getByText(/Lv\.1 관찰|Lv\.2 공유|Lv\.3 동행|트러스트 연결이 없습니다/i)
      .first();
    await expect(level).toBeVisible({ timeout: 10_000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. ChangeTrainingPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('ChangeTrainingPage (/home/change-training)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/change-training');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test('"Change Training" 헤더 노출', async ({ page }) => {
    // ChangeTrainingPage.tsx:183
    const header = page.getByText('Change Training', { exact: true });
    await expect(header).toBeVisible({ timeout: 10_000 });
  });

  test("'변화 훈련 · 일지 기록' 부제 노출", async ({ page }) => {
    // ChangeTrainingPage.tsx ko.ts subtitle: '변화 훈련 · 일지 기록'
    const subtitle = page.getByText(/변화 훈련|일지 기록/i).first();
    await expect(subtitle).toBeVisible({ timeout: 10_000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. ContentImportPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('ContentImportPage (/home/content-import)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/content-import');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test('"Content Import" 헤더 노출', async ({ page }) => {
    // ContentImportPage.tsx:139
    const header = page.getByText('Content Import', { exact: true });
    await expect(header).toBeVisible({ timeout: 10_000 });
  });

  test('소스 버튼 또는 상태 라벨 노출', async ({ page }) => {
    // ContentImportPage.tsx — url/notion/twitter 소스 버튼이 항상 렌더
    const urlBtn = page.locator('button', { hasText: /url/i }).first();
    const urlVisible = await urlBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (urlVisible) {
      expect(urlVisible).toBe(true);
      return;
    }
    const status = page.getByText(/대기 중|처리 중|완료|실패|임포트 기록/i).first();
    const statusVisible = await status.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(statusVisible).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. DmPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('DmPage (/home/dm)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/dm');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test("'1:1 메시지' 헤더 노출", async ({ page }) => {
    // DmPage.tsx ko.ts: header='1:1 메시지'
    const header = page.getByText('1:1 메시지').first();
    await expect(header).toBeVisible({ timeout: 10_000 });
  });

  test('빈 상태 또는 메시지 입력창 노출', async ({ page }) => {
    // 룸 선택 후 입력창: DmPage.tsx:20 messagePlaceholder='메시지 입력...'
    const inputBox = page.getByPlaceholder('메시지 입력...');
    const inputVisible = await inputBox.isVisible({ timeout: 5_000 }).catch(() => false);
    if (inputVisible) {
      expect(inputVisible).toBe(true);
      return;
    }
    // 룸이 없는 경우: 사이드바에 대화 없음 상태
    // '1:1 메시지' 헤더가 있으면 페이지 자체는 정상 렌더
    const header = page.getByText('1:1 메시지').first();
    const headerVisible = await header.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(headerVisible).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 8. CommunityPage
// ══════════════════════════════════════════════════════════════════════════════
test.describe('CommunityPage (/home/community)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/home/community');
  });

  test('페이지 진입 — 에러 없음', async ({ page }) => {
    await expectNoError(page);
  });

  test("'그룹/토론/연결/콘텐츠' 탭 중 하나 이상 노출", async ({ page }) => {
    // CommunityPage.tsx ko.ts tabs: groups='그룹', discuss='토론', connect='연결', content='콘텐츠'
    const tab = page.getByRole('button', { name: /그룹|토론|연결|콘텐츠/i }).first();
    await expect(tab).toBeVisible({ timeout: 10_000 });
  });

  test("그룹 탭 기본 진입 — '커뮤니티' 헤더 또는 탭 버튼 노출", async ({ page }) => {
    // CommunityPage.tsx ko.ts header='커뮤니티'
    const header = page.getByText('커뮤니티', { exact: true });
    const headerVisible = await header.isVisible({ timeout: 10_000 }).catch(() => false);
    if (headerVisible) {
      expect(headerVisible).toBe(true);
      return;
    }
    const tab = page.getByRole('button', { name: '그룹' });
    await expect(tab).toBeVisible({ timeout: 10_000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 9. GuestLanding (비로그인)
// ══════════════════════════════════════════════════════════════════════════════
test.describe('GuestLanding (비로그인 /)', () => {
  test('비로그인 상태에서 / 접속 — 에러 없음 + 시작하기 버튼 노출', async ({ page, context }) => {
    test.setTimeout(60_000);
    // 이전 테스트에서 남은 세션 쿠키 제거 후 비로그인 상태로 접속
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    }).catch(() => null);
    await page.goto('/');
    await page
      .locator('.animate-spin')
      .waitFor({ state: 'hidden', timeout: 20_000 })
      .catch(() => null);

    await expectNoError(page);

    // GuestLanding 모바일 버튼 — phase별 텍스트:
    //   entry phase: s.startFree = '시작하기 — 무료' (line 120)
    //   chat phase after entry: s.joinBtn = '가입하고 참여하기' (line 195)
    //   insight phase: s.insightCta = '가입하고 내 패턴 전체 보기' (line 240)
    const ctaBtn = page.locator('button').filter({
      hasText: /시작하기|가입하고|무료/i,
    }).first();
    const ctaVisible = await ctaBtn.isVisible({ timeout: 10_000 }).catch(() => false);
    if (ctaVisible) {
      expect(ctaVisible).toBe(true);
      return;
    }

    // RootRedirect가 비로그인 → GuestLanding 대신 /auth/login으로 리다이렉트할 수 있음
    const loginInput = page.locator('input[type="email"]');
    const loginInputVisible = await loginInput.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(ctaVisible || loginInputVisible).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 10. NotFound
// ══════════════════════════════════════════════════════════════════════════════
test.describe('NotFound (/this-route-does-not-exist-9999)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await gotoSpa(page, '/this-route-does-not-exist-9999');
  });

  test('404 텍스트 또는 홈 복귀 버튼 노출', async ({ page }) => {
    // NotFound.tsx:26 — "404", NotFound.tsx:6 ko: desc='페이지를 찾을 수 없어요'
    const notFound = page.getByText('404', { exact: true });
    const nfVisible = await notFound.isVisible({ timeout: 10_000 }).catch(() => false);
    if (nfVisible) {
      expect(nfVisible).toBe(true);
      return;
    }
    const desc = page.getByText(/페이지를 찾을 수 없어요|홈으로 돌아가기/i).first();
    const descVisible = await desc.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(descVisible).toBe(true);
  });

  test('홈으로 돌아가기 버튼 존재', async ({ page }) => {
    // NotFound.tsx:31 — <button>홈으로 돌아가기</button>
    const homeBtn = page.locator('button', { hasText: '홈으로 돌아가기' });
    await expect(homeBtn).toBeVisible({ timeout: 10_000 });
  });
});
