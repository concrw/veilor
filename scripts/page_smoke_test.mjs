// 전체 페이지 스모크 테스트
// 로그인 후 주요 라우트를 순회하며 콘솔 에러 / 네트워크 실패 / 렌더링 실패를 수집한다.
//
//   E2E_USER_DONE_EMAIL=... E2E_USER_DONE_PW=... \
//   BASE_URL=https://veilor.ai node scripts/page_smoke_test.mjs

import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://veilor.ai';
const EMAIL = process.env.E2E_USER_DONE_EMAIL;
const PW = process.env.E2E_USER_DONE_PW;

if (!EMAIL || !PW) {
  console.error('E2E_USER_DONE_EMAIL / E2E_USER_DONE_PW 환경변수가 필요합니다.');
  process.exit(1);
}

// 인증 없이 접근 가능한 페이지
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/privacy', '/terms', '/support'];

// 로그인 후 접근하는 페이지
const AUTH_ROUTES = [
  '/home/vent', '/home/dig', '/home/get', '/home/set', '/home/me',
  '/home/dm', '/home/dive', '/home/community', '/home/events',
  '/home/change-training', '/home/specialists', '/home/veilor',
  '/home/pair-trust', '/home/content-import',
  '/home/sexself/questions', '/home/sexself/need-assessment',
  '/personas', '/personas/relationships',
  '/onboarding/mode-select',
];

// 노이즈 제외: 서드파티/확장/폰트 등 앱 결함과 무관한 것
const IGNORE = [
  /favicon/i, /vercel-insights/i, /va\.vercel-scripts/i,
  /sentry/i, /ERR_BLOCKED_BY_CLIENT/i, /net::ERR_ABORTED/i,
  /Download the React DevTools/i, /workbox/i, /sw\.js/i,
];
const ignored = (s) => IGNORE.some((re) => re.test(s));

async function visit(page, route) {
  const errors = [];
  const netFails = [];

  const onConsole = (m) => {
    if (m.type() === 'error' && !ignored(m.text())) errors.push(m.text().slice(0, 200));
  };
  const onPageErr = (e) => {
    if (!ignored(String(e))) errors.push('PAGEERROR: ' + String(e).slice(0, 200));
  };
  const onResp = (r) => {
    if (r.status() >= 400 && !ignored(r.url())) {
      netFails.push(`${r.status()} ${r.url().replace(BASE, '').slice(0, 110)}`);
    }
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageErr);
  page.on('response', onResp);

  let status = 'OK';
  let bodyLen = 0;
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500); // 클라이언트 렌더링 대기
    const text = await page.locator('body').innerText().catch(() => '');
    bodyLen = text.trim().length;
    if (!resp || resp.status() >= 400) status = `HTTP ${resp?.status() ?? '?'}`;
    else if (bodyLen < 30) status = 'EMPTY';
  } catch (e) {
    status = 'LOAD_FAIL: ' + String(e.message).slice(0, 90);
  }

  page.off('console', onConsole);
  page.off('pageerror', onPageErr);
  page.off('response', onResp);

  return { route, status, bodyLen, errors, netFails };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const results = [];

console.log(`\n=== 공개 페이지 (${PUBLIC_ROUTES.length}) ===`);
for (const r of PUBLIC_ROUTES) {
  const res = await visit(page, r);
  results.push(res);
  console.log(`  ${res.status.padEnd(12)} ${r.padEnd(28)} len=${res.bodyLen} err=${res.errors.length} net=${res.netFails.length}`);
}

console.log('\n=== 로그인 ===');
let loggedIn = false;
try {
  await page.goto(BASE + '/auth/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PW);
  await page.locator('button').filter({ hasText: /^(Log in|로그인)$/ }).first().click();
  // 새 브라우저 컨텍스트는 /onboarding/mode-select를 먼저 거친다 (정상 흐름).
  await page.waitForURL(/\/home|\/onboarding\//, { timeout: 45000 });

  if (page.url().includes('/onboarding/mode-select')) {
    // 도메인 선택 → 모드 선택 두 단계를 통과한다.
    for (let step = 0; step < 2; step++) {
      const btn = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm|Start/i }).first();
      await btn.waitFor({ timeout: 10000 }).catch(() => null);
      await btn.click().catch(() => null);
      await page.waitForTimeout(800);
    }
    await page.waitForURL(/\/home/, { timeout: 30000 }).catch(() => null);
  }

  loggedIn = /\/home/.test(page.url());
  console.log(`  ${loggedIn ? '성공' : '미완료'} →`, page.url().replace(BASE, ''));
} catch (e) {
  console.log('  ** 실패:', String(e.message).slice(0, 160));
}

if (loggedIn) {
  console.log(`\n=== 인증 페이지 (${AUTH_ROUTES.length}) ===`);
  for (const r of AUTH_ROUTES) {
    const res = await visit(page, r);
    results.push(res);
    console.log(`  ${res.status.padEnd(12)} ${r.padEnd(34)} len=${res.bodyLen} err=${res.errors.length} net=${res.netFails.length}`);
  }
}

console.log('\n=== 문제 상세 ===');
let problems = 0;
for (const r of results) {
  if (r.status === 'OK' && r.errors.length === 0 && r.netFails.length === 0) continue;
  problems++;
  console.log(`\n[${r.route}] ${r.status}`);
  [...new Set(r.errors)].slice(0, 4).forEach((e) => console.log('   ERR ' + e));
  [...new Set(r.netFails)].slice(0, 6).forEach((n) => console.log('   NET ' + n));
}
if (problems === 0) console.log('  문제 없음');

console.log(`\n=== 요약: ${results.length}개 페이지 / 문제 ${problems}개 / 로그인 ${loggedIn ? '성공' : '실패'} ===`);
await browser.close();
