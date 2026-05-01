#!/usr/bin/env python3.11
"""최종 보강: P2-002(+2), P3-001(+14), P3-002(+18), P4-002(+9), P5-001(+3)"""
import json, os, urllib.request
from sentence_transformers import SentenceTransformer

SUPABASE_URL = "https://qwiwotodwfgkpdasdhhl.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
CF_ACCOUNT_ID = os.environ["CF_ACCOUNT_ID"]
CF_API_TOKEN = os.environ["CF_API_TOKEN"]
VECTORIZE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/vectorize/v2/indexes/veilor-psych"

def sb_request(method, path, body=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
               "Accept": "application/json", "Accept-Profile": "veilor", "Content-Profile": "veilor",
               "Content-Type": "application/json", "Prefer": "return=representation"}
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def upsert_vectorize(vectors):
    data = json.dumps({"vectors": vectors}).encode()
    headers = {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"{VECTORIZE_URL}/upsert", data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def get_existing_questions():
    existing = set()
    offset = 0
    while True:
        rows = sb_request("GET", f"sex_qa?select=question&limit=1000&offset={offset}")
        if not rows: break
        for r in rows: existing.add(r["question"].strip())
        if len(rows) < 1000: break
        offset += 1000
    return existing

print("KURE-v1 로드 중...")
model = SentenceTransformer("nlpai-lab/KURE-v1")
print("기존 질문 로드 중...")
existing = get_existing_questions()
print(f"기존 질문 수: {len(existing)}")

QA_DATA = [
# P2-002 불안장애 +2
{"category":"불안장애","question":"GAD(범불안장애)가 있는데 일상에서 어떻게 관리할 수 있나요?","answer":"GAD 일상 관리: (1) 정해진 '걱정 시간' 활용(하루 15분), (2) 근육 이완 훈련(PMR), (3) 수면 위생 관리, (4) 카페인·알코올 조절, (5) 규칙적인 유산소 운동입니다. 이와 함께 인지행동치료가 가장 효과적인 치료로 알려져 있어요.","domain_codes":["P2-002"],"tags":["불안","GAD","관리"],"user_persona":"P07","persona_age_range":"50-59","persona_gender":"남성"},
{"category":"불안장애","question":"불안이 너무 심한데 직접 상담을 받기 힘들 때 도움받을 방법이 있나요?","answer":"직접 상담이 어렵다면 온라인 상담, 정신건강 위기 상담 전화(1577-0199, 24시간), 마음이음(한국정신건강복지협회), 정신건강 앱 등을 활용할 수 있어요. 자가 도움으로는 CBT 기반의 자습 워크북도 효과적입니다.","domain_codes":["P2-002"],"tags":["불안","원격","자원"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},

# P3-001 PTSD +14
{"category":"PTSD","question":"트라우마 사건 이후 대인 관계가 불편해졌어요.","answer":"트라우마 후 대인 관계가 어려워지는 것은 신뢰 손상, 과각성, 위협 감각이 높아지기 때문입니다. 안전하게 느껴지는 한 사람부터 조심스럽게 연결을 유지해가는 것이 치유 과정의 일부입니다.","domain_codes":["P3-001"],"tags":["PTSD","대인관계","신뢰"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"PTSD","question":"트라우마 이후 직장에 복귀했지만 집중이 안 되고 실수가 많아요.","answer":"트라우마 후 인지 기능 저하(집중력, 기억력)는 흔한 증상입니다. 신경계가 여전히 경계 상태에 있어서 주의 자원이 소모되기 때문이에요. 직장에서 업무 부담을 일시적으로 조정하거나, 치료와 병행하는 것이 필요합니다.","domain_codes":["P3-001"],"tags":["PTSD","직장복귀","인지기능"],"user_persona":"P09","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"PTSD","question":"사고 현장에서 살아남은 것에 대한 죄책감이 있어요.","answer":"생존자 죄책감은 PTSD에서 매우 흔한 증상입니다. '왜 나만 살아남았나'는 생각은 강렬하지만, 살아있는 것이 당신의 잘못이 아닙니다. 이 죄책감을 혼자 감당하지 마시고 전문가의 도움을 받아주세요.","domain_codes":["P3-001"],"tags":["PTSD","생존자죄책감","치유"],"user_persona":"P07","persona_age_range":"50-59","persona_gender":"남성"},
{"category":"PTSD","question":"트라우마 사건을 목격한 후 그 장면이 자꾸 생각나요.","answer":"충격적인 장면을 목격한 후 반복적으로 떠오르는 것은 목격자 트라우마의 침투 증상입니다. 이 기억이 처리되지 않은 것이에요. 목격자로서의 트라우마도 치료받을 자격이 있습니다.","domain_codes":["P3-001"],"tags":["PTSD","목격자","침투기억"],"user_persona":"P02","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"PTSD","question":"PTSD 증상이 있는 것 같은데 정신건강의학과에 가기 두려워요.","answer":"처음 정신건강의학과에 가는 것에 대한 두려움은 매우 흔합니다. 낙인에 대한 두려움, 진단이 무섭다는 것 등 다양한 이유가 있어요. 첫 방문은 단순히 상태를 이야기하는 것이고, 치료 여부는 함께 결정합니다.","domain_codes":["P3-001"],"tags":["PTSD","도움요청","낙인"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
{"category":"PTSD","question":"전쟁이나 폭력 상황을 경험했어요. 어떤 도움을 받을 수 있나요?","answer":"전쟁, 폭력 상황 노출은 극심한 트라우마를 남깁니다. 트라우마 전문 상담, PTSD 치료(EMDR, PE 치료), 사회 지지 그룹이 도움이 됩니다. 한국의 경우 정신건강복지센터, 트라우마 전문 기관에서 도움을 받을 수 있어요.","domain_codes":["P3-001"],"tags":["PTSD","폭력","자원"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},
{"category":"PTSD","question":"트라우마 이후 분노 조절이 어려워졌어요.","answer":"트라우마 후 분노 조절 어려움은 PTSD의 과각성 증상 중 하나입니다. 신경계가 위협에 과도하게 반응하면서 작은 자극에도 강한 분노가 생길 수 있어요. 분노 이면의 두려움과 상처를 다루는 치료적 접근이 필요합니다.","domain_codes":["P3-001"],"tags":["PTSD","분노","조절"],"user_persona":"P09","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"PTSD","question":"트라우마 치료가 완전히 기억을 없애주나요?","answer":"트라우마 치료는 기억을 없애지 않습니다. 대신 기억이 지금 이 순간처럼 생생하게 침투하지 않도록, 과거의 일로 통합될 수 있도록 돕습니다. 기억은 있어도 삶을 지배하지 않게 되는 것이 목표입니다.","domain_codes":["P3-001"],"tags":["PTSD","치료기대","기억"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},
{"category":"PTSD","question":"PTSD가 있으면 임신이나 육아에 어떤 영향이 있나요?","answer":"PTSD가 있는 분들에게 임신과 육아는 특별한 도전이 될 수 있습니다. 신체 접촉이나 특정 상황이 트리거가 되거나, 아이와의 관계에서 과거 경험이 활성화될 수 있어요. 이 시기에 트라우마 전문 지원을 받는 것이 중요합니다.","domain_codes":["P3-001"],"tags":["PTSD","임신","육아"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"PTSD","question":"친밀한 파트너 폭력(가정폭력) 이후 안전한 관계를 믿기 어려워요.","answer":"가정폭력 이후 모든 친밀한 관계에서 위험을 감지하는 것은 자신을 보호하기 위한 반응입니다. 안전한 관계가 실재한다는 것을 경험하는 교정 경험이 치유의 핵심이에요. 트라우마 전문 상담이 이 과정을 안전하게 돕습니다.","domain_codes":["P3-001"],"tags":["PTSD","가정폭력","신뢰"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"PTSD","question":"트라우마 이후 잠을 자면 악몽 때문에 자는 게 두려워요.","answer":"트라우마 악몽으로 수면 자체가 두려워지는 것은 PTSD에서 흔합니다. 수면 전 안전 루틴 만들기, 이미지 리허설 치료(악몽 결말 바꾸기), 필요 시 약물 치료 등이 트라우마 악몽에 효과적이에요.","domain_codes":["P3-001"],"tags":["PTSD","악몽","수면공포"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
{"category":"PTSD","question":"PTSD 치료를 받고 싶은데 어디서 도움을 받을 수 있나요?","answer":"한국에서 PTSD 전문 치료는 정신건강의학과, 트라우마 전문 상담센터, 국립정신건강센터, 정신건강복지센터에서 받을 수 있어요. 온라인 상담도 가능합니다. 보건복지부 정신건강위기상담전화 1577-0199로 연결할 수도 있습니다.","domain_codes":["P3-001"],"tags":["PTSD","자원","국내"],"user_persona":"P07","persona_age_range":"50-59","persona_gender":"남성"},
{"category":"PTSD","question":"트라우마 사건 이후 예전의 나로 돌아갈 수 있나요?","answer":"트라우마 이전의 나로 정확히 돌아가는 것은 어렵습니다. 하지만 많은 분들이 '외상 후 성장(post-traumatic growth)'을 경험합니다. 상처를 통해 다른 방식으로 강해지거나, 더 깊은 의미를 찾게 되는 경우도 있어요. 회복은 복귀가 아니라 통합입니다.","domain_codes":["P3-001"],"tags":["PTSD","회복","외상후성장"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},

# P3-002 복합트라우마 +18
{"category":"복합트라우마","question":"성인이 되어서야 어린 시절이 비정상이었다는 걸 알았어요.","answer":"성인이 되어서야 자신의 어린 시절이 정상적이지 않았다는 것을 인식하는 것은 복합 트라우마 치유의 시작점이 되기도 합니다. 이 인식 자체가 충격적이고 슬플 수 있어요. 그 슬픔은 다루어져야 할 애도입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","인식","어린시절"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},
{"category":"복합트라우마","question":"내가 항상 다른 사람들에게 맞추고 자신을 잃어왔어요.","answer":"오랫동안 타인에게 맞추며 자아를 잃어온 것은 생존을 위해 자기를 지운 복합 트라우마 반응입니다. '내가 무엇을 원하는가'를 다시 찾는 과정은 서두르지 않아도 됩니다. 천천히, 안전하게 자신을 다시 발견하는 작업이에요.","domain_codes":["P3-002"],"tags":["복합트라우마","자아상실","회복"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"복합트라우마","question":"내 경험을 이야기하면 아무도 믿어주지 않을 것 같아요.","answer":"경험을 이야기했을 때 믿어주지 않을 것 같다는 두려움은 매우 흔합니다. 특히 가족 내 트라우마에서 이 두려움이 강합니다. 믿어줄 수 있는 안전한 한 사람 또는 전문가를 찾는 것이 첫 단계입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","불신","이야기하기"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},
{"category":"복합트라우마","question":"사람들 앞에서 울거나 감정을 보이면 약하게 보일 것 같아요.","answer":"감정을 보이는 것을 약함으로 보는 믿음은 오랫동안 감정을 보이면 안 된다는 메시지를 받은 환경에서 형성됩니다. 감정을 표현하는 것은 용기이고 건강한 신호입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","감정표현","수치심"],"user_persona":"P02","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"복합트라우마","question":"나는 왜 항상 나쁜 사람들에게 끌리는 것 같나요?","answer":"해로운 사람에게 반복적으로 끌리는 것은 어린 시절 불안정하고 해로운 관계가 '친숙함'으로 느껴지기 때문입니다. 안정적이고 건강한 관계가 오히려 낯설고 어색하게 느껴질 수 있어요. 이 패턴을 인식하는 것이 변화의 첫걸음입니다.","domain_codes":["P3-002","P1-002"],"tags":["복합트라우마","반복패턴","관계"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"복합트라우마","question":"복합트라우마 치유를 위해 혼자 할 수 있는 것이 있나요?","answer":"전문 치료가 최우선이지만, 보조적으로 (1) 안전한 루틴 만들기, (2) 신체 활동(요가, 걷기), (3) 창의적 표현(글쓰기, 그림), (4) 자기 연민 연습, (5) 안전한 관계 유지가 도움이 됩니다. 혼자 깊은 트라우마를 파고드는 것은 권장하지 않아요.","domain_codes":["P3-002"],"tags":["복합트라우마","자가관리","보조"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
{"category":"복합트라우마","question":"복합트라우마에서 신체 증상이 나타날 수 있나요?","answer":"네, 복합 트라우마는 다양한 신체 증상을 유발할 수 있어요. 만성 통증, 소화 장애, 두통, 피로, 면역계 문제가 트라우마와 연결될 수 있습니다. 이는 신체가 감당하지 못한 감정과 스트레스를 처리하는 방식입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","신체화","신체증상"],"user_persona":"P07","persona_age_range":"50-59","persona_gender":"남성"},
{"category":"복합트라우마","question":"내가 경험한 것을 정확히 기억하지 못해요. 이게 트라우마인가요?","answer":"트라우마 기억은 일반 기억과 다르게 단편적이고 비선형적으로 저장될 수 있어요. 전체를 명확히 기억하지 못하는 것이 트라우마를 부정하는 근거가 아닙니다. 감정적, 신체적 기억이 남아있을 수 있어요.","domain_codes":["P3-002"],"tags":["복합트라우마","기억","단편적"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"복합트라우마","question":"복합트라우마를 치료하는 상담사를 어떻게 찾을 수 있나요?","answer":"복합 트라우마 전문 상담사를 찾는 방법: (1) 트라우마 전문 치료사(EMDR, IFS, 소매틱 접근 자격증 보유), (2) 한국상담심리학회나 한국임상심리학회 자격증 보유 전문가, (3) 정신건강복지센터 연결이 도움이 됩니다.","domain_codes":["P3-002"],"tags":["복합트라우마","치료사","찾기"],"user_persona":"P09","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"복합트라우마","question":"복합트라우마 치유 중 관계에서 갑자기 화가 폭발해요.","answer":"치유 과정에서 억눌렸던 분노가 표면으로 올라오는 것은 흔합니다. 이것은 치유가 일어나고 있다는 신호이기도 해요. 하지만 관계를 다치지 않도록 분노를 안전하게 처리하는 방법(치료 내에서)이 필요합니다.","domain_codes":["P3-002"],"tags":["복합트라우마","분노","치유과정"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"복합트라우마","question":"어릴 때 성적 학대를 받았어요. 어른이 된 지금도 성 관계가 힘들어요.","answer":"어린 시절 성적 학대 경험이 성인의 성적 경험에 영향을 주는 것은 매우 흔합니다. 이것은 회복 불가능한 것이 아니에요. 트라우마 전문 치료사와 함께, 자신의 속도로, 신체 안전감부터 다시 쌓아가는 과정이 필요합니다.","domain_codes":["P3-002"],"tags":["복합트라우마","성학대","성관계"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"복합트라우마","question":"복합트라우마가 있는데 취업이나 사회 활동이 너무 어려워요.","answer":"복합 트라우마는 직장에서의 권위 관계, 갈등 상황, 평가 받는 상황에서 트리거가 될 수 있어요. 취업이나 사회 활동의 어려움은 의지 부족이 아니라 신경계 반응입니다. 직업 재활이나 점진적 복귀를 지원해주는 전문가와 함께 접근하는 것이 도움이 됩니다.","domain_codes":["P3-002"],"tags":["복합트라우마","직장","사회활동"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},
{"category":"복합트라우마","question":"나쁜 기억을 잊고 싶어서 자꾸 새로운 것들로 채우려 해요.","answer":"나쁜 기억을 다른 것으로 채워 회피하는 것은 단기적으로 효과가 있지만, 기억이 처리되지 않으면 다른 방식으로 계속 영향을 줍니다. 회피보다 안전한 환경에서 기억을 처리하는 치료적 접근이 장기적으로 더 효과적입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","회피","채우기"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},
{"category":"복합트라우마","question":"복합트라우마가 있어도 자녀에게 좋은 부모가 될 수 있나요?","answer":"복합 트라우마가 있어도 좋은 부모가 될 수 있습니다. 자신의 패턴을 인식하고 치유 작업을 하는 것이 자녀에게 가장 큰 선물이에요. 완벽한 부모가 되는 것이 아니라, '충분히 좋은 부모'를 목표로 하세요.","domain_codes":["P3-002"],"tags":["복합트라우마","부모","자녀"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},
{"category":"복합트라우마","question":"내가 나쁜 사람을 끌어들이는 이유가 뭔가요?","answer":"반복적으로 해로운 관계에 들어가는 것은 '친숙한 위험'을 선택하는 무의식적 패턴입니다. 어린 시절 해로운 관계가 기본값이었을 때, 그것이 정상처럼 느껴집니다. 이 패턴을 인식하고 건강한 관계를 조심스럽게 선택하는 연습이 치유의 일부입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","반복패턴","선택"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
{"category":"복합트라우마","question":"화가 날 때 폭발적으로 반응하거나 완전히 얼어붙어요.","answer":"감정 조절의 양극단(폭발 또는 완전 차단)은 복합 트라우마에서 흔합니다. 신경계의 '과각성'과 '저각성' 사이를 오가는 것이에요. '최적 각성 창(window of tolerance)'을 넓히는 치료적 작업이 이 패턴을 줄이는 데 도움이 됩니다.","domain_codes":["P3-002"],"tags":["복합트라우마","감정조절","극단"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"복합트라우마","question":"스스로를 해치고 싶다는 생각이 들 때가 있어요.","answer":"자해 또는 스스로를 해치고 싶다는 생각이 든다면, 지금 혼자 감당하지 마세요. 이것은 내면의 고통이 너무 커진 신호입니다. 지금 당장 신뢰할 수 있는 사람에게 말하거나, 정신건강 위기 상담 전화(1577-0199)에 연락해주세요.","domain_codes":["P3-002"],"tags":["복합트라우마","자해","위기"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},
{"category":"복합트라우마","question":"복합트라우마 치유에서 신체 접근(소매틱)이란 무엇인가요?","answer":"소매틱(somatic) 접근은 트라우마가 신체에 저장된다는 것을 바탕으로, 신체 감각을 통해 트라우마를 처리하는 방법입니다. 신체 감각 알아채기, 움직임, 호흡, 자세 등을 통해 신경계를 조절하는 기법이에요. SE(Somatic Experiencing)이 대표적입니다.","domain_codes":["P3-002"],"tags":["복합트라우마","소매틱","신체"],"user_persona":"P09","persona_age_range":"30-39","persona_gender":"남성"},

# P4-002 경계 +9
{"category":"경계","question":"내가 원하는 것을 말하는 것 자체가 너무 어려워요.","answer":"원하는 것을 말하기 어려운 것은 오랫동안 욕구가 무시되거나, 욕구를 표현하면 부정적인 결과가 있었던 경험에서 옵니다. 아주 작고 안전한 욕구부터 표현해보는 연습이 시작점이에요.","domain_codes":["P4-002"],"tags":["경계","욕구표현","시작"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"경계","question":"경계를 세울 때 어떤 말을 사용하면 효과적인가요?","answer":"효과적인 경계 표현: '나는 ~할 수 없어요'(능력), '나는 ~하지 않을 거예요'(선택), '나는 ~가 필요해요'(욕구), '~하면 나는 ~할 거예요'(결과). 비난 없이 자신의 입장을 명확히 하는 것이 핵심입니다.","domain_codes":["P4-002"],"tags":["경계","언어","기술"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
{"category":"경계","question":"상대가 나를 조종하는 것 같은데 경계를 어떻게 세울 수 있나요?","answer":"조종적 행동에 경계를 세울 때는 조종 패턴을 먼저 인식하는 것이 중요합니다. '그 말이 나를 특정 방향으로 유도하고 있다'는 것을 알아채면, 즉각 반응하지 않고 시간을 두는 것이 첫 번째 경계입니다.","domain_codes":["P4-002"],"tags":["경계","조종","패턴인식"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"경계","question":"관계가 나를 소진시키는 것 같아요. 어떻게 해야 하나요?","answer":"관계가 지속적으로 소진을 유발한다면 주는 것과 받는 것의 불균형, 경계 부재, 또는 관계 자체의 문제일 수 있어요. 먼저 어떤 상호작용에서 가장 소진되는지 구체적으로 살펴보고, 그 부분에 경계를 세우는 것이 시작입니다.","domain_codes":["P4-002"],"tags":["경계","소진","관계"],"user_persona":"P04","persona_age_range":"40-49","persona_gender":"여성"},
{"category":"경계","question":"모든 관계에서 경계를 세워야 하나요?","answer":"모든 관계에서 경계가 필요하지만, 관계의 친밀도와 맥락에 따라 경계의 유연성이 다릅니다. 가까운 관계에서는 더 유연한 경계가, 직업적·새로운 관계에서는 더 명확한 경계가 일반적이에요. 경계는 상황에 맞게 조절되는 것입니다.","domain_codes":["P4-002"],"tags":["경계","모든관계","유연성"],"user_persona":"P02","persona_age_range":"30-39","persona_gender":"남성"},
{"category":"경계","question":"내 공간이나 물건에 대한 경계를 세워도 되나요?","answer":"당연히 됩니다. 물리적 공간(방, 책상)과 물건에 대한 경계는 기본적인 개인 영역입니다. '내 물건을 허락 없이 쓰지 말아줘'라는 표현은 정당한 경계 표현이에요.","domain_codes":["P4-002"],"tags":["경계","물리적","공간"],"user_persona":"P08","persona_age_range":"20-29","persona_gender":"논바이너리"},
{"category":"경계","question":"경계를 세웠는데 왜 더 외로운 것 같죠?","answer":"경계를 세운 후 외로움이 느껴지는 것은 이전의 관계 방식(경계 없이 가까웠던)이 사라지기 때문입니다. 이 외로움은 새로운 방식의 연결을 만들어가는 과도기에 나타나는 자연스러운 감각이에요.","domain_codes":["P4-002"],"tags":["경계","외로움","과도기"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"경계","question":"상대에게 경계를 표현했더니 '예전에는 괜찮았잖아'라고 해요.","answer":"'예전에 괜찮았으면 지금도 괜찮아야 해'는 경계 변화를 인정하지 않는 반응입니다. 경계는 상황과 시간에 따라 달라질 수 있어요. '지금 나는 이것이 필요해'라고 현재 입장을 명확히 하는 것이 중요합니다.","domain_codes":["P4-002"],"tags":["경계","변화","일관성"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"경계","question":"건강한 관계에서 경계는 어떤 모습인가요?","answer":"건강한 관계에서의 경계는 (1) 양방향으로 존중되고, (2) 명확하게 표현될 수 있고, (3) 시간이 지나며 함께 조율되며, (4) 경계를 표현했을 때 처벌이 없고, (5) 각자의 개인성이 유지됩니다. 경계 있는 관계가 더 깊은 연결을 만들어요.","domain_codes":["P4-002"],"tags":["경계","건강한관계","특징"],"user_persona":"P09","persona_age_range":"30-39","persona_gender":"남성"},

# P5-001 커플갈등 +3
{"category":"커플갈등","question":"상대방이 나를 비교해요. 전 연인이나 다른 사람과요.","answer":"파트너에게 다른 사람과 비교당하는 것은 매우 상처가 됩니다. '비교는 내가 수용하기 어렵다'고 명확히 표현하는 것이 필요해요. 이 행동이 지속된다면 관계에서 존중의 문제로 진지하게 이야기해야 합니다.","domain_codes":["P5-001"],"tags":["커플갈등","비교","존중"],"user_persona":"P01","persona_age_range":"20-29","persona_gender":"여성"},
{"category":"커플갈등","question":"상대방이 나의 감정을 '오버한다'고 무시해요.","answer":"감정을 '오버'로 규정하는 것은 가스라이팅의 형태일 수 있습니다. '내 감정은 내 것이고, 네가 유효하지 않다고 결정할 수 없어'라는 것을 명확히 표현하는 것이 필요해요. 이런 패턴이 반복된다면 관계 상담이 도움이 됩니다.","domain_codes":["P5-001"],"tags":["커플갈등","가스라이팅","감정무시"],"user_persona":"P06","persona_age_range":"30-39","persona_gender":"여성"},
{"category":"커플갈등","question":"싸울 때마다 '헤어지자'는 말을 해요. 어떻게 해야 하나요?","answer":"갈등 중 '헤어지자'를 반복하는 것은 협박적 패턴이거나 감정 조절의 어려움일 수 있습니다. '그 말이 올 때마다 나는 관계의 안정성을 느끼지 못한다'고 표현하고, 갈등 방식에 대한 합의를 구하는 것이 필요합니다.","domain_codes":["P5-001"],"tags":["커플갈등","협박","갈등방식"],"user_persona":"P03","persona_age_range":"20-29","persona_gender":"남성"},
]

total = len(QA_DATA)
new_count = 0
dup_count = 0

for i, item in enumerate(QA_DATA):
    q = item["question"].strip()
    if q in existing:
        print(f"  중복 [{i+1}/{total}] {q[:40]}")
        dup_count += 1
        continue

    rows = sb_request("POST", "sex_qa", {
        "category": item["category"],
        "question": item["question"],
        "answer": item["answer"],
        "domain_codes": item["domain_codes"],
        "tags": item["tags"],
        "user_persona": item["user_persona"],
        "persona_age_range": item["persona_age_range"],
        "persona_gender": item["persona_gender"],
    })
    row_id = rows[0]["id"]

    text = f"{item['question']} {item['answer']}"
    emb = model.encode([text], normalize_embeddings=True)[0].tolist()
    upsert_vectorize([{"id": str(row_id), "values": emb, "metadata": {
        "domain": item["domain_codes"][0],
        "category": item["category"],
    }}])

    existing.add(q)
    new_count += 1
    print(f"  ✓ [{i+1}/{total}] [{item['domain_codes'][0]}] {q[:50]}")

print(f"\n완료 — 신규: {new_count}개, 중복: {dup_count}개")
