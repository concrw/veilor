import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// 자격증명은 저장소에 두지 않는다. 실행 전 환경변수로 주입할 것:
//   E2E_USER_DONE_EMAIL=... E2E_USER_DONE_PW=... node scripts/appstore_screenshots.mjs
const E2E_EMAIL = process.env.E2E_USER_DONE_EMAIL;
const E2E_PW = process.env.E2E_USER_DONE_PW;
if (!E2E_EMAIL || !E2E_PW) {
  console.error('E2E_USER_DONE_EMAIL / E2E_USER_DONE_PW 환경변수가 필요합니다.');
  process.exit(1);
}

// 캡처 후 App Store 허용 크기 1320×2868로 정확히 리사이즈
function resizeToAppStore(filePath) {
  execSync(`sips --resampleHeightWidth 2868 1320 "${filePath}" --out "${filePath}"`, { stdio: 'ignore' });
}

// iPhone 17 Pro Max: 1320×2868px (logical 393×852 @ 3.36x)
// App Store requires 1290×2796 or 1320×2868 for 6.9" display
const OUT = '/Users/brandactivist/Desktop/VEILOR/screenshots/appstore';
fs.mkdirSync(OUT, { recursive: true });

const WIDTH  = 393;
const HEIGHT = 852;
const SCALE  = 3.36;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
  isMobile: true,
  hasTouch: true,
});

const page = await ctx.newPage();

async function wait(p, label) {
  try {
    await p.waitForSelector('.animate-spin', { state: 'detached', timeout: 20000 });
  } catch {
    console.warn(`  spinner timeout — ${label}`);
  }
  await p.waitForTimeout(1800);
}

async function shot(filename) {
  const dest = path.join(OUT, filename);
  await page.screenshot({ path: dest, fullPage: false });
  resizeToAppStore(dest);
  console.log(`✓ ${filename}`);
}

// ── 1. 로그인 ──────────────────────────────────────────────
await page.goto('http://localhost:5174/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await shot('00_login.png');

await page.fill('input[type="email"]', E2E_EMAIL);
await page.fill('input[type="password"]', E2E_PW);
await page.click('button:not([disabled])');
// onboarding/mode-select 혹은 /home 어느 쪽이든 기다림
await page.waitForURL(/\/(home|onboarding)/, { timeout: 15000 });
await wait(page, 'after login');

// 언어 영어로 고정 + mode-select 우회 (veilor_mode_selected = 'true' → isFirstVisit = false)
await page.evaluate(() => {
  localStorage.setItem('veilor-language', '"en"');
  localStorage.setItem('veilor_mode_selected', 'true');
});
// 직접 /home/vent로 이동
await page.goto('http://localhost:5174/home/vent', { waitUntil: 'networkidle', timeout: 15000 });
await wait(page, 'reload');
console.log('Ready:', page.url());

// ── 헬퍼: 탭 클릭 네비게이션 ──────────────────────────────
async function goTab(slug) {
  const link = page.locator(`[aria-label="Main tab navigation"] a[href="/home/${slug}"]`);
  if (await link.count() > 0) {
    await link.click();
  } else {
    await page.evaluate((s) => {
      window.history.pushState({}, '', `/home/${s}`);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }, slug);
  }
  try { await page.waitForURL(`**/${slug}`, { timeout: 5000 }); } catch {}
  await wait(page, slug);
}

// ── 2. Vent (감정 표현) ─────────────────────────────────────
await goTab('vent');
await shot('01_vent.png');

// ── 3. Dig (내면 탐구) ─────────────────────────────────────
await goTab('dig');
await shot('02_dig.png');

// ── 4. Get (연결/매칭) ─────────────────────────────────────
await goTab('get');
await shot('03_get.png');

// ── 5. Set (루틴/설정) ─────────────────────────────────────
await goTab('set');
await shot('04_set.png');

// ── 6. Me (프로필/페르소나) ────────────────────────────────
await goTab('me');
await shot('05_me.png');

// ── 7. Community ───────────────────────────────────────────
await goTab('community');
await shot('06_community.png');

// ── 8. Guest Landing (로그아웃 상태 — 앱 첫 인상) ──────────
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
await wait(page, 'guest landing');
await shot('07_guest_landing.png');

await browser.close();
console.log('\nAll screenshots saved to:', OUT);
