# 🌍 나라 경영 시뮬레이션
**기후와 문명의 이야기** · 초등학교 6학년 사회 · 여러 가지 기후

> made by 박선생

---

## 🎮 게임 소개
세계 여러 **기후 지역**의 나라를 맡아 경영하는 문명 시뮬레이션 게임입니다.  
건물을 짓고, 기술을 연구하고, 정책을 펼쳐 나라를 발전시키세요!  
정해진 턴 안에 **종합 국력 1위**를 달성한 나라가 승리합니다.

---

## 🌐 GitHub Pages 배포 방법

### 1단계: 저장소 생성
1. GitHub에서 새 저장소(Repository) 생성
2. 저장소 이름 예시: `country-simulation`

### 2단계: 파일 업로드
아래 구조 그대로 GitHub에 업로드합니다.
```
/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── constants.js
    ├── engine.js
    ├── ui.js
    ├── screens.js
    └── main.js
```

### 3단계: GitHub Pages 활성화
1. 저장소 → `Settings` → `Pages`
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `(root)`
4. `Save` 클릭

### 4단계: 접속
약 1~2분 후 아래 주소로 접속 가능합니다.
```
https://[깃허브 아이디].github.io/[저장소 이름]/
```

---

## 📁 파일 구조 설명

| 파일 | 역할 |
|------|------|
| `index.html` | 메인 HTML 진입점, 스크립트 로드 순서 관리 |
| `css/style.css` | 전체 스타일시트 |
| `js/constants.js` | 게임 데이터 (기후, 건물, 기술, 이벤트, 정책) |
| `js/engine.js` | 게임 로직 (플레이어 생성, 점수 계산, 턴 처리, AI) |
| `js/ui.js` | 재사용 UI 헬퍼 함수 (자원 바, 카드, 차트 등) |
| `js/screens.js` | 각 화면 렌더링 함수 (메뉴, 설정, 게임, 결과 등) |
| `js/main.js` | 게임 상태(G), 전역 핸들러, 렌더 라우터, 초기화 |

> **로드 순서**: `constants → engine → ui → screens → main`  
> main.js에서 G 상태를 정의하므로 반드시 마지막에 로드해야 합니다.

---

## 🌍 6대 기후 특징

| 기후 | 지역 | 강점 | 약점 |
|------|------|------|------|
| 🌴 열대 | 동남아시아, 아프리카 중부, 아마존 | 식량 탁월 | 과학 느림 |
| 🏜️ 건조 | 북아프리카, 중동, 중앙아시아 | 금화 풍부 | 식량 부족 |
| 🌿 온대 | 서유럽, 동아시아, 북아메리카 | 모든 자원 균형 | 특별 보너스 없음 |
| 🌲 냉대 | 러시아, 캐나다, 북유럽 | 과학·생산력 강함 | 식량·금화 부족 |
| 🌾 계절풍 | 한국, 중국, 일본, 인도 | 식량·문화 강함 | 태풍·홍수 위험 |
| ⛰️ 고산 | 안데스, 히말라야, 티베트 | 과학·금화 강함 | 식량 제한 |

---

## 📊 국력 점수 구성

| 분야 | 계산 방법 |
|------|-----------|
| 💰 경제력 | 금화 자원 ÷2 + 시장×8 + 광산×5 + 항구×6 |
| ⚔️ 군사력 | 군사 수치 × 2.5 |
| 🔬 과학력 | 연구 기술 수 × 12 + 과학 자원 ÷3 |
| 🎨 문화력 | 문화 자원 ÷2 + 사원×8 + 극장×14 |
| 👥 인구력 | 인구 × 6 |
| 🤝 외교력 | 외교 보너스 합계 |

---

## 🔄 턴 진행 순서
1. 각 플레이어가 순서대로 **건설 / 연구 / 정책** 중 각 1개씩 선택
2. 모든 플레이어의 결정이 끝나면 동시에 처리
3. 무작위 이벤트(풍년, 가뭄, 발견 등)가 각 나라에 발생
4. 턴 결과 확인 후 다음 턴으로 진행

---

## 🎓 교육 연계
- **교과**: 초등학교 6학년 사회
- **단원**: 여러 가지 기후
- **학습 목표**: 세계 기후의 종류와 각 기후의 특징 이해, 기후가 인간 생활에 미치는 영향 탐구
- **활동 방식**: 솔로(개인 탐구) 또는 멀티플레이(협동/경쟁 학습, 2~6인)

---

## 🌏 온라인 대전 (Firebase) 설정 방법

온라인 대전은 **Firebase Realtime Database** (무료)를 사용합니다.

### 1단계: Firebase 프로젝트 만들기
1. https://console.firebase.google.com 접속 (Google 계정 로그인)
2. **[프로젝트 추가]** → 이름 입력 → 완료

### 2단계: Realtime Database 생성
1. 왼쪽 메뉴 **[빌드] → [Realtime Database]**
2. **[데이터베이스 만들기]** → 지역: `asia-southeast1` → **[테스트 모드로 시작]** → 완료

### 3단계: 앱 등록 & 설정값 복사
1. 왼쪽 상단 ⚙️ **[프로젝트 설정]**
2. 하단 **[내 앱]** → `</>` (웹) 아이콘 클릭
3. 앱 닉네임 입력 → **[앱 등록]**
4. `firebaseConfig` 코드 블록의 각 값을 복사

### 4단계: firebase-config.js 수정
`js/firebase-config.js` 파일을 열고 **"여기에 ... 입력"** 부분을 복사한 값으로 교체합니다.

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "my-project.firebaseapp.com",
  databaseURL:       "https://my-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "my-project",
  storageBucket:     "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

### 5단계: GitHub에 업로드 & 플레이
수정된 파일을 GitHub에 push하면 온라인 대전이 활성화됩니다.

> ⚠️ **보안 주의**: `firebase-config.js`의 API 키는 Firebase의 **보안 규칙**으로 보호됩니다.  
> Firebase 콘솔 → Realtime Database → 규칙 탭에서 도메인 제한을 추가하면 더 안전합니다.
