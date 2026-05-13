/* =========================================================
   나라 경영 시뮬레이션 · firebase-config.js
   made by 박선생

   ★ 아래 값들을 Firebase 콘솔에서 복사해서 채워주세요.
   ★ 설정 방법은 README.md 또는 하단 주석을 참고하세요.
========================================================= */

var FIREBASE_CONFIG = {
  apiKey: "AIzaSyAM9g8Mezj-sd3vU3wE_Nfa2eFEy7F2RD8",
  authDomain: "nation-game-f4032.firebaseapp.com",
  databaseURL: "https://nation-game-f4032-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nation-game-f4032",
  storageBucket: "nation-game-f4032.firebasestorage.app",
  messagingSenderId: "969425712284",
  appId: "1:969425712284:web:7694efd12e442c26336959",
  measurementId: "G-E6BM6KQM34"
};

/*
  설정값이 채워졌는지 자동으로 확인합니다.
  databaseURL이 없으면 온라인 대전 버튼이 비활성화됩니다.
*/
var FIREBASE_CONFIGURED = (
  FIREBASE_CONFIG.apiKey !== "여기에_apiKey_붙여넣기" &&
  typeof FIREBASE_CONFIG.databaseURL === "string" &&
  FIREBASE_CONFIG.databaseURL.indexOf("firebasedatabase.app") !== -1
);
