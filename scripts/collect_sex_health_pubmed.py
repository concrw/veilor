#!/usr/bin/env python3
"""
PubMed Central (PMC) API로 성생활·건강 관계 논문 수집 → D3-021 → chunk + vectorize.
PubMed Entrez API: 무료, 인증 불필요, 초당 3건.
"""
import os, sys, json, time, re
import urllib.request, urllib.error, urllib.parse

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")

VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"
ENTREZ_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
ENTREZ_EMAIL = "lizbirkincho@gmail.com"

DOMAIN_CODE = "D3-021"
TARGET = 50
MIN_ABSTRACT_LEN = 400
REQUEST_DELAY = 0.4  # PubMed: 초당 3건 제한

# 제목 레벨 정밀 쿼리 (노이즈 최소화)
QUERIES = [
    ('"sexual activity"[ti] AND "health"[ti]', "성적 활동 + 건강 (제목)"),
    ('"sexual activity"[ti] AND "wellbeing"[ti]', "성적 활동 + 웰빙 (제목)"),
    ('"sexual activity"[ti] AND "cardiovascular"[ti]', "성적 활동 + 심혈관 (제목)"),
    ('"sexual activity"[ti] AND "depression"[ti]', "성적 활동 + 우울 (제목)"),
    ('"sexual activity"[ti] AND "anxiety"[ti]', "성적 활동 + 불안 (제목)"),
    ('"sexual frequency"[ti] AND "health"[ti]', "성관계 빈도 + 건강 (제목)"),
    ('"orgasm"[ti] AND "health"[ti]', "오르가즘 + 건강 (제목)"),
    ('"masturbation"[ti] AND "health"[ti]', "자위 + 건강 (제목)"),
    ('"coital"[ti] AND "health"[ti]', "성교 + 건강 (제목)"),
    ('"sexual intimacy"[ti] AND "wellbeing"[ti]', "성적 친밀감 + 웰빙 (제목)"),
    ('"sexual activity"[ti] AND "immune"[ti]', "성적 활동 + 면역 (제목)"),
    ('"sexual activity"[ti] AND "aging"[ti]', "성적 활동 + 노화 (제목)"),
    ('"sexual activity"[ti] AND "pain"[ti]', "성적 활동 + 통증 (제목)"),
    ('"sexual activity"[ti] AND "sleep"[ti]', "성적 활동 + 수면 (제목)"),
    ('"sexual satisfaction"[ti] AND "wellbeing"[ti]', "성적 만족 + 웰빙 (제목)"),
]

# 제외 키워드 (제목에 이게 주제이면 스킵)
EXCLUDE_TITLE = [
    "violence", "abuse", "assault", "rape", "coercion",
    "hiv", "std", "sti", "infection", "contraception",
    "cancer treatment", "erectile dysfunction treatment",
    "sex difference", "sex-based difference", "gender difference",
    "chromosome", "sex hormone level", "steroid",
    "disability", "spinal cord injury",
    # 금욕·종교 기반·부정 프레임 연구 제외
    "abstinence", "chastity", "premarital sex abstain",
    "sexual sin", "pornography addiction treatment religious",
    "purity culture",
]


def entrez_search(query, retmax=50, retstart=0):
    params = urllib.parse.urlencode({
        "db": "pubmed",
        "term": query,
        "retmax": retmax,
        "retstart": retstart,
        "retmode": "json",
        "tool": "veilor",
        "email": ENTREZ_EMAIL,
    })
    url = f"{ENTREZ_BASE}/esearch.fcgi?{params}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            d = json.loads(r.read())
        result = d.get("esearchresult", {})
        return result.get("idlist", []), int(result.get("count", 0))
    except Exception as e:
        print(f"    PubMed search error: {e}")
        return [], 0


def entrez_fetch_abstracts(pmids):
    """PMIDs → {pmid: {title, abstract, authors, year, journal}} 딕셔너리"""
    if not pmids:
        return {}
    params = urllib.parse.urlencode({
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "rettype": "abstract",
        "tool": "veilor",
        "email": ENTREZ_EMAIL,
    })
    url = f"{ENTREZ_BASE}/efetch.fcgi?{params}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            xml = r.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"    efetch error: {e}")
        return {}

    results = {}
    # 간단한 regex 파싱
    articles = re.findall(r"<PubmedArticle>(.*?)</PubmedArticle>", xml, re.DOTALL)
    for art in articles:
        pmid_m = re.search(r"<PMID[^>]*>(\d+)</PMID>", art)
        if not pmid_m:
            continue
        pmid = pmid_m.group(1)

        title_m = re.search(r"<ArticleTitle>(.*?)</ArticleTitle>", art, re.DOTALL)
        title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip() if title_m else ""

        ab_parts = re.findall(r"<AbstractText[^>]*>(.*?)</AbstractText>", art, re.DOTALL)
        abstract = " ".join(re.sub(r"<[^>]+>", "", p).strip() for p in ab_parts)

        year_m = re.search(r"<PubDate>.*?<Year>(\d{4})</Year>", art, re.DOTALL)
        year = int(year_m.group(1)) if year_m else None

        journal_m = re.search(r"<Title>(.*?)</Title>", art, re.DOTALL)
        journal = re.sub(r"<[^>]+>", "", journal_m.group(1)).strip() if journal_m else ""

        author_names = []
        for am in re.finditer(r"<Author[^>]*>(.*?)</Author>", art, re.DOTALL):
            ln = re.search(r"<LastName>(.*?)</LastName>", am.group(1))
            fn = re.search(r"<ForeName>(.*?)</ForeName>", am.group(1))
            if ln:
                name = ln.group(1) + (f" {fn.group(1)}" if fn else "")
                author_names.append(name)
            if len(author_names) >= 5:
                break

        results[pmid] = {
            "title": title,
            "abstract": abstract,
            "year": year,
            "journal": journal,
            "authors": author_names,
        }
    return results


def is_relevant(abstract, title):
    title_lower = title.lower()
    if any(kw in title_lower for kw in EXCLUDE_TITLE):
        return False
    return True


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


def insert_and_vectorize(paper_data, abstract, model):
    status, resp = sb_request("POST", "psych_papers", paper_data,
                              {"Prefer": "return=representation"})
    if status not in (200, 201) or not isinstance(resp, list) or not resp:
        return False
    paper_id = resp[0]["id"]

    # 청크 INSERT
    sb_request("POST", "psych_paper_chunks", {
        "paper_id": paper_id,
        "chunk_index": 0,
        "chunk_type": "abstract",
        "content": abstract,
        "domain_codes": [DOMAIN_CODE],
        "token_count": len(abstract) // 4,
        "vectorized": False,
    }, {"Prefer": "return=minimal"})

    # 청크 ID 조회
    s, chunks = sb_request("GET",
        f"psych_paper_chunks?select=id&paper_id=eq.{paper_id}&limit=1")
    if s != 200 or not chunks:
        return True  # insert는 됐지만 벡터화 실패
    chunk_id = chunks[0]["id"]

    vec = model.encode([abstract[:512]], show_progress_bar=False)[0].tolist()
    data = json.dumps({"vectors": [{
        "id": chunk_id, "values": vec,
        "metadata": {"paper_id": paper_id, "domain_codes": [DOMAIN_CODE]},
    }]}).encode()
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            if r.status in (200, 201):
                sb_request("PATCH", f"psych_paper_chunks?id=eq.{chunk_id}",
                           {"vectorized": True}, {"Prefer": "return=minimal"})
    except Exception:
        pass
    return True


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정"); sys.exit(1)

    print("KURE-v1 로컬 모델 로드 중...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("nlpai-lab/KURE-v1")
    print(f"모델 로드 완료 (dim={model.get_sentence_embedding_dimension()})\n")

    print("기존 논문 ID 로딩...")
    existing_ids = get_existing_external_ids()
    print(f"  기존 논문: {len(existing_ids)}편\n")

    total = 0

    for query, desc in QUERIES:
        if total >= TARGET:
            break
        print(f"\n  [{desc}]")
        pmids, count = entrez_search(query, retmax=100)
        print(f"  PubMed 결과: {count}편 → {len(pmids)}개 처리")
        if not pmids:
            continue

        # 배치로 abstract 가져오기
        for i in range(0, len(pmids), 20):
            if total >= TARGET:
                break
            batch = pmids[i:i+20]
            arts = entrez_fetch_abstracts(batch)
            time.sleep(REQUEST_DELAY)

            for pmid, art in arts.items():
                if total >= TARGET:
                    break
                external_id = f"pmid-{pmid}"
                if external_id in existing_ids:
                    continue

                title = art["title"]
                abstract = art["abstract"]

                if len(abstract) < MIN_ABSTRACT_LEN:
                    continue
                if not is_relevant(abstract, title):
                    continue

                paper_data = {
                    "source": "pubmed",
                    "external_id": external_id,
                    "title": title,
                    "authors": art["authors"],
                    "year": art["year"],
                    "journal": art["journal"] or None,
                    "abstract": abstract,
                    "pdf_url": None,
                    "open_access": True,
                    "domain_codes": [DOMAIN_CODE],
                    "language": "en",
                    "status": "pending",
                }

                ok = insert_and_vectorize(paper_data, abstract, model)
                if ok:
                    existing_ids.add(external_id)
                    total += 1
                    print(f"    ✓ [{total}/{TARGET}] {title[:65]}")

    print(f"\n{'='*50}")
    print(f"완료: {total}편 수집·벡터화 [{DOMAIN_CODE}]")


if __name__ == "__main__":
    main()
