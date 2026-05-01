#!/usr/bin/env python3
"""
psych_paper_chunks embedding → Vectorize ndjson 포맷으로 변환 후 파일 저장.
wrangler vectorize insert veilor-psych --file=/tmp/veilor_psych_vectors.ndjson 로 업로드.
"""
import os, sys, json, re
import urllib.request

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OUT_FILE = "/tmp/veilor_psych_vectors.ndjson"
BATCH_SIZE = 50


def fetch_chunks(offset, limit):
    url = (
        f"{SUPABASE_URL}/rest/v1/psych_paper_chunks"
        f"?select=id,paper_id,domain_codes,embedding"
        f"&embedding=not.is.null&limit={limit}&offset={offset}"
    )
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Accept": "application/json",
        "Accept-Profile": "veilor",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def parse_vector(s):
    nums = re.findall(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", s)
    return [float(x) for x in nums]


def main():
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_SERVICE_ROLE_KEY 미설정")
        sys.exit(1)

    offset = 0
    total = 0

    with open(OUT_FILE, "w") as f:
        while True:
            chunks = fetch_chunks(offset, BATCH_SIZE)
            if not chunks:
                break

            for c in chunks:
                if not c.get("embedding"):
                    continue
                vec = parse_vector(c["embedding"])
                if len(vec) != 1024:
                    print(f"SKIP dim={len(vec)} id={c['id'][:8]}")
                    continue

                record = {
                    "id": c["id"],
                    "values": vec,
                    "metadata": {
                        "paper_id": c["paper_id"],
                        "domain_codes": c.get("domain_codes") or [],
                    },
                }
                f.write(json.dumps(record) + "\n")
                total += 1

            print(f"  offset={offset}, 누적={total}")
            offset += len(chunks)
            if len(chunks) < BATCH_SIZE:
                break

    print(f"\nndjson 파일 생성 완료: {OUT_FILE}")
    print(f"총 {total}개 벡터")
    print(f"\n다음 명령어로 Vectorize에 업로드:")
    print(f"  npx wrangler vectorize insert veilor-psych --file={OUT_FILE}")


if __name__ == "__main__":
    main()
