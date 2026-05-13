import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const OUT = '/Users/brandactivist/Desktop/VEILOR/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const WIDTH = 393;
const HEIGHT = 852;
const SCALE = 3.36; // → 1320x2863 ≈ 1320x2868

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
  isMobile: true,
  hasTouch: true,
});

const page = await ctx.newPage();

// 로딩 스피너 사라질 때까지 대기
async function waitForContent(p, label) {
  try {
    await p.waitForSelector('.animate-spin', { state: 'detached', timeout: 20000 });
  } catch {
    console.warn(`  spinner timeout — ${label}`);
  }
  await p.waitForTimeout(1500);
}

// 1. 로그인
await page.goto('http://localhost:5174/auth/login', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);
await page.fill('input[type="email"]', 'e2e.done@veilor.test');
await page.fill('input[type="password"]', 'Veilor2026!');
await page.click('button:not([disabled])');
await page.waitForTimeout(500);
await page.waitForURL('**/home/**', { timeout: 15000 });
await waitForContent(page, 'initial load');

// 2. 언어 영어 설정
await page.evaluate(() => localStorage.setItem('veilor-language', '"en"'));
await page.reload({ waitUntil: 'networkidle' });
await waitForContent(page, 'after reload');
console.log('Auth ready:', page.url());

// 3. React Router 클라이언트 사이드 네비게이션 — window.history 직접 트리거
async function navigateTo(p, slug, label) {
  // React Router의 navigate를 직접 호출하지 않고 href 클릭으로 SPA 라우팅
  // aria-label이 있는 모바일 nav 안에서 href 속성으로 찾기
  const link = p.locator(`[aria-label="Main tab navigation"] a[href="/home/${slug}"]`);
  const count = await link.count();
  if (count > 0) {
    await link.click();
  } else {
    // fallback: pushState 직접 호출
    await p.evaluate((s) => {
      window.history.pushState({}, '', `/home/${s}`);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }, slug);
  }

  try {
    await p.waitForURL(`**/${slug}`, { timeout: 5000 });
  } catch {
    // URL 변경 안 되어도 계속
  }
  console.log(`  → ${p.url()}`);
}

// 4. 각 탭 스크린샷
const tabs = [
  { slug: 'vent', file: '01_vent.png' },
  { slug: 'dig',  file: '02_dig.png'  },
  { slug: 'get',  file: '03_get.png'  },
  { slug: 'set',  file: '04_set.png'  },
  { slug: 'me',   file: '05_me.png'   },
];

// Vent는 이미 활성 — 바로 찍기
await waitForContent(page, '01_vent.png');
await page.screenshot({ path: path.join(OUT, '01_vent.png'), fullPage: false });
console.log('✓ 01_vent.png');

// 나머지 탭
for (const { slug, file } of tabs.slice(1)) {
  await navigateTo(page, slug, file);
  await waitForContent(page, file);
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  console.log(`✓ ${file}`);
}

await browser.close();
console.log('Done');
