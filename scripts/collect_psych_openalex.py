#!/usr/bin/env python3
"""
OpenAlex API로 P 도메인 심리 논문 수집 → psych_papers INSERT → chunk + vectorize.
오픈액세스 우선, abstract 800자 이상 필터링.
"""
import os, sys, json, time, re
import urllib.request, urllib.error, urllib.parse

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")

OA_BASE = "https://api.openalex.org/works"
OA_MAILTO = "lizbirkincho@gmail.com"
VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"

TARGET_PER_DOMAIN = 30
MIN_ABSTRACT_LEN = 800
REQUEST_DELAY = 1.0

# P6-001만 재수집 (무관 논문 필터 적용)
# (query, title_must_contain) 튜플 리스트 — title_must_contain 중 하나라도 title에 있어야 통과
DOMAIN_QUERIES = {
    "P6-001": [
        ("meaning in life purpose psychological wellbeing", ["meaning in life", "purpose in life", "meaning-making"]),
        ("identity formation self-concept psychological development", ["identity", "self-concept", "self concept"]),
        ("existential psychology therapy crisis counseling", ["existential", "meaning", "identity", "purpose"]),
        ("narrative identity self psychological continuity", ["narrative identity", "self-narrative", "life story"]),
        ("self-determination theory autonomy psychological needs", ["self-determination", "autonomy", "identity"]),
        ("personal values authentic living psychotherapy", ["values", "authentic", "meaning", "identity"]),
        ("emerging adulthood identity exploration mental health", ["identity", "emerging adulthood", "self-concept"]),
    ],
}


def reconstruct_abstract(inverted_index):
    """OpenAlex inverted index → 문자열 변환"""
    if not inverted_index:
        return ""
    positions = {}
    for word, pos_list in inverted_index.items():
        for pos in pos_list:
            positions[pos] = word
    if not positions:
        return ""
    return " ".join(positions[i] for i in sorted(positions))


# OpenAlex field IDs: 17=Psychology, 27=Medicine, 36=Health Professions
PSYCH_FIELD_IDS = {"https://openalex.org/fields/17", "https://openalex.org/fields/27",
                   "https://openalex.org/fields/36"}

# abstract에 반드시 포함돼야 할 심리/임상 키워드 (최소 1개)
PSYCH_KEYWORDS = {
    "psychology", "psychological", "psychiatric", "psychotherapy", "therapy",
    "treatment", "disorder", "trauma", "depression", "anxiety", "ptsd",
    "attachment", "emotion", "mental health", "wellbeing", "well-being",
    "cognitive", "behavior", "behaviour", "clinical", "intervention",
    "grief", "bereavement", "identity", "self-concept", "meaning", "stress",
    "dissociation", "dysregulation", "symptom", "diagnosis", "resilience",
    "counseling", "counselling", "mindfulness", "self-esteem", "shame",
}


def oa_search(query, per_page=25, cursor="*"):
    params = {
        "search": query,
        # field 17=Psychology, 27=Medicine で絞る
        "filter": "is_oa:true,has_abstract:true,primary_topic.field.id:17|27|36",
        "select": "id,title,authorships,publication_year,primary_location,abstract_inverted_index,primary_topic",
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
            print(f"    OA rate limit — 30초 대기")
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
    status, data = sb_request("GET",
        "psych_papers?select=external_id&limit=5000")
    if status == 200 and isinstance(data, list):
        return {r["external_id"] for r in data if r.get("external_id")}
    return set()


def insert_paper(paper_data):
    status, resp = sb_request("POST", "psych_papers", paper_data,
                              {"Prefer": "return=representation"})
    if status in (200, 201) and isinstance(resp, list) and resp:
        return resp[0]["id"]
    return None


def insert_chunk(paper_id, content, domain_codes):
    status, _ = sb_request("POST", "psych_paper_chunks", {
        "paper_id": paper_id,
        "chunk_index": 0,
        "chunk_type": "abstract",
        "content": content,
        "domain_codes": domain_codes,
        "token_count": len(content) // 4,
        "vectorized": False,
    }, {"Prefer": "return=minimal"})
    return status in (200, 201)


def upsert_vectorize(chunk_id, vec, paper_id, domain_codes):
    data = json.dumps({"vectors": [{
        "id": chunk_id,
        "values": vec,
        "metadata": {"paper_id": paper_id, "domain_codes": domain_codes},
    }]}).encode()
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 201)
    except Exception:
        return False


def embed_and_insert(paper_id, abstract, domain_code, model):
    # 청크 INSERT
    if not insert_chunk(paper_id, abstract, [domain_code]):
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
    ok = upsert_vectorize(chunk_id, vec, paper_id, [domain_code])
    if ok:
        sb_request("PATCH", f"psych_paper_chunks?id=eq.{chunk_id}",
                   {"vectorized": True}, {"Prefer": "return=minimal"})
    return ok


def is_psych_relevant(abstract, title):
    """abstract + title에 심리학 키워드가 최소 1개 포함되는지 확인"""
    text = (abstract + " " + title).lower()
    return any(kw in text for kw in PSYCH_KEYWORDS)


def process_work(work, domain_code, existing_ids, model):
    oa_id = work.get("id", "")
    external_id = oa_id.replace("https://openalex.org/", "oa-")
    if not external_id or external_id in existing_ids:
        return "dup"

    abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
    if len(abstract) < MIN_ABSTRACT_LEN:
        return "short"

    title = (work.get("title") or "").strip()
    if not title:
        return "no_title"

    if not is_psych_relevant(abstract, title):
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
        "domain_codes": [domain_code],
        "language": "en",
        "status": "pending",
    }

    inserted_id = insert_paper(paper_data)
    if not inserted_id:
        return "insert_fail"

    existing_ids.add(external_id)

    ok = embed_and_insert(inserted_id, abstract, domain_code, model)
    return "ok_vectorized" if ok else "ok_no_vec"


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정"); sys.exit(1)
    if not CF_ACCOUNT_ID or not CF_API_TOKEN:
        print("ERROR: CF_ACCOUNT_ID / CF_API_TOKEN 미설정"); sys.exit(1)

    print("KURE-v1 로컬 모델 로드 중...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("nlpai-lab/KURE-v1")
    print(f"모델 로드 완료 (dim={model.get_sentence_embedding_dimension()})")

    print("\n기존 논문 ID 로딩...")
    existing_ids = get_existing_external_ids()
    print(f"  기존 논문: {len(existing_ids)}편\n")

    total_inserted = 0
    total_vectorized = 0

    for domain_code, queries in DOMAIN_QUERIES.items():
        print(f"\n{'='*50}")
        print(f"[{domain_code}] 수집 시작 (목표: {TARGET_PER_DOMAIN}편)")
        domain_inserted = 0

        for query_item in queries:
            if domain_inserted >= TARGET_PER_DOMAIN:
                break

            # 튜플 (query, title_keywords) 또는 단순 문자열 지원
            if isinstance(query_item, tuple):
                query, title_must = query_item
            else:
                query, title_must = query_item, None

            print(f"  검색: \"{query}\"")
            cursor = "*"

            while domain_inserted < TARGET_PER_DOMAIN:
                result = oa_search(query, per_page=25, cursor=cursor)
                if not result:
                    break

                works = result.get("results", [])
                if not works:
                    break

                for w in works:
                    if domain_inserted >= TARGET_PER_DOMAIN:
                        break

                    # title 키워드 필터
                    if title_must:
                        title_lower = (w.get("title") or "").lower()
                        if not any(kw.lower() in title_lower for kw in title_must):
                            continue

                    status = process_work(w, domain_code, existing_ids, model)
                    if status == "ok_vectorized":
                        domain_inserted += 1
                        total_vectorized += 1
                        print(f"    ✓ [{domain_inserted}/{TARGET_PER_DOMAIN}] {w.get('title','')[:60]}")
                    elif status == "ok_no_vec":
                        domain_inserted += 1
                        print(f"    ○ [{domain_inserted}/{TARGET_PER_DOMAIN}] {w.get('title','')[:60]} (미벡터화)")
                    elif status in ("dup", "short", "no_title", "off_topic"):
                        pass
                    else:
                        print(f"    ✗ {status}: {w.get('title','')[:40]}")

                next_cursor = result.get("meta", {}).get("next_cursor")
                if not next_cursor or domain_inserted >= TARGET_PER_DOMAIN:
                    break
                cursor = next_cursor
                time.sleep(REQUEST_DELAY)

        total_inserted += domain_inserted
        print(f"  [{domain_code}] 완료: {domain_inserted}편")

    print(f"\n{'='*50}")
    print(f"전체 완료: 수집={total_inserted}편, 벡터화={total_vectorized}편")


if __name__ == "__main__":
    main()
