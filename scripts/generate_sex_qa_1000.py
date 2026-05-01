#!/usr/bin/env python3
"""
성 Q&A 1000개 생성 스크립트.
데이터는 scripts/sex_qa_data/ 디렉터리의 JSON 파일들에서 읽는다.
"""
import os, sys, json, time, glob
import urllib.request, urllib.error

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")
VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"

DATA_DIR = os.path.join(os.path.dirname(__file__), "sex_qa_data")

CATEGORY_QUOTAS = {
    "성 불안": 60,
    "성욕·빈도 차이": 60,
    "자위": 80,
    "오르가즘": 80,
    "첫 경험·성 경험 없음": 60,
    "파트너와의 성적 소통": 80,
    "성적 지향·정체성": 80,
    "섹스와 건강": 80,
    "포르노·미디어": 60,
    "동의·경계": 80,
    "성과 관계": 60,
    "신체·해부학": 80,
    "BDSM·킨크": 40,
    "피임·임신": 40,
    "성병·위생": 40,
    "나이·생애주기": 40,
    "성과 정신건강": 60,
}


def sb_request(method, path, body=None, extra_headers=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Accept-Profile": "veilor",
        "Content-Profile": "veilor",
    }
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body else None
    if data:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            content = r.read()
            return r.status, json.loads(content) if content else []
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()[:300]
        return e.code, {"error": body_text}


def upsert_vectorize(vectors):
    data = json.dumps({"vectors": vectors}).encode()
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status in (200, 201)
    except Exception as e:
        print(f"  Vectorize error: {e}")
        return False


def load_existing_questions():
    status, resp = sb_request("GET", "sex_qa?select=question&limit=2000")
    if status != 200 or not isinstance(resp, list):
        print(f"기존 질문 로드 실패 [{status}]: {resp}")
        return set()
    return {r["question"].strip() for r in resp}


def load_all_data():
    files = sorted(glob.glob(os.path.join(DATA_DIR, "*.json")))
    if not files:
        print(f"ERROR: {DATA_DIR}/ 에 JSON 데이터 파일이 없습니다.")
        sys.exit(1)
    all_data = []
    for f in files:
        with open(f, encoding="utf-8") as fp:
            data = json.load(fp)
        all_data.extend(data)
        print(f"  로드: {os.path.basename(f)} → {len(data)}개")
    return all_data


def validate_data(all_data):
    cat_counts = {}
    for item in all_data:
        cat = item.get("category", "")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    print("\n[카테고리별 데이터 파일 수량]")
    total = 0
    ok = True
    for cat, quota in CATEGORY_QUOTAS.items():
        cnt = cat_counts.get(cat, 0)
        total += cnt
        status = "✓" if cnt >= quota else f"✗ (목표 {quota})"
        print(f"  {cat}: {cnt}개 {status}")
    print(f"  합계: {total}개\n")
    return total


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정"); sys.exit(1)

    print("=== 성 Q&A 1000개 생성 스크립트 ===\n")

    print("[1] 데이터 파일 로드 중...")
    all_data = load_all_data()
    total = validate_data(all_data)

    print("[2] 기존 질문 목록 로드 중...")
    existing = load_existing_questions()
    print(f"  기존 질문 수: {len(existing)}개\n")

    new_data = [q for q in all_data if q["question"].strip() not in existing]
    skipped = len(all_data) - len(new_data)
    if skipped:
        print(f"  중복 제거: {skipped}개 스킵\n")

    print(f"[3] 삽입 대상: {len(new_data)}개\n")

    if not CF_ACCOUNT_ID or not CF_API_TOKEN:
        print("WARNING: CF_ACCOUNT_ID / CF_API_TOKEN 미설정 — 벡터화 건너뜀")
        vectorize_enabled = False
    else:
        print("[4] KURE-v1 모델 로드 중...")
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("nlpai-lab/KURE-v1")
        print(f"  모델 로드 완료 (dim={model.get_sentence_embedding_dimension()})\n")
        vectorize_enabled = True

    BATCH = 20
    ok_count = 0
    fail_count = 0
    vec_fail = 0

    for i in range(0, len(new_data), BATCH):
        batch = new_data[i:i+BATCH]
        for j, qa in enumerate(batch):
            global_idx = i + j + 1
            row = {k: v for k, v in qa.items() if k in (
                "category", "question", "answer", "domain_codes", "tags",
                "user_persona", "persona_age_range", "persona_gender"
            )}
            status, resp = sb_request("POST", "sex_qa", row, {"Prefer": "return=representation"})
            if status not in (200, 201) or not isinstance(resp, list) or not resp:
                print(f"  FAIL [{status}] {qa['question'][:50]}: {resp}")
                fail_count += 1
                continue

            row_id = resp[0]["id"]
            ok_count += 1

            if vectorize_enabled:
                text = f"{qa['question']}\n{qa['answer']}"
                vec = model.encode([text[:512]], show_progress_bar=False)[0].tolist()
                v_ok = upsert_vectorize([{
                    "id": row_id,
                    "values": vec,
                    "metadata": {
                        "type": "sex_qa",
                        "category": qa["category"],
                        "domain_codes": qa.get("domain_codes", []),
                    },
                }])
                if v_ok:
                    sb_request("PATCH", f"sex_qa?id=eq.{row_id}", {"vectorized": True}, {"Prefer": "return=minimal"})
                else:
                    vec_fail += 1

            if global_idx % 50 == 0 or global_idx == len(new_data):
                print(f"  [{global_idx}/{len(new_data)}] 삽입 완료 ({ok_count}성공 / {fail_count}실패)")

    print(f"\n{'='*55}")
    print(f"완료 — 삽입: {ok_count}개, 실패: {fail_count}개, 벡터화 실패: {vec_fail}개")


if __name__ == "__main__":
    main()
