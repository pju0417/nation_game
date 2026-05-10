/* =========================================================
   나라 경영 시뮬레이션 · firebase-config.js
   
   ★ Firebase 설정 방법 (5분 소요):
   
   1. https://console.firebase.google.com 접속 (Google 계정 로그인)
   2. [프로젝트 추가] 클릭 → 이름 입력 → 생성 완료
   3. 왼쪽 메뉴 [빌드] → [Realtime Database] 클릭
   4. [데이터베이스 만들기] → 지역: asia-southeast1 선택
      → [테스트 모드에서 시작] 선택 → [완료]
   5. 왼쪽 상단 ⚙️ [프로젝트 설정] 클릭
   6. 하단 [내 앱] 영역에서 </> (웹) 아이콘 클릭
   7. 앱 닉네임 입력 후 [앱 등록]
   8. firebaseConfig 객체의 값들을 아래에 복사하여 붙여넣기
   
   made by 박선생
========================================================= */

const FIREBASE_CONFIG = {
  apiKey:            "여기에 apiKey 입력",
  authDomain:        "여기에 authDomain 입력",
  databaseURL:       "여기에 databaseURL 입력",   // ← 필수! https://...firebaseio.com 형식
  projectId:         "여기에 projectId 입력",
  storageBucket:     "여기에 storageBucket 입력",
  messagingSenderId: "여기에 messagingSenderId 입력",
  appId:             "여기에 appId 입력"
};

/* ─── 설정 완료 여부 자동 확인 ─────────────────────── */
const FIREBASE_CONFIGURED = (
  FIREBASE_CONFIG.apiKey !== "여기에 apiKey 입력" &&
  FIREBASE_CONFIG.databaseURL.includes("firebaseio.com")
);
