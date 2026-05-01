#!/usr/bin/env python3
"""
OpenAlex API로 성생활·건강 관계 논문 수집 → D3-021 도메인 → chunk + vectorize.
"섹스가 건강에 미치는 영향" 전방위 수집.
"""
import os, sys, json, time
import urllib.request, urllib.error, urllib.parse

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")

OA_BASE = "https://api.openalex.org/works"
OA_MAILTO = "lizbirkincho@gmail.com"
VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"

DOMAIN_CODE = "D3-021"
TARGET = 50
MIN_ABSTRACT_LEN = 800
REQUEST_DELAY = 1.0

# (query, title_must_contain 중 하나) 튜플
# "sex differences" 노이즈 차단 → "sexual intercourse/activity/frequency/satisfaction" 특화 쿼리
QUERIES = [
    ("sexual intercourse frequency health outcomes wellbeing",
     ["sexual intercourse", "sexual frequency", "intercourse frequency", "coital frequency"]),
    ("sexual activity health benefits cardiovascular physical",
     ["sexual activity", "sexual intercourse", "coital activity"]),
    ("orgasm health benefits physiological psychological wellbeing",
     ["orgasm", "orgasmic"]),
    ("sexual satisfaction wellbeing mental health longitudinal",
     ["sexual satisfaction", "sexual wellbeing", "sexual well-being"]),
    ("sexual intimacy health outcomes aging older adults",
     ["sexual activity", "sexual intimacy", "sexual intercourse", "coital"]),
    ("masturbation psychological health benefits",
     ["masturbation", "self-stimulation", "autoeroticism"]),
    ("sexual activity sleep quality stress cortisol reduction",
     ["sexual activity", "sexual intercourse", "coital", "orgasm"]),
    ("sexual activity pain analgesic oxytocin endorphin",
     ["sexual activity", "sexual intercourse", "orgasm"]),
    ("lovemaking physical mental health benefits",
     ["sexual activity", "sexual intercourse", "lovemaking", "coitus"]),
    ("coitus health benefit psychological physical",
     ["coitus", "coital", "sexual intercourse", "sexual activity"]),
]

# abstract에 반드시 있어야 할 건강 효과 키워드
HEALTH_BENEFIT_KEYWORDS = {
    "benefit", "wellbeing", "well-being", "mental health",
    "physical health", "cardiovascular", "immune", "sleep", "stress",
    "cortisol", "oxytocin", "pain", "longevity", "quality of life",
    "happiness", "protective", "reduce", "improve", "positive effect",
    "health outcome", "psychological health", "physical health",
}

# 제목에 이 단어들이 주제로 등장하면 제외 (생물학적 성별 차이 논문 필터)
EXCLUDE_TITLE_KEYWORDS = [
    "sex difference", "sex-based", "sex-specific", "biological sex",
    "gender difference", "male vs female", "men vs women",
    "violence", "abuse", "assault", "rape", "coercion", "trauma",
    "hiv", "std", "sti", "infection", "contraception", "pregnancy",
    "cancer", "alzheimer", "diabetes", "hormone therapy", "erectile dysfunction",
    "disability", "chromosome", "sex ratio", "sex hormone", "steroid",
]


def reconstruct_abstract(inverted_index):
    if not inverted_index:
        return ""
    positions = {}
    for word, pos_list in inverted_index.items():
        for pos in pos_list:
            positions[pos] = word
    if not positions:
        return ""
    return " ".join(positions[i] for i in sorted(positions))


def is_relevant(abstract, title):
    title_lower = title.lower()
    ab_lower = abstract.lower()
    # 제외 키워드 체크 (생물학적 성별 차이 논문 등)
    if any(kw in title_lower for kw in EXCLUDE_TITLE_KEYWORDS):
        return False
    # abstract에 성관계 관련 표현이 반드시 있어야 함
    sex_act_terms = [
        "sexual intercourse", "sexual activity", "sexual frequency",
        "coital", "coitus", "orgasm", "sexual satisfaction",
        "masturbation", "lovemaking", "sexual intimacy",
    ]
    if not any(t in ab_lower for t in sex_act_terms):
        return False
    # 건강 효과 키워드 최소 1개
    if not any(kw in ab_lower for kw in HEALTH_BENEFIT_KEYWORDS):
        return False
    return True


def oa_search(query, per_page=25, cursor="*"):
    params = {
        "search": query,
        "filter": "is_oa:true,has_abstract:true,primary_topic.field.id:17|27|36",
        "select": "id,title,authorships,publication_year,primary_location,abstract_inverted_index",
        "per-page": per_page,
        "cursor": cursor,
        "mailto": OA_MAILTO,
    }
    url = f"{OA_BASE}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        if e.code == 429:
            print("    OA rate limit — 30초 대기")
            time.sleep(30)
        else:
            print(f"    OA error: {e.code}")
        return None
    except Exception as e:
        print(f"    OA error: {e}")
        return None


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
        return e.code, {}


def get_existing_external_ids():
    status, data = sb_request("GET", "psych_papers?select=external_id&limit=10000")
    if status == 200 and isinstance(data, list):
        return {r["external_id"] for r in data if r.get("external_id")}
    return set()


def insert_paper(paper_data):
    status, resp = sb_request("POST", "psych_papers", paper_data,
                              {"Prefer": "return=representation"})
    if status in (200, 201) and isinstance(resp, list) and resp:
        return resp[0]["id"]
    return None


def embed_and_insert(paper_id, abstract, model):
    # 청크 INSERT
    status, _ = sb_request("POST", "psych_paper_chunks", {
        "paper_id": paper_id,
        "chunk_index": 0,
        "chunk_type": "abstract",
        "content": abstract,
        "domain_codes": [DOMAIN_CODE],
        "token_count": len(abstract) // 4,
        "vectorized": False,
    }, {"Prefer": "return=minimal"})
    if status not in (200, 201):
        return False

    # 청크 ID 조회
    status, chunks = sb_request("GET",
        f"psych_paper_chunks?select=id&paper_id=eq.{paper_id}&limit=1")
    if status != 200 or not chunks:
        return False
    chunk_id = chunks[0]["id"]

    # 로컬 임베딩
    vec = model.encode([abstract[:512]], show_progress_bar=False)[0].tolist()
    if len(vec) != 1024:
        return False

    # Vectorize upsert
    data = json.dumps({"vectors": [{
        "id": chunk_id, "values": vec,
        "metadata": {"paper_id": paper_id, "domain_codes": [DOMAIN_CODE]},
    }]}).encode()
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            ok = r.status in (200, 201)
    except Exception:
        ok = False

    if ok:
        sb_request("PATCH", f"psych_paper_chunks?id=eq.{chunk_id}",
                   {"vectorized": True}, {"Prefer": "return=minimal"})
    return ok


def process_work(work, existing_ids, title_must, model):
    oa_id = work.get("id", "")
    external_id = oa_id.replace("https://openalex.org/", "oa-")
    if not external_id or external_id in existing_ids:
        return "dup"

    title = (work.get("title") or "").strip()
    if not title:
        return "no_title"

    # title 키워드 필터
    title_lower = title.lower()
    if not any(kw.lower() in title_lower for kw in title_must):
        return "title_miss"

    abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
    if len(abstract) < MIN_ABSTRACT_LEN:
        return "short"

    if not is_relevant(abstract, title):
        return "off_topic"

    authors = [
        a.get("author", {}).get("display_name", "")
        for a in (work.get("authorships") or [])[:5]
    ]
    year = work.get("publication_year")
    loc = work.get("primary_location") or {}
    source = loc.get("source") or {}
    journal = source.get("display_name", "") if isinstance(source, dict) else ""
    pdf_url = loc.get("pdf_url") if isinstance(loc, dict) else None

    paper_data = {
        "source": "openalex",
        "external_id": external_id,
        "title": title,
        "authors": authors,
        "year": year,
        "journal": journal or None,
        "abstract": abstract,
        "pdf_url": str(pdf_url) if pdf_url else None,
        "open_access": True,
        "domain_codes": [DOMAIN_CODE],
        "language": "en",
        "status": "pending",
    }

    inserted_id = insert_paper(paper_data)
    if not inserted_id:
        return "insert_fail"

    existing_ids.add(external_id)
    ok = embed_and_insert(inserted_id, abstract, model)
    return "ok_vectorized" if ok else "ok_no_vec"


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정"); sys.exit(1)
    if not CF_ACCOUNT_ID or not CF_API_TOKEN:
        print("ERROR: CF_ACCOUNT_ID / CF_API_TOKEN 미설정"); sys.exit(1)

    print("KURE-v1 로컬 모델 로드 중...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("nlpai-lab/KURE-v1")
    print(f"모델 로드 완료 (dim={model.get_sentence_embedding_dimension()})\n")

    print("기존 논문 ID 로딩...")
    existing_ids = get_existing_external_ids()
    print(f"  기존 논문: {len(existing_ids)}편\n")

    total_inserted = 0
    total_vectorized = 0

    print(f"[{DOMAIN_CODE}] 성생활·건강 관계 논문 수집 (목표: {TARGET}편)")

    for query, title_must in QUERIES:
        if total_inserted >= TARGET:
            break

        print(f"\n  검색: \"{query}\"")
        cursor = "*"

        while total_inserted < TARGET:
            result = oa_search(query, per_page=25, cursor=cursor)
            if not result:
                break

            works = result.get("results", [])
            if not works:
                break

            for w in works:
                if total_inserted >= TARGET:
                    break
                status = process_work(w, existing_ids, title_must, model)
                if status == "ok_vectorized":
                    total_inserted += 1
                    total_vectorized += 1
                    print(f"    ✓ [{total_inserted}/{TARGET}] {w.get('title','')[:65]}")
                elif status == "ok_no_vec":
                    total_inserted += 1
                    print(f"    ○ [{total_inserted}/{TARGET}] {w.get('title','')[:65]} (미벡터화)")
                elif status in ("dup", "short", "title_miss", "off_topic", "no_title"):
                    pass
                else:
                    print(f"    ✗ {status}: {w.get('title','')[:40]}")

            next_cursor = result.get("meta", {}).get("next_cursor")
            if not next_cursor or total_inserted >= TARGET:
                break
            cursor = next_cursor
            time.sleep(REQUEST_DELAY)

    print(f"\n{'='*50}")
    print(f"완료: 수집={total_inserted}편, 벡터화={total_vectorized}편 [{DOMAIN_CODE}]")


if __name__ == "__main__":
    main()
