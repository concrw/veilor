#!/usr/bin/env python3
"""
Semantic Scholar API로 P 도메인 심리 논문 수집 → psych_papers INSERT → chunk + embed.
오픈액세스 우선, full text(abstract 2000자+) 기준으로 필터링.
"""
import os, sys, json, time, hashlib, re
import urllib.request, urllib.error, urllib.parse

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SS_API_KEY = os.environ.get("SEMANTIC_SCHOLAR_API_KEY", "")  # 없어도 동작 (rate limit 낮음)

SS_BASE = "https://api.semanticscholar.org/graph/v1"
FIELDS = "paperId,title,authors,year,journal,abstract,openAccessPdf,isOpenAccess"
TARGET_PER_DOMAIN = 30   # 도메인별 목표 논문 수
MIN_ABSTRACT_LEN = 800   # 최소 abstract 길이
REQUEST_DELAY = 3.5      # 요청 간 대기 (초) — rate limit 회피
MAX_RETRIES = 4          # 429 시 재시도 횟수

# P 도메인별 검색 쿼리
DOMAIN_QUERIES = {
    "P1-001": [
        "adult attachment security proximity seeking caregiving",
        "secure attachment style adult romantic relationship quality",
        "attachment behavioral system adult emotion regulation",
        "adult attachment interview secure autonomous AAI",
        "safe haven secure base adult partner attachment",
        "attachment theory romantic love pair bonding",
        "Hazan Shaver adult attachment romantic relationships",
    ],
    "P1-002": [
        "disorganized attachment adult relationship instability",
        "fearful avoidant attachment conflict intimacy",
        "repetition compulsion attachment trauma reenactment",
        "earned secure attachment recovery insecure childhood",
        "attachment style change therapy intervention adult",
        "preoccupied attachment hyperactivation adult relationships",
        "dismissing attachment deactivation emotion suppression",
    ],
    "P2-001": [
        "major depressive disorder psychotherapy outcome",
        "behavioral activation depression avoidance reward",
        "depressive episode somatic symptoms sleep appetite",
        "interpersonal therapy depression grief role transition",
        "mindfulness based cognitive therapy depression relapse",
        "antidepressant combined psychotherapy depression efficacy",
        "depression neural correlates treatment response fMRI",
    ],
    "P2-002": [
        "anxiety disorder generalized treatment CBT",
        "panic disorder hyperarousal exposure therapy",
        "worry anxiety intolerance uncertainty treatment",
    ],
    "P3-001": [
        "PTSD prevalence epidemiology trauma exposure population",
        "prolonged exposure therapy PTSD randomized trial",
        "cognitive processing therapy post traumatic stress",
        "trauma focused CBT PTSD children adults",
        "hypervigilance threat bias PTSD attention",
        "PTSD nightmares sleep disturbance treatment",
        "trauma narrative processing emotional memory PTSD",
        "EMDR eye movement desensitization reprocessing trauma",
        "somatic experiencing trauma body nervous system",
    ],
    "P3-002": [
        "complex PTSD ICD-11 disturbances self-organization",
        "childhood adversity dissociation adult psychopathology",
        "emotional dysregulation borderline personality trauma",
        "dissociative identity disorder structural dissociation",
        "complex trauma developmental neglect abuse sequelae",
        "affect regulation childhood maltreatment adult outcomes",
        "schema therapy early maladaptive schemas trauma",
        "dialectical behavior therapy emotion dysregulation",
        "polyvagal theory trauma autonomic nervous system",
    ],
    "P4-001": [
        "self-esteem shame self-compassion psychological wellbeing",
        "self-criticism perfectionism mental health",
        "toxic shame narcissism self-worth regulation",
    ],
    "P4-002": [
        "assertiveness training interpersonal effectiveness",
        "people pleasing approval seeking fawn response",
        "boundary setting healthy relationships therapy",
        "codependency enabling relationship dysfunction",
        "self-advocacy difficulty refusal social anxiety",
        "fawn trauma response appeasement survival",
    ],
    "P5-001": [
        "couples conflict communication emotionally focused therapy",
        "relationship satisfaction communication patterns",
        "pursue withdraw cycle couples therapy attachment",
    ],
    "P5-002": [
        "grief bereavement loss meaning reconstruction",
        "romantic relationship dissolution breakup adjustment",
        "prolonged grief disorder treatment intervention",
        "complicated bereavement loss rumination depression",
        "continuing bonds deceased loved one grief",
        "divorce adjustment coping resilience adults",
        "romantic loss self-concept reorganization recovery",
    ],
    "P6-001": [
        "identity formation meaning purpose life self-concept",
        "existential crisis midlife identity transition",
        "personal values authentic living psychological wellbeing",
        "narrative identity life story self-continuity",
        "self-determination autonomy competence relatedness wellbeing",
        "meaning in life eudaimonic flourishing purpose",
        "identity exploration commitment emerging adulthood",
    ],
}


def ss_search(query, limit=10, offset=0):
    params = urllib.parse.urlencode({
        "query": query,
        "fields": FIELDS,
        "limit": limit,
        "offset": offset,
    })
    url = f"{SS_BASE}/paper/search?{params}"
    headers = {"Accept": "application/json"}
    if SS_API_KEY:
        headers["x-api-key"] = SS_API_KEY

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 10 * (attempt + 1)
                print(f"    rate limit — {wait}초 대기 후 재시도...")
                time.sleep(wait)
            else:
                print(f"    SS API error: {e}")
                return None
        except Exception as e:
            print(f"    SS API error: {e}")
            return None
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
    """이미 DB에 있는 external_id 셋 반환 (중복 방지)"""
    status, data = sb_request("GET",
        "psych_papers?select=external_id&source=eq.semantic_scholar&limit=5000")
    if status == 200 and isinstance(data, list):
        return {r["external_id"] for r in data}
    return set()


def insert_paper(paper_data):
    status, resp = sb_request(
        "POST",
        "psych_papers",
        paper_data,
        {"Prefer": "return=representation"},
    )
    if status in (200, 201) and isinstance(resp, list) and resp:
        return resp[0]["id"]
    return None


def insert_chunk(paper_id, content, domain_codes):
    token_count = len(content) // 4
    status, _ = sb_request(
        "POST",
        "psych_paper_chunks",
        {
            "paper_id": paper_id,
            "chunk_index": 0,
            "chunk_type": "abstract",
            "content": content,
            "domain_codes": domain_codes,
            "token_count": token_count,
            "vectorized": False,
        },
        {"Prefer": "return=minimal"},
    )
    return status in (200, 201)


def embed_and_vectorize(paper_id, chunk_content, domain_codes, hf_key, cf_account, cf_token):
    """KURE-v1 임베딩 → Vectorize upsert → vectorized=true"""
    # 임베딩
    kure_url = "https://router.huggingface.co/hf-inference/models/nlpai-lab/KURE-v1"
    try:
        req = urllib.request.Request(
            kure_url,
            data=json.dumps({"inputs": chunk_content[:512], "options": {"wait_for_model": True}}).encode(),
            headers={"Authorization": f"Bearer {hf_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            raw = json.loads(r.read())
        vec = raw[0] if isinstance(raw[0], list) else raw
        if not (isinstance(vec, list) and len(vec) == 1024):
            return False
    except Exception as e:
        print(f"      embed error: {e}")
        return False

    # 청크 ID 조회
    status, chunks = sb_request("GET",
        f"psych_paper_chunks?select=id&paper_id=eq.{paper_id}&limit=1")
    if status != 200 or not chunks:
        return False
    chunk_id = chunks[0]["id"]

    # Vectorize upsert
    vurl = f"https://api.cloudflare.com/client/v4/accounts/{cf_account}/vectorize/v2/indexes/veilor-psych/upsert"
    try:
        req = urllib.request.Request(
            vurl,
            data=json.dumps({"vectors": [{
                "id": chunk_id,
                "values": vec,
                "metadata": {"paper_id": paper_id, "domain_codes": domain_codes},
            }]}).encode(),
            headers={"Authorization": f"Bearer {cf_token}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            if r.status not in (200, 201):
                return False
    except Exception as e:
        print(f"      vectorize error: {e}")
        return False

    # vectorized=true 업데이트
    sb_request("PATCH",
        f"psych_paper_chunks?id=eq.{chunk_id}",
        {"vectorized": True},
        {"Prefer": "return=minimal"},
    )
    return True


def process_paper(ss_paper, domain_code, existing_ids, hf_key, cf_account, cf_token):
    paper_id_ss = ss_paper.get("paperId", "")
    if not paper_id_ss or paper_id_ss in existing_ids:
        return "dup"

    abstract = (ss_paper.get("abstract") or "").strip()
    if len(abstract) < MIN_ABSTRACT_LEN:
        return "short"

    title = (ss_paper.get("title") or "").strip()
    if not title:
        return "no_title"

    authors = [a.get("name", "") for a in (ss_paper.get("authors") or [])[:5]]
    year = ss_paper.get("year")
    journal_info = ss_paper.get("journal") or {}
    journal = journal_info.get("name", "") if isinstance(journal_info, dict) else str(journal_info)
    pdf_info = ss_paper.get("openAccessPdf") or {}
    pdf_url = pdf_info.get("url") if isinstance(pdf_info, dict) else None
    open_access = bool(ss_paper.get("isOpenAccess"))

    paper_data = {
        "source": "semantic_scholar",
        "external_id": paper_id_ss,
        "title": title,
        "authors": authors,
        "year": year,
        "journal": journal or None,
        "abstract": abstract,
        "pdf_url": str(pdf_url) if pdf_url else None,
        "open_access": open_access,
        "domain_codes": [domain_code],
        "language": "en",
        "status": "pending",
    }

    inserted_id = insert_paper(paper_data)
    if not inserted_id:
        return "insert_fail"

    existing_ids.add(paper_id_ss)

    # 청크 INSERT
    if not insert_chunk(inserted_id, abstract, [domain_code]):
        return "chunk_fail"

    # 임베딩 + Vectorize
    if hf_key and cf_account and cf_token:
        ok = embed_and_vectorize(inserted_id, abstract, [domain_code], hf_key, cf_account, cf_token)
        status_str = "ok_vectorized" if ok else "ok_no_vec"
    else:
        status_str = "ok_no_vec"

    return status_str


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정")
        sys.exit(1)

    hf_key = os.environ.get("HUGGINGFACE_API_KEY", "")
    cf_account = os.environ.get("CF_ACCOUNT_ID", "")
    cf_token = os.environ.get("CF_API_TOKEN", "")

    if not (hf_key and cf_account and cf_token):
        print("WARNING: HF/CF 환경변수 없음 — 임베딩 없이 논문만 수집")

    print("기존 논문 ID 로딩...")
    existing_ids = get_existing_external_ids()
    print(f"  기존 semantic_scholar 논문: {len(existing_ids)}편\n")

    total_inserted = 0
    total_vectorized = 0

    # 달성 미달 도메인만 수집
    SKIP_DOMAINS = {"P2-002", "P4-001", "P5-001"}

    for domain_code, queries in DOMAIN_QUERIES.items():
        if domain_code in SKIP_DOMAINS:
            print(f"[{domain_code}] 목표 달성 — 건너뜀")
            continue
        print(f"\n{'='*50}")
        print(f"[{domain_code}] 수집 시작 (목표: {TARGET_PER_DOMAIN}편)")
        domain_inserted = 0

        for query in queries:
            if domain_inserted >= TARGET_PER_DOMAIN:
                break

            print(f"  검색: \"{query}\"")
            offset = 0

            while domain_inserted < TARGET_PER_DOMAIN:
                result = ss_search(query, limit=20, offset=offset)
                if not result:
                    break

                papers = result.get("data", [])
                if not papers:
                    break

                for p in papers:
                    if domain_inserted >= TARGET_PER_DOMAIN:
                        break
                    status = process_paper(p, domain_code, existing_ids, hf_key, cf_account, cf_token)
                    if status == "ok_vectorized":
                        domain_inserted += 1
                        total_vectorized += 1
                        print(f"    ✓ [{domain_inserted}/{TARGET_PER_DOMAIN}] {p.get('title','')[:60]}")
                        time.sleep(0.5)
                    elif status == "ok_no_vec":
                        domain_inserted += 1
                        print(f"    ○ [{domain_inserted}/{TARGET_PER_DOMAIN}] {p.get('title','')[:60]} (미벡터화)")
                        time.sleep(0.5)
                    elif status in ("dup", "short"):
                        pass
                    else:
                        print(f"    ✗ {status}: {p.get('title','')[:40]}")

                total_count = result.get("total", 0)
                offset += len(papers)
                if offset >= min(total_count, 100):
                    break
                time.sleep(REQUEST_DELAY)

        total_inserted += domain_inserted
        print(f"  [{domain_code}] 완료: {domain_inserted}편 수집")

    print(f"\n{'='*50}")
    print(f"전체 완료: 수집={total_inserted}편, 벡터화={total_vectorized}편")


if __name__ == "__main__":
    main()
