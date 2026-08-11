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

function resizeToAppStore(filePath) {
  execSync(`sips --resampleHeightWidth 2732 2048 "${filePath}" --out "${filePath}"`, { stdio: 'ignore' });
}

// 모바일 레이아웃(430x932)으로 캡처 후 2048x2732로 upscale
const OUT = '/Users/brandactivist/Desktop/VEILOR/screenshots/appstore_ipad';
fs.mkdirSync(OUT, { recursive: true });

// 2048x2732 비율(0.75) 유지: 683x911 @ 3x = 2049x2733 → sips로 정확히 맞춤
const WIDTH  = 683;
const HEIGHT = 911;
const SCALE  = 3;

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

// 1. 로그인 화면
await page.goto('http://localhost:5174/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await shot('00_login.png');

// 로그인 전에 localStorage 미리 설정 (로그인 직후 RootRedirect가 mode-select로 보내기 전에 선점)
await page.evaluate(() => {
  localStorage.setItem('veilor-language', '"en"');
  localStorage.setItem('veilor_mode_selected', 'true');
});

await page.fill('input[type="email"]', E2E_EMAIL);
await page.fill('input[type="password"]', E2E_PW);
await page.click('button:not([disabled])');
await page.waitForURL(/\/(home|onboarding)/, { timeout: 15000 });
await wait(page, 'after login');
console.log('After login:', page.url());

// SPA 내에서 pushState로 이동 (풀 페이지 로드 없이)
await page.evaluate(() => {
  window.history.pushState({}, '', '/home/vent');
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
});
await page.waitForTimeout(2500);
console.log('Ready:', page.url());

async function goTab(slug) {
  await page.evaluate((s) => {
    window.history.pushState({}, '', `/home/${s}`);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, slug);
  await page.waitForTimeout(2500);
}

// 2. Vent
await goTab('vent');
await shot('01_vent.png');

// 3. Dig
await goTab('dig');
await shot('02_dig.png');

// 4. Get
await goTab('get');
await shot('03_get.png');

// 5. Set
await goTab('set');
await shot('04_set.png');

// 6. Me
await goTab('me');
await shot('05_me.png');

// 7. Community
await goTab('community');
await shot('06_community.png');

// 8. Guest Landing
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });
await wait(page, 'guest landing');
await shot('07_guest_landing.png');

await browser.close();
console.log('\nAll iPad screenshots saved to:', OUT);
