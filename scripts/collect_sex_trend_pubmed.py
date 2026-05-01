#!/usr/bin/env python3
"""
성행동 트렌드·세대 변화·성관계 감소 관련 논문 수집 → D3-022.
PubMed 제목 기반 정밀 쿼리.
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

DOMAIN_CODE = "D3-022"
TARGET = 40
MIN_ABSTRACT_LEN = 300
REQUEST_DELAY = 0.4

QUERIES = [
    ('"sexual frequency"[ti] AND ("declin" OR "trend" OR "generation" OR "young")', "성관계 빈도 감소·트렌드"),
    ('"sexless"[ti]', "섹스리스"),
    ('"sexual inactivity"[ti]', "성적 비활동"),
    ('"celibacy"[ti] AND ("young" OR "adult" OR "trend")', "독신·금욕 트렌드"),
    ('"declining sexual"[ti]', "성관계 감소"),
    ('"involuntary celibacy"[ti] OR "incel"[ti]', "비자발적 금욕"),
    ('"declines in sexual"[ti]', "성관계 감소 추세"),
    ('"sexual behavior"[ti] AND "cohort"[ti]', "성행동 코호트"),
    ('"sexual activity"[ti] AND "cohort"[ti] AND ("trend" OR "change" OR "declin")', "성적 활동 시계열"),
    ('"frequency of sex"[ti] AND ("trend" OR "change" OR "declin" OR "generation")', "성관계 빈도 변화"),
    ('"sexual revolution"[ti]', "성 혁명"),
    ('"hookup culture"[ti]', "훅업 문화"),
    ('"casual sex"[ti] AND ("trend" OR "generation" OR "young adult")', "캐주얼 섹스 트렌드"),
    ('"sexual permissiveness"[ti]', "성적 개방성"),
    ('"postponing sex"[ti] OR "delaying sex"[ti]', "성관계 지연"),
]

EXCLUDE_TITLE = [
    "animal", "rat ", "mouse", "mice", "bovine", "sheep",
    "hiv", "sti ", "std ", "contraception",
    "chromosome", "sex chromosome",
    "biricodar", "paclitaxel",  # 항암제
    # 금욕·종교 기반·부정 프레임 연구 제외
    "abstinence", "chastity", "premarital sex abstain",
    "sexual sin", "pornography addiction treatment religious",
    "purity culture",
]


def entrez_search(query, retmax=50):
    params = urllib.parse.urlencode({
        "db": "pubmed", "term": query,
        "retmax": retmax, "retmode": "json",
        "tool": "veilor", "email": ENTREZ_EMAIL,
    })
    with urllib.request.urlopen(f"{ENTREZ_BASE}/esearch.fcgi?{params}", timeout=10) as r:
        d = json.loads(r.read())
    result = d.get("esearchresult", {})
    return result.get("idlist", []), int(result.get("count", 0))


def entrez_fetch(pmids):
    if not pmids:
        return {}
    params = urllib.parse.urlencode({
        "db": "pubmed", "id": ",".join(pmids),
        "retmode": "xml", "rettype": "abstract",
        "tool": "veilor", "email": ENTREZ_EMAIL,
    })
    with urllib.request.urlopen(f"{ENTREZ_BASE}/efetch.fcgi?{params}", timeout=20) as r:
        xml = r.read().decode("utf-8", errors="replace")

    results = {}
    for art in re.findall(r"<PubmedArticle>(.*?)</PubmedArticle>", xml, re.DOTALL):
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
        authors = []
        for am in re.finditer(r"<Author[^>]*>(.*?)</Author>", art, re.DOTALL):
            ln = re.search(r"<LastName>(.*?)</LastName>", am.group(1))
            fn = re.search(r"<ForeName>(.*?)</ForeName>", am.group(1))
            if ln:
                authors.append(ln.group(1) + (f" {fn.group(1)}" if fn else ""))
            if len(authors) >= 5:
                break
        results[pmid] = {"title": title, "abstract": abstract, "year": year, "journal": journal, "authors": authors}
    return results


def is_relevant(title, abstract):
    tl = title.lower()
    if any(kw in tl for kw in EXCLUDE_TITLE):
        return False
    # 관련 키워드가 abstract에 있어야 함
    relevant_terms = [
        "sexual", "sex ", "sexless", "celibacy", "incel",
        "hookup", "casual sex", "coital", "intercourse",
    ]
    ab = abstract.lower()
    return any(t in ab or t in tl for t in relevant_terms)


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


def get_existing_ids():
    status, data = sb_request("GET", "psych_papers?select=external_id&limit=10000")
    if status == 200 and isinstance(data, list):
        return {r["external_id"] for r in data if r.get("external_id")}
    return set()


def insert_and_vectorize(paper_data, abstract, model):
    status, resp = sb_request("POST", "psych_papers", paper_data, {"Prefer": "return=representation"})
    if status not in (200, 201) or not isinstance(resp, list) or not resp:
        return False
    paper_id = resp[0]["id"]

    sb_request("POST", "psych_paper_chunks", {
        "paper_id": paper_id, "chunk_index": 0, "chunk_type": "abstract",
        "content": abstract, "domain_codes": [DOMAIN_CODE],
        "token_count": len(abstract) // 4, "vectorized": False,
    }, {"Prefer": "return=minimal"})

    s, chunks = sb_request("GET", f"psych_paper_chunks?select=id&paper_id=eq.{paper_id}&limit=1")
    if s != 200 or not chunks:
        return True
    chunk_id = chunks[0]["id"]

    vec = model.encode([abstract[:512]], show_progress_bar=False)[0].tolist()
    data = json.dumps({"vectors": [{"id": chunk_id, "values": vec,
        "metadata": {"paper_id": paper_id, "domain_codes": [DOMAIN_CODE]}}]}).encode()
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data,
        headers={"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}, method="POST")
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

    existing_ids = get_existing_ids()
    print(f"기존 논문: {len(existing_ids)}편\n")
    print(f"[{DOMAIN_CODE}] 성행동 트렌드·세대 변화 논문 수집 (목표: {TARGET}편)\n")

    total = 0

    for query, desc in QUERIES:
        if total >= TARGET:
            break
        pmids, count = entrez_search(query, retmax=50)
        if not pmids:
            continue
        print(f"  [{desc}] {count}편 → {len(pmids)}개")

        for i in range(0, len(pmids), 20):
            if total >= TARGET:
                break
            batch = pmids[i:i+20]
            arts = entrez_fetch(batch)
            time.sleep(REQUEST_DELAY)

            for pmid, art in arts.items():
                if total >= TARGET:
                    break
                ext_id = f"pmid-{pmid}"
                if ext_id in existing_ids:
                    continue
                title = art["title"]
                abstract = art["abstract"]
                if len(abstract) < MIN_ABSTRACT_LEN:
                    continue
                if not is_relevant(title, abstract):
                    continue

                ok = insert_and_vectorize({
                    "source": "pubmed", "external_id": ext_id,
                    "title": title, "authors": art["authors"],
                    "year": art["year"], "journal": art["journal"] or None,
                    "abstract": abstract, "pdf_url": None, "open_access": False,
                    "domain_codes": [DOMAIN_CODE], "language": "en", "status": "pending",
                }, abstract, model)

                if ok:
                    existing_ids.add(ext_id)
                    total += 1
                    print(f"    ✓ [{total}/{TARGET}] [{art['year']}] {title[:65]}")

    print(f"\n완료: {total}편 [{DOMAIN_CODE}]")


if __name__ == "__main__":
    main()
