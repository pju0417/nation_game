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

  const firebaseConfig = {
    apiKey: "AIzaSyAM9g8Mezj-sd3vU3wE_Nfa2eFEy7F2RD8",
    authDomain: "nation-game-f4032.firebaseapp.com",
    databaseURL: "https://nation-game-f4032-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nation-game-f4032",
    storageBucket: "nation-game-f4032.firebasestorage.app",
    messagingSenderId: "969425712284",
    appId: "1:969425712284:web:7694efd12e442c26336959",
    measurementId: "G-E6BM6KQM34"
  };


/* ─── 설정 완료 여부 자동 확인 ─────────────────────── */
const FIREBASE_CONFIGURED = (
  FIREBASE_CONFIG.apiKey !== "AIzaSyAM9g8Mezj-sd3vU3wE_Nfa2eFEy7F2RD8" &&
  FIREBASE_CONFIG.databaseURL.includes("firebaseio.com")
);
