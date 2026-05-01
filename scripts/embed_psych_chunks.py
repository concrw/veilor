#!/usr/bin/env python3
"""
psych_paper_chunks 임베딩 생성 스크립트.
HuggingFace KURE-v1 API로 임베딩 생성 후 Supabase REST API로 업데이트.
"""
import os, sys, json, time
import urllib.request, urllib.error

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
HF_API_KEY = os.environ.get("HUGGINGFACE_API_KEY", "")
KURE_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/nlpai-lab/KURE-v1"
BATCH_SIZE = 5

def http_post(url, headers, body):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, {}

def http_get(url, headers):
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, {}

def http_patch(url, headers, body):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, {}
    except urllib.error.HTTPError as e:
        return e.code, {}

def embed_text(text):
    status, result = http_post(
        KURE_URL,
        {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json",
        },
        {"inputs": text[:512], "options": {"wait_for_model": True}},
    )
    if status != 200:
        return None
    vec = result[0] if isinstance(result, list) and isinstance(result[0], list) else result
    if isinstance(vec, list) and len(vec) == 1024:
        return vec
    return None

def fetch_pending_chunks(offset, limit):
    url = (
        f"{SUPABASE_URL}/rest/v1/psych_paper_chunks"
        f"?select=id,content&embedding=is.null&limit={limit}&offset={offset}"
    )
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Accept-Profile": "veilor",
    }
    status, data = http_get(url, headers)
    if status != 200:
        print(f"  fetch error: {status}")
        return []
    return data if isinstance(data, list) else []

def update_embedding(chunk_id, vec):
    url = f"{SUPABASE_URL}/rest/v1/psych_paper_chunks?id=eq.{chunk_id}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Accept-Profile": "veilor",
        "Content-Profile": "veilor",
        "Prefer": "return=minimal",
    }
    vec_str = "[" + ",".join(f"{v:.8f}" for v in vec) + "]"
    status, _ = http_patch(url, headers, {"embedding": vec_str})
    return status in (200, 204)

def count_remaining():
    url = (
        f"{SUPABASE_URL}/rest/v1/psych_paper_chunks"
        f"?select=id&embedding=is.null"
    )
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Accept-Profile": "veilor",
        "Prefer": "count=exact",
        "Range-Unit": "items",
        "Range": "0-0",
    }
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            cr = resp.headers.get("Content-Range", "")
            if "/" in cr:
                return int(cr.split("/")[-1])
    except Exception:
        pass
    return -1

def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 환경변수 미설정")
        sys.exit(1)
    if not HF_API_KEY:
        print("ERROR: HUGGINGFACE_API_KEY 환경변수 미설정")
        sys.exit(1)

    total_embedded = 0
    total_failed = 0
    round_num = 0

    while True:
        round_num += 1
        chunks = fetch_pending_chunks(0, BATCH_SIZE)
        if not chunks:
            print(f"\n모든 청크 임베딩 완료! 총 embedded={total_embedded}, failed={total_failed}")
            break

        print(f"\n[Round {round_num}] {len(chunks)}개 청크 처리 중...")
        for chunk in chunks:
            vec = embed_text(chunk["content"])
            if vec is None:
                print(f"  FAIL embed chunk {chunk['id'][:8]}...")
                total_failed += 1
                time.sleep(1)
                continue

            ok = update_embedding(chunk["id"], vec)
            if ok:
                print(f"  OK   chunk {chunk['id'][:8]}... (dim={len(vec)})")
                total_embedded += 1
            else:
                print(f"  FAIL update chunk {chunk['id'][:8]}...")
                total_failed += 1
            time.sleep(0.3)

        remaining = count_remaining()
        print(f"  remaining={remaining}, embedded_so_far={total_embedded}")
        if remaining == 0:
            print("\n임베딩 완료!")
            break

    return total_embedded, total_failed

if __name__ == "__main__":
    main()
