# 하루두알 웹사이트 배포 운영 가이드

이 저장소는 별도의 서버 빌드가 필요 없는 정적 사이트입니다. 운영 구조는 다음과 같습니다.

- 원본/배포 소스: GitHub 저장소 `SKKU-startup/harudooal-root`의 `main` 브랜치 루트
- 정적 호스팅: GitHub Pages
- 도메인 및 DNS 관리: 가비아
- 운영 도메인: `https://harudooal.com`
- ESG 자료실: `https://harudooal.com/esg.html`

즉, 가비아에 HTML이나 PDF를 직접 업로드하지 않습니다. 가비아는 `harudooal.com`을 GitHub Pages로 연결하고, 실제 사이트 파일은 `main`에 반영될 때 GitHub Pages가 배포합니다.

## 1. 필요한 권한과 준비물

아래 권한이 모두 있어야 최초 설정과 장애 대응까지 할 수 있습니다.

1. GitHub 조직 `SKKU-startup` 및 저장소 `harudooal-root`의 Write 이상 권한
2. GitHub Pages 설정 변경을 위한 저장소 Admin 권한
3. `harudooal.com`을 관리하는 가비아 계정 또는 해당 도메인의 DNS 설정 권한
4. Git과 웹 브라우저

배포만 반복할 때는 저장소에 push/merge할 권한으로 충분합니다. DNS는 도메인을 처음 연결하거나 연결 장애가 발생할 때만 수정합니다.

## 2. 운영 구조를 먼저 확인하기

저장소 루트의 `CNAME` 파일은 반드시 다음 한 줄을 유지해야 합니다.

```text
harudooal.com
```

`index.html`, `esg.html`, `css`, `js`, `assets`, `CNAME`이 모두 배포 대상입니다. ESG PDF는 아래 경로에 있어야 합니다.

```text
assets/documents/harudooal-esg-policy-guidelines.pdf
```

## 3. 로컬에서 변경 작업하기

항상 최신 `main`에서 별도 브랜치를 만듭니다.

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/my-change
```

파일을 수정한 뒤 로컬에서 정적 서버를 실행합니다.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 다음 주소를 차례대로 확인합니다.

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/esg.html`
- `http://127.0.0.1:8000/assets/documents/harudooal-esg-policy-guidelines.pdf`

확인 후 서버 터미널에서 `Ctrl+C`를 눌러 종료합니다.

## 4. 커밋과 원격 브랜치 푸시

의도한 파일만 변경되었는지 확인하고 커밋합니다.

```powershell
git status --short
git diff --check
git diff -- index.html esg.html css/styles.css
git add index.html esg.html css/styles.css assets/documents/harudooal-esg-policy-guidelines.pdf
git commit -m "feat: add ESG document library"
git push -u origin feat/my-change
```

## 5. Pull Request 검토와 main 병합

GitHub 저장소에서 `Compare & pull request`를 눌러 PR을 만듭니다. 다음 항목을 확인합니다.

1. Base가 `main`인지 확인
2. Compare가 방금 올린 작업 브랜치인지 확인
3. 변경 파일에 PDF가 포함되었는지 확인
4. `CNAME`이 삭제되거나 바뀌지 않았는지 확인
5. 리뷰/상태 검사를 통과한 뒤 `Merge pull request` 실행
6. 저장소 정책에 따라 `Create a merge commit`, `Squash and merge`, `Rebase and merge` 중 허용된 방식을 사용

직접 병합 권한이 있고 저장소 정책상 PR이 필수가 아니라면 로컬에서 다음과 같이 fast-forward 병합할 수 있습니다.

```powershell
git switch main
git pull --ff-only origin main
git merge --ff-only feat/my-change
git push origin main
```

## 6. GitHub Pages 최초/재설정

이 설정은 보통 최초 한 번만 합니다.

1. GitHub에서 `SKKU-startup/harudooal-root` 저장소 열기
2. `Settings` 클릭
3. 왼쪽 `Code and automation` 아래 `Pages` 클릭
4. `Build and deployment`의 `Source`를 `Deploy from a branch`로 선택
5. Branch를 `main`, 폴더를 `/(root)`로 선택
6. `Save` 클릭
7. `Custom domain`에 `harudooal.com` 입력 후 `Save`
8. DNS 검사 성공 여부 확인
9. 인증서가 준비되면 `Enforce HTTPS` 체크

`CNAME` 파일만 저장소에 두는 것으로 Pages의 Custom domain 설정이 자동 생성되지는 않습니다. GitHub 설정 화면의 Custom domain 값도 반드시 확인합니다.

## 7. 가비아 DNS 설정

현재 `harudooal.com`은 가비아 네임서버를 사용하고, 루트 도메인의 A 레코드가 GitHub Pages 주소 네 개를 가리키는 구조입니다. 기존 설정이 정상이라면 배포 때마다 수정하지 않습니다.

최초 연결 또는 복구가 필요할 때만 다음 순서로 설정합니다.

1. [가비아](https://www.gabia.com/) 로그인
2. 오른쪽 위 `My가비아`에서 `서비스 관리` 이동
3. `DNS 관리툴` 이동
4. `harudooal.com` 오른쪽의 `설정` 클릭
5. DNS 설정에서 `레코드 수정` 클릭
6. 루트 호스트 `@`에 아래 A 레코드 네 개를 각각 추가

| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | 600 또는 기본값 |
| A | @ | 185.199.109.153 | 600 또는 기본값 |
| A | @ | 185.199.110.153 | 600 또는 기본값 |
| A | @ | 185.199.111.153 | 600 또는 기본값 |

`www.harudooal.com`도 함께 운영하려면 다음 레코드를 추가합니다.

| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| CNAME | www | SKKU-startup.github.io. | 600 또는 기본값 |

주의사항:

- GitHub 공식 지침대로 `www` CNAME 값에는 저장소명(`/harudooal-root`)을 붙이지 않습니다.
- 동일한 `@` 호스트에 다른 웹서버를 가리키는 A/AAAA 레코드가 있으면 충돌하므로 정확한 용도를 확인한 뒤 정리합니다.
- 메일용 MX/TXT 레코드와 다른 서비스의 레코드는 삭제하지 않습니다.
- `*` 와일드카드 DNS 레코드는 도메인 탈취 위험 때문에 사용하지 않습니다.
- 가비아에서 레코드를 저장한 뒤 GitHub의 Custom domain 설정을 다시 확인합니다.

## 8. DNS와 HTTPS 확인

Windows PowerShell에서 다음 명령으로 확인합니다.

```powershell
Resolve-DnsName harudooal.com -Type A
Resolve-DnsName harudooal.com -Type NS
Resolve-DnsName www.harudooal.com -Type CNAME
```

정상 결과:

- A 레코드: `185.199.108.153`부터 `185.199.111.153`까지 네 개
- NS 레코드: 가비아 네임서버
- www를 설정했다면 CNAME: `SKKU-startup.github.io`

DNS 변경은 전 세계에 전파되는 데 시간이 걸릴 수 있습니다. GitHub는 DNS 변경 전파에 최대 24시간이 걸릴 수 있다고 안내합니다. 인증서 발급이 끝난 뒤 GitHub `Settings > Pages`에서 `Enforce HTTPS`를 켭니다.

## 9. 배포 상태와 운영 화면 확인

`main`에 병합된 뒤 GitHub 저장소의 `Actions` 탭에서 `pages build and deployment` 실행을 확인합니다. 성공 표시가 나온 다음 다음 URL을 점검합니다.

1. `https://harudooal.com/`이 HTTP 200으로 열리는지
2. 메인 메뉴와 메인 ESG 소개 영역에서 자료실로 이동하는지
3. `https://harudooal.com/esg.html`이 열리는지
4. 미리보기 버튼이 PDF를 새 창에서 여는지
5. PDF 다운로드 버튼이 파일을 내려받는지
6. 모바일 폭에서 카드와 버튼이 화면 밖으로 넘치지 않는지
7. `http://harudooal.com` 접속이 `https://harudooal.com`으로 전환되는지

GitHub Pages는 push 후 반영까지 최대 약 10분이 걸릴 수 있습니다. 즉시 보이지 않으면 Actions의 완료 여부를 먼저 보고, 강력 새로고침(`Ctrl+F5`) 또는 시크릿 창으로 캐시 영향을 배제합니다.

## 10. 장애 대응과 롤백

### Pages 빌드가 실패하는 경우

1. GitHub `Actions`에서 실패한 `pages build and deployment` 열기
2. 실패한 단계의 로그 확인
3. `Settings > Pages`에서 source가 `main / (root)`인지 확인
4. 루트에 `index.html`과 `CNAME`이 있는지 확인
5. 수정 커밋을 `main`에 반영하거나 Actions에서 재실행

### 도메인은 열리지만 예전 화면이 보이는 경우

1. `main`에 원하는 커밋이 실제로 있는지 확인
2. Pages 배포 실행이 그 커밋으로 성공했는지 확인
3. 브라우저 캐시를 지우거나 시크릿 창에서 확인
4. DNS A 레코드 네 개가 정확한지 확인

### 즉시 이전 버전으로 되돌리는 경우

이미 공유된 `main`의 이력을 강제로 재작성하지 말고, 문제가 된 커밋을 되돌리는 새 커밋을 만듭니다.

```powershell
git switch main
git pull --ff-only origin main
git switch -c revert/problem-change
git revert <문제가-된-커밋-SHA>
git push -u origin revert/problem-change
```

이후 되돌림 PR을 `main`에 병합하고 Pages 배포 완료를 확인합니다.

## ESG 문서 교체 시 체크리스트

기존 URL을 유지하면 외부 링크가 깨지지 않으므로 새 PDF를 같은 경로와 이름으로 교체하는 방식을 권장합니다.

1. 새 PDF의 공개 가능 여부와 개인정보 포함 여부 확인
2. 파일을 `assets/documents/harudooal-esg-policy-guidelines.pdf`로 교체
3. `esg.html`의 제정/개정일, 용량, 설명 갱신
4. 로컬 미리보기와 다운로드 확인
5. 브랜치 push, PR 검토, `main` 병합
6. 운영 URL에서 최신 문서인지 확인

## 참고 문서

- [GitHub Pages 게시 원본 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages 사용자 지정 도메인 관리](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages HTTPS 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [가비아 DNS 관리툴 안내](https://customer.gabia.com/manual/dns/227/2521)
