# 12문항 간편 설문 — 실제 추천 연결

상태: 운영 백엔드 API 반영 확인, 웹사이트 게시 전. 48문항 동등성 및 임상적 타당성 미검증.

## 데이터 흐름

- 웹 GET /api/v1/surveys/short/ → 최신 DB에서 선정한 12문항, 원래 5단계 선택지, 판본 해시.
- 처리 동의 후 응답을 POST 같은 경로로 전송. version, consent=true, answers={question_id: response_id}.
- 서버가 원래 가중치·역채점·축별 기준점과 기존 NutrientScoringService를 사용한다.
- 예시 영양소 목록/브라우저 임시 50% 판정은 제거했다. 서버 오류·시간 초과·설문 판본 변경 시 오류/재시도 안내만 표시한다.
- 응답과 결과는 계정/DB/로컬 저장소에 기록하지 않는다. 신규 API에서 본문을 로그로 남기지 않는다. 인프라/WAF/APM의 요청본문 수집 여부는 출시 전 별도 확인한다.
- 인증 토큰·쿠키는 보내지 않는다. 로그인하더라도 이 API는 계정에 연결하지 않는다.

## 축약 판정 v1 (short-12-projection-v1)

선정 원문 번호: AS 1/5/8, PR 11/17/20, BI 21/23/30, CT 36/39/43.

축 점수 = 선택 3문항의 Σ(score_contribution × weight) / 선택 문항 weight 합 × 전체 축 weight 합.
그 뒤 실제 12개 응답으로 성립한 앱의 패턴 보너스만 더하고, 앱의 축별 threshold와 비교한다. 기준점 이상이면 A/P/B/C, 미만이면 S/R/I/T다. 반올림 전 점수로 판정한다.

이 환산식은 같은 축 안에서 선택 3문항이 전체를 대표한다는 가정이다. 사용자 응답 자료로 보정한 기준이 아니며, 빠진 36문항을 임의 응답으로 채우지 않는다. 미관측 패턴은 적용되지 않는다. 기존 48문항 submit/report 동작은 변경하지 않았다.

화면 비율은 전체 축의 기본 최소/최대 점수 범위에서 환산 점수가 위치하는 비율(0~100 제한)이다. 유형 확률이 아니다. 앱 threshold가 중간점과 다르므로 비율과 유형의 방향은 다를 수 있다. 비율 50의 축은 수치/막대 대신 중립 안내를 유지한다.

## 추천 방식과 한계

기존 앱 엔진의 유형별 기본점수 + 실제 답변으로 확인된 건강관심사 점수 + 확인된 영양소 패턴 점수를 합산한다. 배타 그룹을 정리하고 점수순 최대 5개와 DB 추천 이유를 반환한다. 후보 부족 시 임의 보충하지 않는다. 기존 앱과 엔진은 같지만 입력 정보가 적으므로 결과가 같다고 보증하지 않는다.

비로그인 웹에는 개인별 금기 필터가 없다. 섭취량·논문·미관측 건강관심사 목록은 공개 응답에서 제외한다. 화면 문구:

> 앱에서 로그인하고 건강 특이사항을 등록하면, 등록한 정보에 따른 섭취 금기 영양소 필터와 주의사항을 심층 리포트에서 함께 확인할 수 있어요.

앱의 정밀 설문 완료와 기능별 이용 조건이 필요할 수 있다. 웹 결과가 앱 계정에 자동 이관되는 기능은 없다.

## 개발자 연결 지점

- 백엔드 `harudual-backend`: `surveys/short_views.py`, `surveys/services/short_survey.py`, `surveys/services/short_score.py`.
- 웹: js/short-survey-api.js (통신/응답 검증), js/short-survey.js (화면).
- 기본 API는 https://api.harudooal.com/api/v1/surveys/short/. 로컬/DEV 검증 시 HTML head에 meta name="short-survey-api" content="검증 서버의 /api/v1/surveys/short/ URL"을 지정한다. 운영 HTML에 localhost/DEV 주소를 커밋하지 않는다.
- 백엔드를 먼저 배포하고 실제 웹 Origin만 CORS 허용한다. API 배포 전에는 설문 로딩 실패가 정상이며 예시로 우회하지 않는다.
- js/short-survey-data.js는 출처 보존 및 테스트용 후보 fixture이며 런타임에 로드하지 않는다. 운영 문항 ID는 API에서 받는다.
- 스키마/채점 입력 변경 시 판본 해시가 달라져 진행 중인 설문은 재시작을 요구한다.
- API는 IP당 20회/분 제한, no-store 응답. 인프라 동의문/보관정책/민감정보 처리 검토 후 출시한다.

## 검증

웹: node --test tests/short-survey.test.cjs
백엔드: python manage.py test surveys.test_short_survey surveys.test_short_api surveys.test_scoring_golden
E2E: scripts/e2e-test.py의 Anonymous Short Survey 여정(DEV).

테스트 범위: 가중치/역채점 환산, 중간응답 ARBC, 앱 48문항 골든 회귀, 12개 답변만 추천 엔진에 전달, 시드 기반 실제 추천 5개/추천 이유/응답별 변화, 동의/잘못된 답변/판본 변경/요청 제한/미저장, 웹 오류·빈 결과·늦은 응답·텍스트 이스케이프.

합성 테스트는 실사용자 일치도나 의학적 타당성 검증이 아니다. 출시 전 동의된 비식별 48문항 데이터로 축별·유형별 일치율, 혼동행렬, 경계 응답 비율을 별도 검증해야 한다. 운영 마스터와 저장소 시드의 일치도는 아직 확인하지 않았다.

## 배포

웹 게시 원본은 `SKKU-startup/harudooal-root`의 `main` 브랜치다. 이 기능은 별도 브랜치/PR로 검토한 뒤 병합하면 GitHub Pages가 게시한다.
운영 백엔드 `GET /api/v1/surveys/short/` 200 응답 및 `https://harudooal.com` Origin의 CORS 허용을 확인했다. 웹 게시 후 실제 브라우저에서 시작·12문항 응답·결과·추천 이유·앱 링크를 다시 점검한다.
