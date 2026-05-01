#!/usr/bin/env python3
"""
psych_paper_chunks 임베딩 → Cloudflare Vectorize veilor-psych Index 마이그레이션.
완료 후 Supabase의 embedding 컬럼은 별도로 DROP.
"""
import os, sys, json, re, time
import urllib.request, urllib.error

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CF_ACCOUNT_ID = "3bf3ae712aacacf5ce7e03e9d19389d5"
CF_API_TOKEN = os.environ.get("CF_API_TOKEN", "")
INDEX_NAME = "veilor-psych"
VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/{INDEX_NAME}"
BATCH_SIZE = 100  # Vectorize upsert 최대 1000 / 요청


def sb_get(path, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{path}{params}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Accept-Profile": "veilor",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def cf_post(path, body):
    url = f"{VECTORIZE_URL}{path}"
    data = json.dumps(body).encode()
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body_err = e.read().decode()
        return e.code, {"error": body_err}


def parse_vector(embedding_str):
    """'[0.1,0.2,...]' 또는 postgres vector 문자열 → float list"""
    nums = re.findall(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", embedding_str)
    return [float(x) for x in nums]


def fetch_chunks(offset, limit):
    params = (
        f"?select=id,paper_id,domain_codes,embedding"
        f"&embedding=not.is.null"
        f"&limit={limit}&offset={offset}"
    )
    return sb_get("psych_paper_chunks", params)


def upsert_batch(chunks):
    vectors = []
    for c in chunks:
        if not c.get("embedding"):
            continue
        vec = parse_vector(c["embedding"])
        if len(vec) != 1024:
            print(f"  SKIP dim={len(vec)} id={c['id'][:8]}")
            continue
        vectors.append({
            "id": c["id"],
            "values": vec,
            "metadata": {
                "paper_id": c["paper_id"],
                "domain_codes": c.get("domain_codes") or [],
            },
        })

    if not vectors:
        return 0

    status, resp = cf_post("/upsert", {"vectors": vectors})
    if status in (200, 201):
        count = resp.get("result", {}).get("count", len(vectors))
        print(f"  Upserted {count} vectors (HTTP {status})")
        return count
    else:
        print(f"  Upsert FAIL HTTP {status}: {str(resp)[:200]}")
        return 0


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정")
        sys.exit(1)
    if not CF_API_TOKEN:
        print("ERROR: CF_API_TOKEN 미설정")
        sys.exit(1)

    print(f"Cloudflare Vectorize [{INDEX_NAME}] 마이그레이션 시작\n")

    offset = 0
    total_upserted = 0
    batch_num = 0

    while True:
        chunks = fetch_chunks(offset, BATCH_SIZE)
        if not chunks:
            break

        batch_num += 1
        print(f"[Batch {batch_num}] offset={offset}, {len(chunks)}개 처리...")
        upserted = upsert_batch(chunks)
        total_upserted += upserted
        offset += len(chunks)

        if len(chunks) < BATCH_SIZE:
            break

        time.sleep(0.5)

    print(f"\n완료: 총 {total_upserted}개 벡터 Vectorize에 업로드")
    print(f"\n다음 단계: Supabase에서 embedding 컬럼 DROP")
    print("  ALTER TABLE veilor.psych_paper_chunks DROP COLUMN embedding;")


if __name__ == "__main__":
    main()
