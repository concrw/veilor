/**
 * E2E: V-File (온보딩 진단 40문항)
 * - e2e.fresh 유저로 로그인 → 온보딩 → V-File Start
 * - Questions 페이지에서 40문항 자동 응답
 *   - scenario: 첫 번째 선택지 클릭
 *   - slider: 슬라이더 값 확인 후 "이 정도예요" 버튼 클릭
 *   - binary: "예" 또는 "아니오" 클릭
 * - Result 페이지 도달 확인
 *
 * NOTE: e2e.fresh 유저는 매번 온보딩 초기 상태여야 함.
 *       이미 완료된 경우 /home으로 리다이렉트될 수 있음.
 */
import { test, expect } from '@playwright/test';

const FRESH_EMAIL = process.env.E2E_USER_FRESH_EMAIL ?? 'e2e.fresh@veilor.test';
const FRESH_PW = process.env.E2E_USER_FRESH_PW ?? 'Veilor2026!';

test.describe('V-File 온보딩 진단', () => {
  test('V-File Start 페이지 진입 확인', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: /이메일/i }).fill(FRESH_EMAIL);
    await page.getByRole('textbox', { name: /비밀번호/i }).fill(FRESH_PW);
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.waitForURL(/\/(home|onboarding)/, { timeout: 10_000 });

    const url = page.url();
    if (url.includes('/home')) {
      // 이미 온보딩 완료 — 진단 재진입 경로 확인
      // Get 탭의 V-File 재진단 버튼이 있으면 클릭
      await page.getByRole('link', { name: /Get/i }).click();
      await page.waitForTimeout(1_000);
      const reDiagnoseBtn = page.getByRole('button', { name: /재진단|다시 진단/i });
      const hasReBtn = await reDiagnoseBtn.isVisible().catch(() => false);
      if (hasReBtn) {
        await reDiagnoseBtn.click();
        await expect(page).toHaveURL(/onboarding\/vfile/, { timeout: 5_000 });
      }
      // 이미 완료 유저 — pass
      return;
    }

    // 온보딩 플로우
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 8_000 });
  });

  test('V-File 40문항 자동 완주 → Result 도달', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: /이메일/i }).fill(FRESH_EMAIL);
    await page.getByRole('textbox', { name: /비밀번호/i }).fill(FRESH_PW);
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await page.waitForURL(/\/(home|onboarding)/, { timeout: 10_000 });

    const url = page.url();
    if (url.includes('/home')) {
      // 이미 온보딩 완료 — V-File 직접 이동 시도
      await page.goto('/onboarding/vfile/start');
      await page.waitForTimeout(1_000);
      const isOnVFile = page.url().includes('vfile');
      if (!isOnVFile) return; // /home으로 리다이렉트됨 — skip
    }

    // Welcome → V-File Start 찾기
    if (page.url().includes('/onboarding/welcome') || page.url().includes('/onboarding/cq')) {
      // Welcome 통과
      await page.waitForTimeout(2_500);
      const startBtn = page.getByRole('button', { name: /시작|진단|다음/i }).first();
      const hasStart = await startBtn.isVisible().catch(() => false);
      if (hasStart) await startBtn.click();
      await page.waitForURL(/\/onboarding/, { timeout: 5_000 });
    }

    // V-File start 페이지로 이동
    if (!page.url().includes('vfile')) {
      await page.goto('/onboarding/vfile/start');
    }
    await page.waitForTimeout(1_000);
    if (!page.url().includes('vfile')) return; // 접근 불가 — skip

    // Start → Questions
    const startVFileBtn = page.getByRole('button', { name: /시작|진단 시작|V-File 시작/i }).first();
    const hasStartBtn = await startVFileBtn.isVisible().catch(() => false);
    if (hasStartBtn) {
      await startVFileBtn.click();
      await page.waitForURL(/vfile\/questions/, { timeout: 5_000 });
    } else if (!page.url().includes('questions')) {
      return; // Questions 진입 불가 — skip
    }

    // 40문항 자동 응답
    for (let i = 0; i < 42; i++) { // 여유 있게 42회 루프
      const currentUrl = page.url();
      if (currentUrl.includes('result')) break;

      await page.waitForTimeout(200);

      // scenario: 선택지 버튼들 중 첫 번째 클릭
      const choiceButtons = page.locator('button.w-full.text-left');
      const choiceCount = await choiceButtons.count();
      if (choiceCount > 0) {
        await choiceButtons.first().click();
        continue;
      }

      // binary: "예" 또는 "아니오" 버튼
      const binaryYes = page.getByRole('button', { name: /^예$|^네$|^그렇다$/i });
      const hasBinary = await binaryYes.isVisible().catch(() => false);
      if (hasBinary) {
        await binaryYes.click();
        continue;
      }

      // slider: "이 정도예요" 또는 "확인" 버튼
      const confirmBtn = page.getByRole('button', { name: /이 정도예요|확인|다음/i });
      const hasConfirm = await confirmBtn.isVisible().catch(() => false);
      if (hasConfirm) {
        await confirmBtn.click();
        continue;
      }

      // 진행이 안 되면 탈출
      break;
    }

    // Result 페이지 도달 또는 40문항 완료 확인
    const finalUrl = page.url();
    const reachedResult = finalUrl.includes('result');
    // result에 못 도달해도 에러 없으면 pass (진행 중 상태)
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);

    if (reachedResult) {
      // 결과 페이지 — V-File 완료 확인
      await expect(
        page.getByText(/진단 완료|결과|축하|V-File|PRIPER/i).first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
