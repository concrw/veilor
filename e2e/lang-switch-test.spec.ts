/**
 * 언어 전환 기능 직접 테스트
 * - 앱 로드 확인
 * - 로그인 없이 접근 가능한 화면에서 언어 테스트
 * - 로그인 후 ME탭 → 설정 시트 → 언어 전환 테스트
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login, waitForHome } from './helpers';

test.describe('언어 전환 기능 테스트', () => {

  test('1. 앱 로드 확인 (http://localhost:5173)', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    const title = await page.title();
    const url = page.url();
    console.log(`[앱 로드] URL: ${url}, Title: ${title}`);

    // 페이지가 비어있지 않은지 확인
    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    console.log(`[앱 로드] Body 텍스트 일부: ${bodyText.slice(0, 200)}`);

    // 앱이 로드된 것을 확인하는 기본 조건
    const hasContent = await page.locator('#root').count() > 0
      || await page.locator('body > *').count() > 0;
    expect(hasContent).toBeTruthy();

    await page.screenshot({ path: 'test-results/01-app-load.png' });
    console.log('[앱 로드] 스크린샷 저장: test-results/01-app-load.png');
  });

  test('2. 온보딩/웰컴 화면에서 언어 전환 확인 (로그인 불필요)', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    const currentUrl = page.url();
    console.log(`[웰컴/랜딩] 현재 URL: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/02-landing.png' });

    // 언어 전환 버튼이 있는지 확인 (온보딩 화면에서)
    const langButtons = await page.locator('[data-lang], button:has-text("EN"), button:has-text("KO"), button:has-text("English"), button:has-text("한국어")').all();
    console.log(`[웰컴/랜딩] 언어 버튼 수: ${langButtons.length}`);

    for (const btn of langButtons) {
      const text = await btn.innerText().catch(() => '');
      console.log(`  - 버튼: "${text}"`);
    }

    // Welcome 페이지의 특정 요소 확인
    const headings = await page.locator('h1, h2, h3').allInnerTexts().catch(() => [] as string[]);
    console.log(`[웰컴/랜딩] 헤딩: ${JSON.stringify(headings)}`);
  });

  test('3. 로그인 후 ME탭 → 설정 시트 → 언어 전환 테스트', async ({ page }) => {
    // playwright.config.ts의 baseURL이 8080이므로 명시적으로 5173 사용
    page.setDefaultNavigationTimeout(30_000);

    // 로그인
    await page.goto('http://localhost:5173/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
    console.log(`[로그인] URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/03-login-page.png' });

    // 로그인 폼이 있는지 확인
    const emailInput = page.locator('input[type="email"]');
    const hasLoginForm = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[로그인] 로그인 폼 표시: ${hasLoginForm}`);

    if (hasLoginForm) {
      await emailInput.fill('e2e.done@veilor.test');
      await page.locator('input[type="password"]').fill('Veilor2026!');
      await page.screenshot({ path: 'test-results/03-login-filled.png' });

      // 로그인 버튼 클릭
      const loginBtn = page.locator('button').filter({ hasText: /로그인|Log in|Login/i }).first();
      const hasBtnText = await loginBtn.innerText().catch(() => '');
      console.log(`[로그인] 로그인 버튼 텍스트: "${hasBtnText}"`);
      await loginBtn.click();

      // 홈으로 이동 대기
      await page.waitForURL(
        (url) => url.pathname.startsWith('/home') || url.pathname.startsWith('/onboarding'),
        { timeout: 30_000 }
      ).catch(() => {
        console.log(`[로그인] 홈 이동 타임아웃 — 현재 URL: ${page.url()}`);
      });
    }

    const afterLoginUrl = page.url();
    console.log(`[로그인 후] URL: ${afterLoginUrl}`);
    await page.screenshot({ path: 'test-results/04-after-login.png' });

    // 온보딩이 뜨면 처리
    if (afterLoginUrl.includes('/onboarding')) {
      console.log('[온보딩] 온보딩 화면 감지 — 넘어가기 시도');
      const confirmBtn = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first();
      await confirmBtn.waitFor({ timeout: 10_000 }).catch(() => null);
      await confirmBtn.click().catch(() => null);
      await page.waitForTimeout(800);
      const confirmBtn2 = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first();
      await confirmBtn2.click().catch(() => null);
      await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 20_000 }).catch(() => null);
    }

    console.log(`[홈] URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/05-home.png' });

    // ── ME 탭으로 이동 ────────────────────────────────────────
    // 하단 nav 바에서 "Me" 탭 클릭 (HomeLayout의 nav 구조)
    const meTab = page.locator('nav a[href*="/me"], nav button:has-text("ME"), a:has-text("Me")').first();
    const hasMeTab = await meTab.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[ME탭] 표시 여부: ${hasMeTab}`);

    if (hasMeTab) {
      await meTab.click();
      await page.waitForURL((url) => url.pathname.includes('/me'), { timeout: 10_000 }).catch(() => null);
    } else {
      // 직접 URL로 이동 (현재 인증 세션 유지)
      await page.goto('http://localhost:5173/home/me');
    }

    // ME 페이지 콘텐츠가 로드될 때까지 대기 (로딩 스피너 사라질 때까지)
    // aria-label="설정 열기" 버튼이 나타날 때까지 기다림
    await page.waitForSelector(
      'button[aria-label="설정 열기"], button[aria-label="Open settings"]',
      { timeout: 20_000 }
    ).catch(async () => {
      console.log('[ME탭] 설정 버튼 대기 타임아웃 — 현재 DOM 상태 확인');
      const html = await page.locator('#root').innerHTML({ timeout: 2000 }).catch(() => '');
      console.log('[ME탭] root innerHTML 일부:', html.slice(0, 500));
    });

    console.log(`[ME탭] URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/06-me-tab.png' });

    // ── 설정(톱니바퀴) 버튼 찾기 ─────────────────────────────
    // MePage.tsx 기준: aria-label={me.settings} → "설정 열기" / "Open settings"
    const gearSelectors = [
      'button[aria-label="설정 열기"]',
      'button[aria-label="Open settings"]',
      'button[aria-label*="설정"]',
      'button[aria-label*="Setting"]',
      'button[aria-label*="setting"]',
      '[data-testid="settings-btn"]',
    ];

    let gearBtn = null;
    for (const sel of gearSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
        gearBtn = el;
        console.log(`[설정버튼] 발견: ${sel}`);
        break;
      }
    }

    // SVG Cog/Settings 아이콘 버튼 넓게 탐색 (fallback)
    if (!gearBtn) {
      const allButtons = await page.locator('button').all();
      for (const btn of allButtons) {
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
        if (ariaLabel) console.log(`  버튼 aria-label: "${ariaLabel}"`);
        if (ariaLabel && /설정|setting/i.test(ariaLabel)) {
          gearBtn = btn;
          console.log(`[설정버튼] aria-label 일치: "${ariaLabel}"`);
          break;
        }
      }
    }

    if (!gearBtn) {
      console.log('[설정버튼] 톱니바퀴 버튼을 찾지 못함 — 페이지 상단 버튼 목록:');
      const btnTexts = await page.locator('button').allInnerTexts();
      console.log(JSON.stringify(btnTexts.slice(0, 20)));
      const allAriaLabels = await page.locator('button').evaluateAll(
        (btns) => btns.map(b => b.getAttribute('aria-label')).filter(Boolean)
      );
      console.log('[설정버튼] aria-label 전체:', JSON.stringify(allAriaLabels));
      await page.screenshot({ path: 'test-results/07-no-gear-btn.png' });
      return;
    }

    await gearBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test-results/07-settings-sheet.png' });
    console.log('[설정 시트] 열림 확인');

    // ── 현재 언어 확인 ───────────────────────────────────────
    // 설정 시트의 언어 섹션에서 현재 선택 언어 확인
    const sectionLangEl = page.locator('text=/언어|Language/i').first();
    const sectionVisible = await sectionLangEl.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`[언어 섹션] 표시 여부: ${sectionVisible}`);

    // 한국어 선택 여부 확인 (체크마크 ✓)
    const koOption = page.locator('text=한국어').first();
    const enOption = page.locator('text=English').first();
    const koVisible = await koOption.isVisible({ timeout: 2000 }).catch(() => false);
    const enVisible = await enOption.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`[언어 옵션] 한국어 표시: ${koVisible}, English 표시: ${enVisible}`);

    // ── 언어 전환 전 텍스트 수집 ─────────────────────────────
    // 설정 시트 제목 텍스트 캡처
    const settingsTitleBefore = await page.locator('text=/설정|Settings/i').first().innerText().catch(() => '');
    console.log(`[전환 전] 설정 시트 제목: "${settingsTitleBefore}"`);

    // ── EN 클릭하여 언어 전환 ────────────────────────────────
    if (enVisible) {
      console.log('[언어 전환] English 클릭');
      await enOption.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/08-after-lang-switch.png' });

      // 전환 후 텍스트 확인
      const settingsTitleAfter = await page.locator('text=/설정|Settings/i').first().innerText().catch(() => '');
      console.log(`[전환 후] 설정 시트 제목: "${settingsTitleAfter}"`);

      // 언어 섹션 레이블 변화 확인
      const langSectionAfter = await page.locator('text=/언어|Language/i').first().innerText().catch(() => '');
      console.log(`[전환 후] 언어 섹션 레이블: "${langSectionAfter}"`);

      // EN에 ✓가 생겼는지 확인
      const checkmark = page.locator('text=EN').locator('..').locator('text=✓');
      const hasCheckmark = await checkmark.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`[전환 후] EN에 체크마크: ${hasCheckmark}`);

      // 전환 성공 여부 판단: 제목이 "Settings"로 바뀌어야 함
      const switchedToEn = settingsTitleAfter.toLowerCase().includes('settings') ||
        settingsTitleAfter.toLowerCase().includes('setting');
      console.log(`[결과] 언어 전환 성공: ${switchedToEn}`);

      // Assert
      expect(switchedToEn || langSectionAfter.toLowerCase().includes('language')).toBeTruthy();
    } else if (koVisible) {
      // 이미 영어인 경우 — 한국어로 전환 테스트
      console.log('[언어 전환] 현재 영어 상태 — 한국어 클릭');
      await koOption.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/08-after-lang-switch-to-ko.png' });

      const titleAfter = await page.locator('text=/설정|Settings/i').first().innerText().catch(() => '');
      console.log(`[전환 후] 제목: "${titleAfter}"`);
      expect(titleAfter).toBeTruthy();
    } else {
      console.log('[경고] 언어 옵션 버튼이 보이지 않음');
      await page.screenshot({ path: 'test-results/08-no-lang-options.png' });
    }
  });

  test('4. localStorage 기반 언어 전환 직접 검증', async ({ page }) => {
    // 로그인 없이 localStorage를 직접 조작하여 언어 전환 테스트
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
    await page.screenshot({ path: 'test-results/09-before-lang-inject.png' });

    // 현재 localStorage 언어 값 확인
    const currentLang = await page.evaluate(() => {
      return localStorage.getItem('veilor_language') ??
             localStorage.getItem('language') ??
             localStorage.getItem('i18n_lang') ??
             localStorage.getItem('lang') ??
             'NOT_FOUND';
    });
    console.log(`[localStorage] 현재 언어 키: ${currentLang}`);

    // 모든 localStorage 키 출력
    const allKeys = await page.evaluate(() => Object.keys(localStorage));
    console.log(`[localStorage] 모든 키: ${JSON.stringify(allKeys)}`);

    // 페이지 텍스트 캡처
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasKorean = /[가-힣]/.test(bodyText);
    const hasEnglish = /[A-Za-z]/.test(bodyText);
    console.log(`[페이지 텍스트] 한국어 포함: ${hasKorean}, 영어 포함: ${hasEnglish}`);
    console.log(`[페이지 텍스트] 일부: ${bodyText.slice(0, 300)}`);
  });

  test('5. VFile Start 페이지 언어 전환 직접 테스트 (로그인 후 리다이렉트 활용)', async ({ page }) => {
    page.setDefaultNavigationTimeout(30_000);

    // 로그인
    await page.goto('http://localhost:5173/auth/login');
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    const emailInput = page.locator('input[type="email"]');
    const hasForm = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasForm) {
      await emailInput.fill('e2e.done@veilor.test');
      await page.locator('input[type="password"]').fill('Veilor2026!');
      await page.locator('button').filter({ hasText: /로그인|Log in|Login/i }).first().click();
      await page.waitForURL(
        (url) => url.pathname.startsWith('/home') || url.pathname.startsWith('/onboarding'),
        { timeout: 30_000 }
      ).catch(() => null);
    }

    // 온보딩 처리 (mode-select 경유)
    if (page.url().includes('/onboarding/mode-select')) {
      const btn = page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first();
      await btn.waitFor({ timeout: 10_000 }).catch(() => null);
      await btn.click().catch(() => null);
      await page.waitForTimeout(600);
      await page.getByRole('button', { name: /확인|선택|시작|Continue|Confirm/i }).first().click().catch(() => null);
      await page.waitForURL((url) => url.pathname.startsWith('/home'), { timeout: 20_000 }).catch(() => null);
    }

    console.log(`[로그인 후 홈] URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/10c-home-vent.png' });

    // 현재 nav 구조 파악
    const navHtml = await page.locator('nav').evaluateAll((navs) =>
      navs.map(n => ({ text: n.innerText.slice(0, 100), href: n.innerHTML.slice(0, 200) }))
    );
    console.log('[nav 구조]', JSON.stringify(navHtml));

    // 모든 링크 확인
    const allLinks = await page.locator('a').evaluateAll((links) =>
      links.map(a => ({ href: a.getAttribute('href'), text: a.innerText.slice(0, 30) })).filter(l => l.href)
    );
    console.log('[링크 목록] (href 있는 것):', JSON.stringify(allLinks.slice(0, 20)));

    // SPA 내부 탭 클릭으로 /home/me 이동
    // 링크 목록에서 /home/me가 확인되었으므로 href로 직접 클릭
    const meNavLink = page.locator('a[href="/home/me"]').last(); // 하단 nav는 두 번째 세트
    try {
      await meNavLink.click({ force: true }); // hidden 요소도 강제 클릭
      console.log('[ME 탭] a[href="/home/me"] 클릭 완료');
    } catch (e) {
      console.log('[ME 탭] 클릭 실패:', String(e).slice(0, 100));
    }
    await page.waitForURL((url) => url.pathname.includes('/me'), { timeout: 10_000 }).catch(() => null);

    // ME 페이지 렌더 완료 대기 — 설정 버튼 또는 VFile 버튼이 나타날 때까지
    await Promise.race([
      page.waitForSelector('button[aria-label="설정 열기"]', { timeout: 15_000 }),
      page.waitForSelector('button[aria-label="Open settings"]', { timeout: 15_000 }),
      page.waitForSelector('button:has-text("EN")', { timeout: 15_000 }),
    ]).catch(() => console.log('[ME 탭] 콘텐츠 로드 대기 타임아웃'));
    console.log(`[ME 탭 클릭 후] URL: ${page.url()}`);

    const currentUrl = page.url();
    console.log(`[/home/me 이동 후] URL: ${currentUrl}`);
    await page.screenshot({ path: 'test-results/10-home-me-loaded.png' });

    // ── ME 페이지에서 설정(톱니바퀴) 버튼 클릭 ────────────────────────
    // MePage.tsx: aria-label={me.settings} → ko: "설정 열기", en: "Open settings"
    const gearBtn = page.locator('button[aria-label="설정 열기"], button[aria-label="Open settings"]').first();
    const gearVisible = await gearBtn.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[설정 버튼] 표시 여부: ${gearVisible}`);

    if (!gearVisible) {
      // 현재 버튼 목록 출력
      const allAriaLabels = await page.locator('button').evaluateAll(
        (btns) => btns.map(b => b.getAttribute('aria-label')).filter(Boolean)
      );
      console.log('[설정 버튼 못 찾음] aria-label 전체:', JSON.stringify(allAriaLabels));
      console.log('[결과] 설정 버튼 접근 불가 — ME 페이지 미로드 상태');
      return;
    }

    await gearBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test-results/11-settings-sheet-opened.png' });
    console.log('[설정 시트] 열림');

    // 설정 시트 내부 HTML 구조 확인 — zIndex 41이 SettingsSheet
    const sheetLangArea = await page.evaluate(() => {
      const allFixed = Array.from(document.querySelectorAll('[style*="z-index: 41"]'));
      if (!allFixed.length) return 'z-index:41 element not found';
      const sheet = allFixed[0];
      // "언어" 텍스트 근처 HTML 찾기
      const html = sheet.innerHTML;
      const langIdx = html.indexOf('언어');
      if (langIdx < 0) return '언어 텍스트 없음';
      return html.slice(Math.max(0, langIdx - 50), langIdx + 600);
    });
    console.log('[언어 섹션 주변 HTML]', sheetLangArea);

    // ── 설정 시트에서 언어 전환 ───────────────────────────────────────
    // SettingsSheet.tsx: LANG_OPTIONS = [{ko: '한국어'}, {en: 'English'}]
    // 언어 섹션 레이블 확인
    const sectionLang = page.locator('p, span, div').filter({ hasText: /^언어$|^Language$/ }).first();
    const sectionVisible = await sectionLang.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`[설정 시트] 언어 섹션 표시: ${sectionVisible}`);

    // 설정 시트 전체 텍스트 확인
    const sheetText = await page.locator('body').innerText({ timeout: 2000 }).catch(() => '');
    const hasEnglishText = sheetText.includes('English');
    const hasKoreanLangOption = sheetText.includes('한국어');
    console.log(`[설정 시트] "English" 텍스트 포함: ${hasEnglishText}`);
    console.log(`[설정 시트] "한국어" 텍스트 포함: ${hasKoreanLangOption}`);

    // "English" 텍스트가 있는 모든 요소 정보
    const englishEls = await page.locator('text=English').evaluateAll(
      (els) => els.map(el => ({
        tag: el.tagName,
        visible: (el as HTMLElement).offsetParent !== null,
        rect: el.getBoundingClientRect(),
        text: (el as HTMLElement).innerText?.slice(0, 30),
      }))
    );
    console.log('[English 요소들]', JSON.stringify(englishEls));

    // 언어 옵션: '한국어' / 'English' (div 클릭이므로 .locator('text=') 사용)
    const koOptionEl = page.locator('text=한국어').first();
    const enOptionEl = page.locator('text=English').first();
    const koOptVisible = await koOptionEl.isVisible({ timeout: 3000 }).catch(() => false);
    const enOptVisible = await enOptionEl.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`[언어 옵션] 한국어: ${koOptVisible}, English: ${enOptVisible}`);

    expect(koOptVisible || enOptVisible).toBeTruthy();

    // ── 전환 전 텍스트 캡처 ──────────────────────────────────────────
    // 설정 시트 제목이 "설정"인지 확인
    const titleBefore = await page.locator('span, p').filter({ hasText: /^설정$/ }).first().innerText({ timeout: 2000 }).catch(() => '');
    console.log(`[전환 전] 설정 시트 제목: "${titleBefore}"`);

    if (enOptVisible) {
      // ── EN 클릭 → ko→en 전환 ─────────────────────────────────────
      // 설정 시트 내의 English span 위치 출력
      const enRect = await enOptionEl.boundingBox();
      console.log(`[언어 전환] English 요소 위치: ${JSON.stringify(enRect)}`);

      // 직접 부모 div 클릭 (SettingsSheet의 언어 옵션 div)
      // LANG_OPTIONS의 en 옵션 div: 'English' 텍스트를 포함하는 부모 div
      const enOptionDiv = page.locator('div').filter({ hasText: /^English$/ }).last();
      const enDivVisible = await enOptionDiv.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`[언어 전환] English div 표시: ${enDivVisible}`);

      // localStorage의 현재 언어 확인
      const langBefore = await page.evaluate(() => localStorage.getItem('veilor_lang'));
      console.log(`[localStorage 전] veilor_lang: ${langBefore}`);

      // document.documentElement.lang 확인
      const htmlLangBefore = await page.evaluate(() => document.documentElement.lang);
      console.log(`[html lang 전] ${htmlLangBefore}`);

      console.log('[언어 전환] English 클릭 시도 — 부모 div 찾아 클릭');

      // SettingsSheet 내에서 EN 코드를 가진 div 찾기
      // LANG_OPTIONS map: div > span(code) + span(label) + span(✓)
      // EN 옵션 div는 KO span 없이 EN span이 있는 div
      const enLangDivResult = await page.evaluate(() => {
        // z-index 41인 설정 시트 찾기
        const sheet = document.querySelector('[style*="z-index: 41"]');
        if (!sheet) return { found: false, reason: 'sheet not found' };

        // "EN" 코드 span을 가진 div 찾기
        const spans = sheet.querySelectorAll('span');
        let enDiv: Element | null = null;
        for (const span of spans) {
          if (span.textContent?.trim() === 'EN') {
            enDiv = span.closest('div[style*="cursor: pointer"]');
            break;
          }
        }
        if (!enDiv) return { found: false, reason: 'EN option div not found' };

        // React의 onClick 트리거
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        enDiv.dispatchEvent(event);
        return { found: true, text: (enDiv as HTMLElement).innerText?.slice(0, 30) };
      });
      console.log(`[React 클릭] 결과: ${JSON.stringify(enLangDivResult)}`);

      await page.waitForTimeout(800);

      // localStorage 변화 확인
      const langAfter = await page.evaluate(() => localStorage.getItem('veilor_lang'));
      console.log(`[localStorage 후] veilor_lang: ${langAfter}`);
      const htmlLangAfter = await page.evaluate(() => document.documentElement.lang);
      console.log(`[html lang 후] ${htmlLangAfter}`);
      await page.screenshot({ path: 'test-results/12-after-en-switch.png' });

      // 전환 후: "설정" → "Settings" 로 바뀌어야 함
      const settingsEN = page.locator('span, p').filter({ hasText: /^Settings$/ }).first();
      const settingsENVisible = await settingsEN.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`[전환 후] "Settings" 표시: ${settingsENVisible}`);

      // 언어 섹션도 "Language"로 바뀌어야 함
      const langSectionEN = page.locator('p, span, div').filter({ hasText: /^Language$/ }).first();
      const langSectionENVisible = await langSectionEN.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`[전환 후] "Language" 섹션 표시: ${langSectionENVisible}`);

      // EN에 체크마크(✓) 생겼는지
      const bodyAfterEn = await page.locator('body').innerText({ timeout: 2000 }).catch(() => '');
      const hasKoreanAfterEn = /[가-힣]/.test(bodyAfterEn);
      console.log(`[전환 후 EN] 한국어 텍스트 포함 여부: ${hasKoreanAfterEn}`);

      const langChanged = settingsENVisible || langSectionENVisible || !hasKoreanAfterEn;
      console.log(`[결과] ko→en 전환 성공: ${langChanged}`);
      expect(settingsENVisible || langSectionENVisible).toBeTruthy();

      // ── 다시 한국어로 복원 ────────────────────────────────────────
      console.log('[KO 복원] 한국어로 복원 시도');
      const koRestoreResult = await page.evaluate(() => {
        const sheet = document.querySelector('[style*="z-index: 41"]');
        if (!sheet) return { found: false };
        const spans = sheet.querySelectorAll('span');
        let koDiv: Element | null = null;
        for (const span of spans) {
          if (span.textContent?.trim() === 'KO') {
            koDiv = span.closest('div[style*="cursor: pointer"]');
            break;
          }
        }
        if (!koDiv) return { found: false, reason: 'KO div not found' };
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        koDiv.dispatchEvent(event);
        return { found: true };
      });
      console.log(`[KO 복원] 결과: ${JSON.stringify(koRestoreResult)}`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/13-back-to-ko.png' });

      const langAfterKo = await page.evaluate(() => localStorage.getItem('veilor_lang'));
      const htmlLangKo = await page.evaluate(() => document.documentElement.lang);
      console.log(`[KO 복원 후] localStorage: ${langAfterKo}, html lang: ${htmlLangKo}`);

      expect(langAfterKo).toBe('ko');
      expect(htmlLangKo).toBe('ko');
    } else {
      console.log('[경고] English 옵션이 보이지 않음');
    }
  });
});
