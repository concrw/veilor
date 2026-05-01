#!/usr/bin/env python3
"""
vectorized=false 청크를 로컬 KURE-v1(sentence-transformers)로 임베딩 후 Cloudflare Vectorize에 upsert.
"""
import os, sys, json, time
import urllib.request, urllib.error

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "")
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")

VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"
BATCH_SIZE = 20


def sb_headers(extra=None):
    h = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept-Profile": "veilor",
        "Content-Profile": "veilor",
        "Accept": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def fetch_pending(limit):
    url = (f"{SUPABASE_URL}/rest/v1/psych_paper_chunks"
           f"?select=id,content,paper_id,domain_codes&vectorized=eq.false&limit={limit}")
    req = urllib.request.Request(url, headers=sb_headers())
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def load_model():
    from sentence_transformers import SentenceTransformer
    print("KURE-v1 로컬 모델 로드 중...")
    m = SentenceTransformer("nlpai-lab/KURE-v1")
    print(f"모델 로드 완료 (dim={m.get_sentence_embedding_dimension()})")
    return m


def embed_batch(model, texts):
    vecs = model.encode([t[:512] for t in texts], batch_size=16, show_progress_bar=False)
    return [v.tolist() for v in vecs]


def upsert_vectorize(vectors):
    data = json.dumps({"vectors": vectors}).encode()
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 201)
    except urllib.error.HTTPError as e:
        print(f"    Vectorize error {e.code}: {e.read().decode()[:100]}")
        return False


def mark_vectorized(chunk_ids):
    url = f"{SUPABASE_URL}/rest/v1/psych_paper_chunks?id=in.({','.join(chunk_ids)})"
    data = json.dumps({"vectorized": True}).encode()
    headers = sb_headers({"Content-Type": "application/json", "Prefer": "return=minimal"})
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return True
    except Exception as e:
        print(f"    mark_vectorized error: {e}")
        return False


def count_pending():
    url = (f"{SUPABASE_URL}/rest/v1/psych_paper_chunks"
           f"?select=id&vectorized=eq.false")
    headers = sb_headers({"Prefer": "count=exact", "Range-Unit": "items", "Range": "0-0"})
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            cr = r.headers.get("Content-Range", "")
            return int(cr.split("/")[-1]) if "/" in cr else -1
    except Exception:
        return -1


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정"); sys.exit(1)
    if not CF_ACCOUNT_ID or not CF_API_TOKEN:
        print("ERROR: CF_ACCOUNT_ID / CF_API_TOKEN 미설정"); sys.exit(1)

    model = load_model()
    total_ok = 0
    total_fail = 0
    batch_num = 0

    while True:
        pending = count_pending()
        if pending == 0:
            break
        print(f"\n[Batch {batch_num+1}] 남은 미벡터화: {pending}개")

        chunks = fetch_pending(BATCH_SIZE)
        if not chunks:
            break

        texts = [c["content"] for c in chunks]
        vecs = embed_batch(model, texts)

        vectors = []
        ok_ids = []
        for c, vec in zip(chunks, vecs):
            if len(vec) != 1024:
                print(f"  FAIL dim={len(vec)} {c['id'][:8]}")
                total_fail += 1
                continue
            vectors.append({
                "id": c["id"],
                "values": vec,
                "metadata": {
                    "paper_id": c["paper_id"],
                    "domain_codes": c.get("domain_codes") or [],
                },
            })
            ok_ids.append(c["id"])

        if vectors:
            if upsert_vectorize(vectors):
                mark_vectorized(ok_ids)
                total_ok += len(ok_ids)
                print(f"  OK: {len(ok_ids)}개 vectorized")
            else:
                print(f"  Vectorize upsert FAIL — {len(ok_ids)}개")
                total_fail += len(ok_ids)
        else:
            print("  embed 결과 없음")
            break

        batch_num += 1

    print(f"\n완료: vectorized={total_ok}, failed={total_fail}")


if __name__ == "__main__":
    main()
