import { chromium, devices } from 'playwright';

const BASE = 'http://localhost:8080';
const browser = await chromium.launch({ headless: true });

const ctx = await browser.newContext({
  ...devices['Pixel 5'],
  locale: 'ko-KR',
  storageState: '/tmp/veilor_storage.json',
});
const page = await ctx.newPage();

await page.goto(`${BASE}/home/vent`);
await page.waitForFunction(() => !document.querySelector('[class*="animate-spin"]'), { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);

const tabs = ['vent', 'dig', 'get', 'set', 'me'];

for (const name of tabs) {
  await page.evaluate((href) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, `/home/${name}`);
  await page.waitForTimeout(1800);

  // 뷰포트 너비 대비 콘텐츠 좌우 여백 측정
  const margins = await page.evaluate(() => {
    const vw = window.innerWidth;
    // 헤더 div
    const headerDiv = Array.from(document.querySelectorAll('div')).find(el => {
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < 10 && cs.display === 'flex' && cs.alignItems === 'center' && cs.borderBottomWidth !== '0px';
    });
    // 콘텐츠 첫번째 실질 자식 (헤더 아래)
    const contentEl = Array.from(document.querySelectorAll('div, p, h1, h2, h3, form, button')).find(el => {
      const rect = el.getBoundingClientRect();
      return rect.top > 55 && rect.top < 150 && rect.left > 0 && rect.width > 100;
    });
    return {
      vw,
      header: headerDiv ? {
        paddingLeft: window.getComputedStyle(headerDiv).paddingLeft,
        paddingRight: window.getComputedStyle(headerDiv).paddingRight,
        left: Math.round(headerDiv.getBoundingClientRect().left),
        right: Math.round(vw - headerDiv.getBoundingClientRect().right),
      } : null,
      content: contentEl ? {
        tag: contentEl.tagName,
        text: contentEl.textContent?.trim().slice(0, 30),
        left: Math.round(contentEl.getBoundingClientRect().left),
        right: Math.round(vw - contentEl.getBoundingClientRect().right),
        paddingLeft: window.getComputedStyle(contentEl).paddingLeft,
      } : null,
    };
  });

  console.log(`\n=== ${name.toUpperCase()} (vw=${margins.vw}px) ===`);
  console.log(`  header  → left: ${margins.header?.left}px, right: ${margins.header?.right}px, pl: ${margins.header?.paddingLeft}, pr: ${margins.header?.paddingRight}`);
  console.log(`  content → left: ${margins.content?.left}px, right: ${margins.content?.right}px, pl: ${margins.content?.paddingLeft} [${margins.content?.tag} "${margins.content?.text}"]`);
}

await ctx.close();
await browser.close();
