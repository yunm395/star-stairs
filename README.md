# 별까지 계단

노을 언덕에서 은하수까지, 끝없이 이어지는 돌계단을 오르는 반사신경 게임이에요.

## 하는 법

| 버튼 | 키보드 | 동작 |
|---|---|---|
| 오르기 | `J` 또는 `→` | 바라보는 쪽으로 한 칸 |
| 방향 바꾸기 | `F` 또는 `←` | 몸을 돌려 반대쪽으로 한 칸 |

- 아래 시간 막대가 다 줄면 끝나요. 오를수록 빨리 줄어요.
- **별**: 시간이 늘어요.
- **깃털**: 50칸쯤부터 가끔 나와요. 한 번 헛디뎌도 버텨요.
- **황금 열쇠**: 100칸쯤부터 가끔 나와요. 코인이 가득한 황금 계단으로 15초 동안 떠나요. 거기서는 떨어져도 원래 계단으로 돌아와요.
- **코인**: 상점에서 캐릭터 10종과 계단 이펙트 10종을 사요. 사기 전에 미리보기로 볼 수 있어요.
- **랭킹**: 한 사람당 최고 기록 하나가 올라가고, 상위 20명이 보여요.

## 구조

```
docs/index.html              게임 전체 (HTML·CSS·JS 한 파일) — GitHub Pages가 이 폴더를 보여 줘요
netlify/functions/scores.mjs 랭킹 API  GET/POST /api/scores
netlify/lib/board.mjs        랭킹 규칙 (검사·정렬·공개용 목록)
tests/board.test.mjs         랭킹 규칙 테스트
netlify.toml                 Netlify 설정
```

- 게임 페이지는 **GitHub Pages**(`아이디.github.io/저장소이름`)에서 열려요.
- 랭킹 서버는 **Netlify Functions**에서 돌고, 기록은 Netlify Blobs에 저장돼요. 따로 데이터베이스가 필요 없어요.
- 코인, 산 물건, 최고 기록은 각자의 브라우저(localStorage)에 저장돼요.
- 랭킹에는 브라우저마다 만든 무작위 id로 기록을 올려요. 다른 사람의 id는 화면에 내보내지 않아요.

## 배포

**GitHub Pages (게임 페이지)**
1. 저장소의 **Settings → Pages**로 가요.
2. Source를 **Deploy from a branch**, Branch를 **main**, 폴더를 **/docs**로 고르고 Save를 눌러요.

**Netlify (랭킹 서버)**
1. Netlify에서 **Add new project → Import an existing project → GitHub**를 고르고 이 저장소를 선택해요.
2. 설정은 `netlify.toml`에 들어 있어서 그대로 **Deploy**를 누르면 돼요.
3. 만들어진 사이트 주소(`https://○○○.netlify.app`)를 `docs/index.html`의 `RANK_SERVER`에 적고 다시 올려요.

이후 `main` 브랜치에 올리면 두 곳 모두 자동으로 다시 배포돼요.

## 테스트

```bash
npm test
```

## 알아 둘 점

- 랭킹 서버는 들어온 숫자를 검사(1~100,000칸)만 해요. 마음먹고 조작하는 것까지 막지는 못해요.
