#!/usr/bin/env python3.11
"""
e2e 테스트 전용 시드 유저 생성 스크립트
실행: /opt/homebrew/bin/python3.11 supabase/seed_e2e_users.py

생성 계정:
  - e2e.done@veilor.test  (온보딩 완료 유저)
  - e2e.fresh@veilor.test (온보딩 미완료 유저)
"""

import urllib.request
import urllib.error
import urllib.parse
import json
import sys

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SERVICE_ROLE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXdvdG9kd2Zna3BkYXNkaGhsIiwi"
    "cm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3NDYzNSwiZXhwIjoyMDg2"
    "MDUwNjM1fQ.ik0JCPcaht8lVgDiNyIaEvg7kPGvh19J1Ff6xjf9N0k"
)

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

E2E_USERS = [
    {
        "email": "e2e.done@veilor.test",
        "password": "Veilor2026!",
        "role": "done",  # 온보딩 완료
        "nickname": "E2E완료유저",
    },
    {
        "email": "e2e.fresh@veilor.test",
        "password": "Veilor2026!",
        "role": "fresh",  # 온보딩 미완료
        "nickname": "E2E신규유저",
    },
]


def api_request(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return {"error": err_body, "status": e.code}


def get_existing_users() -> dict:
    """기존 유저 목록 조회 → email → id 매핑"""
    result = api_request("GET", "/auth/v1/admin/users?per_page=1000")
    # Supabase Admin API: { users: [...] } 또는 직접 배열
    if isinstance(result, list):
        users = result
    else:
        users = result.get("users", [])
    return {u["email"]: u["id"] for u in users if "email" in u}


def create_or_get_user(email: str, password: str) -> str | None:
    """유저 생성 또는 기존 ID 반환"""
    existing = get_existing_users()
    if email in existing:
        uid = existing[email]
        print(f"  이미 존재: {email} (id={uid})")
        return uid

    # email_exists 에러도 이미 존재 의미 → 목록에서 찾기 재시도
    result = api_request("POST", "/auth/v1/admin/users", {
        "email": email,
        "password": password,
        "email_confirm": True,
    })

    err_str = result.get("error", "") if isinstance(result, dict) else ""
    if "email_exists" in err_str:
        # 이미 존재하지만 목록 조회에서 누락됨 → 페이지네이션 이슈
        # 직접 이메일로 검색
        search = api_request("GET", f"/auth/v1/admin/users?email={urllib.parse.quote(email)}")
        users = search.get("users", search) if isinstance(search, dict) else search
        if isinstance(users, list) and users:
            uid = users[0]["id"]
            print(f"  이미 존재 (검색): {email} (id={uid})")
            return uid
        print(f"  [WARN] email_exists지만 ID 조회 실패. 수동 확인 필요.")
        return None

    if isinstance(result, dict) and result.get("status", 0) >= 400:
        print(f"  [ERROR] 유저 생성 실패: {email} — {result.get('error', '')}")
        return None

    uid = result.get("id") if isinstance(result, dict) else None
    print(f"  생성 완료: {email} (id={uid})")
    return uid


def upsert_user_profile(uid: str, nickname: str, onboarding_step: str) -> bool:
    """veilor.user_profiles upsert"""
    result = api_request("POST", "/rest/v1/user_profiles?on_conflict=user_id", {
        "user_id": uid,
        "nickname": nickname,
        "onboarding_step": onboarding_step,
        "priper_completed": onboarding_step == "completed",
        "streak_count": 0,
        "codetalk_day": 1,
    })

    # upsert 성공 시 빈 배열 또는 오브젝트 반환
    if isinstance(result, list) or (isinstance(result, dict) and "error" not in result):
        return True

    # Prefer: 헤더 설정 필요한 경우 schema 지정
    return True  # REST upsert는 204 No Content → urlopen이 빈 응답 반환할 수 있음


def upsert_done_profile_with_schema(uid: str, nickname: str) -> bool:
    """veilor schema의 user_profiles에 upsert (Accept-Profile 헤더 필요)"""
    url = f"{SUPABASE_URL}/rest/v1/user_profiles?on_conflict=user_id"
    body = json.dumps({
        "user_id": uid,
        "nickname": nickname,
        "onboarding_step": "completed",
        "priper_completed": True,
        "streak_count": 3,
        "codetalk_day": 5,
    }).encode()

    headers = {
        **HEADERS,
        "Accept-Profile": "veilor",
        "Content-Profile": "veilor",
        "Prefer": "resolution=merge-duplicates",
    }

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  user_profiles upsert: HTTP {resp.status}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  [WARN] user_profiles upsert: HTTP {e.code} — {err[:120]}")
        # 409 conflict (이미 존재) = 정상
        return e.code in (200, 201, 204, 409)


def upsert_cq_responses(uid: str) -> bool:
    """온보딩 완료 상태를 위한 cq_responses 삽입 (veilor schema)"""
    rows = [
        {"user_id": uid, "question_key": "core_value",       "response_value": "성장"},
        {"user_id": uid, "question_key": "attachment_type",  "response_value": "secure"},
        {"user_id": uid, "question_key": "energy_type",      "response_value": "introvert"},
    ]

    url = f"{SUPABASE_URL}/rest/v1/cq_responses?on_conflict=user_id,question_key"
    body = json.dumps(rows).encode()
    headers = {
        **HEADERS,
        "Accept-Profile": "veilor",
        "Content-Profile": "veilor",
        "Prefer": "resolution=merge-duplicates",
    }

    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  cq_responses upsert: HTTP {resp.status}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  [WARN] cq_responses: HTTP {e.code} — {err[:120]}")
        return e.code in (200, 201, 204, 409)


def main():
    print("=" * 50)
    print("VEILOR e2e 시드 유저 생성")
    print("=" * 50)

    for user in E2E_USERS:
        print(f"\n▶ {user['email']}")
        uid = create_or_get_user(user["email"], user["password"])
        if not uid:
            print("  → 건너뜀")
            continue

        if user["role"] == "done":
            ok = upsert_done_profile_with_schema(uid, user["nickname"])
            if ok:
                upsert_cq_responses(uid)
            print(f"  → 온보딩 완료 상태 세팅 {'✓' if ok else '✗'}")
        else:
            # fresh 유저: user_profiles 없음 = 온보딩 시작 전 상태
            print(f"  → 프로필 미생성 (온보딩 미완료 상태 유지)")

    print("\n" + "=" * 50)
    print("완료. e2e 테스트 계정:")
    for u in E2E_USERS:
        print(f"  {u['email']} / {u['password']}")
    print("=" * 50)


if __name__ == "__main__":
    main()
