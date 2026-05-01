/**
 * S024: 기존 QA 시드 데이터 영어 번역 스크립트
 * 실행: npx tsx scripts/translate-seed-data.ts
 *
 * - codetalk_keywords, codetalk_entries, community_posts 에서 lang = 'ko' 행을 영어로 번역
 * - 번역 결과를 lang = 'en' 행으로 새로 삽입 (크레딧 차감 없음)
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { db: { schema: "veilor" } });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

async function translateText(text: string, targetLang: "en"): Promise<string> {
  const langName = targetLang === "en" ? "English" : "Korean";
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Translate to ${langName} naturally. Keep emotional tone and personal voice intact. Respond with only the translated text.\n\nText: ${text}`,
      },
    ],
  });
  return msg.content[0].type === "text" ? msg.content[0].text.trim() : text;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateCodetalkKeywords() {
  console.log("\n=== codetalk_keywords 번역 ===");

  // lang = 'ko' 인데 en 버전이 없는 키워드 찾기
  const { data: koRows } = await db
    .from("codetalk_keywords")
    .select("*")
    .eq("lang", "ko");

  if (!koRows?.length) {
    console.log("번역할 codetalk_keywords 없음");
    return;
  }

  // 이미 en 버전 존재하는 키워드 제외
  const { data: enRows } = await db
    .from("codetalk_keywords")
    .select("keyword")
    .eq("lang", "en");
  const enSet = new Set((enRows ?? []).map((r: { keyword: string }) => r.keyword));

  const toTranslate = koRows.filter((r) => !enSet.has(r.keyword));
  console.log(`번역 대상: ${toTranslate.length}개`);

  let count = 0;
  for (const row of toTranslate) {
    const descriptionEn = row.description
      ? await translateText(row.description, "en")
      : null;
    await db.from("codetalk_keywords").insert({
      ...row,
      id: undefined,
      lang: "en",
      description: descriptionEn,
    });
    count++;
    process.stdout.write(`\r  ${count}/${toTranslate.length}`);
    await sleep(300);
  }
  console.log(`\n완료: ${count}개 삽입`);
}

async function translateCodetalkEntries() {
  console.log("\n=== codetalk_entries 번역 ===");

  const { data: koRows } = await db
    .from("codetalk_entries")
    .select("*")
    .eq("lang", "ko")
    .eq("is_public", true)
    .limit(500);

  if (!koRows?.length) {
    console.log("번역할 codetalk_entries 없음");
    return;
  }

  console.log(`번역 대상: ${koRows.length}개`);
  let count = 0;

  for (const row of koRows) {
    const definition = row.definition
      ? await translateText(row.definition, "en")
      : null;
    const imprinting = row.imprinting_moment
      ? await translateText(row.imprinting_moment, "en")
      : null;
    const rootCause = row.root_cause
      ? await translateText(row.root_cause, "en")
      : null;

    await db.from("codetalk_entries").insert({
      ...row,
      id: undefined,
      lang: "en",
      definition,
      imprinting_moment: imprinting,
      root_cause: rootCause,
      created_at: undefined,
      updated_at: undefined,
    });
    count++;
    process.stdout.write(`\r  ${count}/${koRows.length}`);
    await sleep(400);
  }
  console.log(`\n완료: ${count}개 삽입`);
}

async function translateCommunityPosts() {
  console.log("\n=== community_posts 번역 ===");

  const { data: koRows } = await db
    .from("community_posts")
    .select("*")
    .eq("lang", "ko")
    .limit(200);

  if (!koRows?.length) {
    console.log("번역할 community_posts 없음");
    return;
  }

  console.log(`번역 대상: ${koRows.length}개`);
  let count = 0;

  for (const row of koRows) {
    const content = row.content
      ? await translateText(row.content, "en")
      : null;

    await db.from("community_posts").insert({
      ...row,
      id: undefined,
      lang: "en",
      content,
      created_at: undefined,
      updated_at: undefined,
    });
    count++;
    process.stdout.write(`\r  ${count}/${koRows.length}`);
    await sleep(400);
  }
  console.log(`\n완료: ${count}개 삽입`);
}

async function main() {
  console.log("S024 시드 데이터 번역 시작");
  await translateCodetalkKeywords();
  await translateCodetalkEntries();
  await translateCommunityPosts();
  console.log("\n전체 완료");
}

main().catch(console.error);
