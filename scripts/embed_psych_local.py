#!/usr/bin/env python3
"""
psych_paper_chunks 임베딩 — sentence-transformers로 로컬 KURE-v1 실행 후 Supabase REST 업데이트.
"""
import os, sys, json, time
import urllib.request, urllib.error

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

def supabase_headers(extra=None):
    h = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept-Profile": "veilor",
    }
    if extra:
        h.update(extra)
    return h

def fetch_pending_chunks(limit=10):
    url = f"{SUPABASE_URL}/rest/v1/psych_paper_chunks?select=id,content&embedding=is.null&limit={limit}"
    req = urllib.request.Request(url, headers=supabase_headers({"Accept": "application/json"}))
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def update_embedding(chunk_id, vec):
    url = f"{SUPABASE_URL}/rest/v1/psych_paper_chunks?id=eq.{chunk_id}"
    vec_str = "[" + ",".join(f"{v:.8f}" for v in vec) + "]"
    data = json.dumps({"embedding": vec_str}).encode()
    headers = supabase_headers({
        "Content-Type": "application/json",
        "Content-Profile": "veilor",
        "Prefer": "return=minimal",
    })
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except urllib.error.HTTPError as e:
        print(f"    update HTTP {e.code}")
        return False

def count_remaining():
    url = f"{SUPABASE_URL}/rest/v1/psych_paper_chunks?select=id&embedding=is.null"
    headers = supabase_headers({
        "Accept": "application/json",
        "Prefer": "count=exact",
        "Range-Unit": "items",
        "Range": "0-0",
    })
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            cr = r.headers.get("Content-Range", "")
            return int(cr.split("/")[-1]) if "/" in cr else -1
    except Exception:
        return -1

def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정")
        sys.exit(1)

    print("sentence-transformers로 KURE-v1 로드 중...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("nlpai-lab/KURE-v1")
    print(f"모델 로드 완료. embedding dim={model.get_sentence_embedding_dimension()}")

    total_embedded = 0
    total_failed = 0
    batch_num = 0

    while True:
        chunks = fetch_pending_chunks(limit=11)
        if not chunks:
            break
        batch_num += 1
        print(f"\n[Batch {batch_num}] {len(chunks)}개 청크...")

        texts = [c["content"][:512] for c in chunks]
        vecs = model.encode(texts, batch_size=8, show_progress_bar=False)

        for chunk, vec in zip(chunks, vecs):
            if len(vec) != 1024:
                print(f"  SKIP dim={len(vec)}")
                total_failed += 1
                continue
            ok = update_embedding(chunk["id"], vec.tolist())
            if ok:
                print(f"  OK   {chunk['id'][:8]}...")
                total_embedded += 1
            else:
                print(f"  FAIL {chunk['id'][:8]}...")
                total_failed += 1

        remaining = count_remaining()
        print(f"  remaining={remaining}, embedded_so_far={total_embedded}")
        if remaining == 0:
            break

    print(f"\n완료: embedded={total_embedded}, failed={total_failed}")
    return total_embedded, total_failed

if __name__ == "__main__":
    main()
