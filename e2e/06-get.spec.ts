/**
 * E2E: GetPage
 * - 페이지 로드, 탭 전환 (정체성/Why/Ikigai/브랜드/관계)
 * - Ikigai 작성 → 저장
 * - Why 탭 진입
 * - 브랜드 탭 진입
 */
import { test, expect } from '@playwright/test';
import { login, waitForHome, TEST_USERS } from './helpers';

test.describe('GetPage', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.done.email, TEST_USERS.done.password);
    await waitForHome(page);
    await page.getByRole('link', { name: /Get/i }).click();
    await page.waitForURL(/\/home\/get/, { timeout: 5_000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('Get 페이지 로드 — 헤더 및 탭 확인', async ({ page }) => {
    await expect(page.getByText('나를 이루는 구조를 봐요.')).toBeVisible({ timeout: 5_000 });
    // 탭 5개 확인
    await expect(page.getByRole('button', { name: '정체성' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Why' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ikigai' })).toBeVisible();
    await expect(page.getByRole('button', { name: '브랜드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '관계' })).toBeVisible();
  });

  test('Why 탭 진입', async ({ page }) => {
    await page.getByRole('button', { name: 'Why' }).click();
    // WhyFlow 컴포넌트 로드 확인 (에러 없음)
    await page.waitForTimeout(1_500);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });

  test('Ikigai 탭 → 작성 폼 열기 → 저장', async ({ page }) => {
    await page.getByRole('button', { name: 'Ikigai' }).click();
    await page.waitForTimeout(1_000);

    // '아직 Ikigai를 작성하지 않았어요' 또는 이미 데이터 있음
    const hasWriteBtn = await page.getByRole('button', { name: 'Ikigai 작성하기' }).isVisible().catch(() => false);
    const hasEditBtn = await page.getByRole('button', { name: /편집|수정/i }).isVisible().catch(() => false);

    if (hasWriteBtn) {
      await page.getByRole('button', { name: 'Ikigai 작성하기' }).click();
    } else if (hasEditBtn) {
      await page.getByRole('button', { name: /편집|수정/i }).click();
    }

    // 폼이 열렸으면 첫 번째 필드에 입력
    const loveField = page.getByPlaceholder('내가 사랑하는 것 (한 줄씩 입력)');
    const isFormOpen = await loveField.isVisible().catch(() => false);

    if (isFormOpen) {
      await loveField.fill('글쓰기\n음악\n사람들과 연결');
      await page.getByPlaceholder('내가 잘하는 것').fill('분석\n공감\n기획');
      await page.getByRole('button', { name: '저장' }).click();
      // 저장 성공 toast 또는 폼 닫힘
      await page.waitForTimeout(1_500);
      const formStillOpen = await loveField.isVisible().catch(() => false);
      // 저장 후 폼이 닫히거나 Ikigai 뷰로 전환됨
      expect(formStillOpen).toBe(false);
    }
  });

  test('브랜드 탭 진입 — 컨텐츠 확인', async ({ page }) => {
    await page.getByRole('button', { name: '브랜드' }).click();
    await page.waitForTimeout(1_500);
    // 에러 없음 확인
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
    // 브랜드 탭 내용 — brand 없을 때 "AI로 브랜드 전략 생성" 버튼 또는 데이터 표시
    const hasAiBtn   = await page.getByRole('button', { name: /AI로 브랜드 전략 생성/i }).isVisible({ timeout: 3_000 }).catch(() => false);
    const hasEditBtn = await page.getByRole('button', { name: /수정|직접 작성/i }).first().isVisible({ timeout: 1_000 }).catch(() => false);
    const hasData    = await page.getByText(/브랜드 이름|태그라인|핵심 가치/i).first().isVisible({ timeout: 1_000 }).catch(() => false);
    expect(hasAiBtn || hasEditBtn || hasData).toBe(true);
  });

  test('관계 탭 진입 — CoupleAnalysis 로드', async ({ page }) => {
    await page.getByRole('button', { name: '관계' }).click();
    await page.waitForTimeout(1_500);
    const hasError = await page.getByText(/Something went wrong|연결 오류/i).isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});
