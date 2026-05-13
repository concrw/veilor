/**
 * Live 사이트 테스트: https://veilor.ai
 * 테스트 1: 설정 시트 언어 3종 표시 확인
 * 테스트 2: 첫 접속 로딩 시간 측정
 */
import { test, expect, chromium } from '@playwright/test';

const BASE = 'https://veilor.ai';
const DONE_EMAIL = 'e2e.done@veilor.test';
const DONE_PW = 'Veilor2026!';
const SCREENSHOT_DIR = '/Users/brandactivist/Desktop/VEILOR/screenshots';

// 로그인 헬퍼 (veilor.ai 전용)
async function loginLive(page: any) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle', timeout: 30_000 });

  const raced = await Promise.race([
    page.waitForSelector('input[type="email"]', { timeout: 10_000 }).then(() => 'form'),
    page.waitForURL((url: URL) => !url.pathname.startsWith('/auth'), { timeout: 10_000 }).then(() => 'redirected'),
  ]).catch(() => 'form');

  if (raced === 'redirected') {
    console.log('[login] 이미 인증된 세션 — 리다이렉트됨');
    return;
  }

  await page.locator('input[type="email"]').fill(DONE_EMAIL);
  await page.locator('input[type="password"]').fill(DONE_PW);
  // 로그인 버튼: type 없음, 텍스트로 클릭
  await page.locator('button', { hasText: '로그인' }).first().click();
  console.log('[login] 로그인 버튼 클릭');
}

// ──────────────────────────────────────────────
// 테스트 1: 언어 설정 확인
// ──────────────────────────────────────────────
test('T1 — 설정 시트 언어 3종(EN/한국어/日本語) 확인', async ({ page }) => {
  // 1. 로그인
  await loginLive(page);

  // 2. 로그인 후 세션이 확립될 때까지 대기
  // AuthContext가 supabase 세션을 확인하므로 최대 30초 대기
  await page.waitForTimeout(2_000);

  // 어떤 경로에 있든 /home/me로 강제 이동
  await page.goto(`${BASE}/home/me`, { waitUntil: 'domcontentloaded', timeout: 45_000 });

  // React 앱이 실제로 렌더링될 때까지 대기 (스피너 사라질 때까지)
  // SettingsSheet trigger 버튼(gear) 또는 페이지 콘텐츠가 나타날 때까지 기다림
  await page.waitForFunction(
    () => document.querySelectorAll('button').length > 0,
    { timeout: 30_000 }
  );
  console.log('[T1] 페이지 렌더링 완료, 버튼 감지됨');
  console.log('[T1] /home/me 이동 완료:', page.url());

  // 3. 설정(gear) 버튼 클릭
  const gearBtn = page
    .locator('button[aria-label*="setting"], button[aria-label*="설정"], button svg[class*="gear"], button svg[class*="Gear"]')
    .first();

  // gear 버튼 여러 방식으로 시도
  const gearBtnAlt = page.locator('[data-testid="settings-btn"], [aria-label="Settings"], [aria-label="설정"]').first();

  let gearFound = false;
  for (const selector of [
    'button[aria-label*="설정"]',
    'button[aria-label*="setting" i]',
    '[data-testid="settings-btn"]',
    // lucide Gear icon을 품은 버튼
    'button:has(svg)',
  ]) {
    const locator = page.locator(selector).first();
    const count = await locator.count();
    if (count > 0) {
      console.log(`[T1] gear 버튼 발견 (selector: ${selector})`);
      await locator.click();
      gearFound = true;
      break;
    }
  }

  if (!gearFound) {
    // 마지막 수단: 화면 우상단 버튼들 목록 출력
    const btns = await page.locator('button').all();
    console.log(`[T1] 전체 버튼 수: ${btns.length}`);
    for (let i = 0; i < Math.min(btns.length, 15); i++) {
      const text = await btns[i].innerText().catch(() => '');
      const ariaLabel = await btns[i].getAttribute('aria-label').catch(() => '');
      console.log(`  button[${i}] text="${text}" aria-label="${ariaLabel}"`);
    }
    // 텍스트 없는 버튼 중 마지막 클릭 시도 (보통 아이콘 버튼)
    const iconBtns = page.locator('button').filter({ hasNotText: /[가-힣a-zA-Z]/ });
    const iconCount = await iconBtns.count();
    console.log(`[T1] 텍스트 없는 버튼 수: ${iconCount}`);
    if (iconCount > 0) {
      await iconBtns.last().click();
      gearFound = true;
    }
  }

  await page.waitForTimeout(1_500);
  const afterClickScreenshot = `${SCREENSHOT_DIR}/T1_after_gear_click.png`;
  await page.screenshot({ path: afterClickScreenshot, fullPage: true });
  console.log(`[T1] gear 클릭 후 스크린샷: ${afterClickScreenshot}`);

  // 4. 시트에서 언어 버튼 찾기
  const langLabels = ['EN', '한국어', '日本語'];
  const found: string[] = [];
  const missing: string[] = [];

  for (const label of langLabels) {
    const el = page.getByText(label, { exact: true });
    const count = await el.count();
    if (count > 0) {
      found.push(label);
      console.log(`[T1] ✓ 언어 버튼 있음: "${label}"`);
    } else {
      // partial match fallback
      const el2 = page.locator(`text=${label}`);
      const c2 = await el2.count();
      if (c2 > 0) {
        found.push(label);
        console.log(`[T1] ✓ 언어 버튼 있음(partial): "${label}"`);
      } else {
        missing.push(label);
        console.log(`[T1] ✗ 언어 버튼 없음: "${label}"`);
      }
    }
  }

  // 5. 최종 스크린샷
  const finalScreenshot = `${SCREENSHOT_DIR}/T1_settings_lang.png`;
  await page.screenshot({ path: finalScreenshot, fullPage: true });
  console.log(`[T1] 최종 스크린샷: ${finalScreenshot}`);

  // 6. 결과
  console.log(`\n[T1 결과]`);
  console.log(`  발견된 언어: ${found.join(', ')}`);
  console.log(`  누락된 언어: ${missing.join(', ') || '없음'}`);

  expect(missing, `누락된 언어: ${missing.join(', ')}`).toHaveLength(0);
});

// ──────────────────────────────────────────────
// 테스트 2: 첫 접속 로딩 시간 측정 (캐시 없음)
// ──────────────────────────────────────────────
test('T2 — 첫 접속 로딩 시간 측정 (캐시 없는 새 컨텍스트)', async ({ browser }) => {
  // 캐시 없는 새 브라우저 컨텍스트
  const ctx = await browser.newContext({
    // 캐시 비활성화
    bypassCSP: false,
    extraHTTPHeaders: {
      'Cache-Control': 'no-cache, no-store',
      Pragma: 'no-cache',
    },
  });
  const page = await ctx.newPage();

  // 요청 타이밍 수집
  const resourceTimings: Array<{ url: string; duration: number; size: number }> = [];

  page.on('requestfinished', async (req) => {
    try {
      const timing = req.timing();
      const resp = await req.response();
      if (!resp) return;
      const duration = timing.responseEnd - timing.requestStart;
      if (duration < 0) return;
      const headers = resp.headers();
      const contentLength = parseInt(headers['content-length'] ?? '0', 10);
      resourceTimings.push({
        url: req.url(),
        duration: Math.round(duration),
        size: contentLength,
      });
    } catch {
      // ignore
    }
  });

  const t0 = Date.now();
  await page.goto(BASE, { waitUntil: 'load', timeout: 60_000 });
  const wallTime = Date.now() - t0;

  // Performance API 수집
  const perfTiming = await page.evaluate(() => {
    const t = performance.timing;
    return {
      total: t.loadEventEnd - t.navigationStart,
      domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
      serverResponse: t.responseEnd - t.requestStart,
      ttfb: t.responseStart - t.navigationStart,
    };
  });

  // 상위 5개 느린 리소스
  const top5Slow = [...resourceTimings]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  // 상위 5개 큰 리소스
  const top5Big = [...resourceTimings]
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  // JS bundle 파일만 필터
  const jsBundles = resourceTimings
    .filter((r) => /\.js(\?|$)/.test(r.url))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  console.log('\n========== T2: 로딩 시간 측정 결과 ==========');
  console.log(`  벽시계 시간 (goto 완료까지): ${wallTime} ms`);
  console.log(`  performance.timing.total (loadEventEnd):      ${perfTiming.total} ms`);
  console.log(`  performance.timing.domContentLoaded:          ${perfTiming.domContentLoaded} ms`);
  console.log(`  performance.timing.serverResponse:            ${perfTiming.serverResponse} ms`);
  console.log(`  TTFB (Time To First Byte):                    ${perfTiming.ttfb} ms`);
  console.log(`\n  [느린 리소스 Top 5]`);
  for (const r of top5Slow) {
    const kb = r.size > 0 ? `${(r.size / 1024).toFixed(1)} KB` : 'size unknown';
    console.log(`    ${r.duration} ms  ${kb}  ${r.url}`);
  }
  console.log(`\n  [큰 리소스 Top 5 (content-length 기준)]`);
  for (const r of top5Big) {
    const kb = `${(r.size / 1024).toFixed(1)} KB`;
    console.log(`    ${kb}  ${r.duration} ms  ${r.url}`);
  }
  console.log(`\n  [JS Bundle Top 5]`);
  for (const r of jsBundles) {
    const kb = r.size > 0 ? `${(r.size / 1024).toFixed(1)} KB` : 'size unknown';
    console.log(`    ${kb}  ${r.duration} ms  ${r.url}`);
  }
  console.log('==============================================\n');

  // 스크린샷
  const screenshotPath = `${SCREENSHOT_DIR}/T2_load_test.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`[T2] 스크린샷: ${screenshotPath}`);

  await ctx.close();

  // 기본 어서션: 페이지가 60초 내 로드됨 (위에서 이미 goto 성공)
  expect(perfTiming.total).toBeGreaterThan(0);
});
