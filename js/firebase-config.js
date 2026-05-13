/* =========================================================
   나라 경영 시뮬레이션 · firebase-config.js
   made by 박선생

   ★ 아래 값들을 Firebase 콘솔에서 복사해서 채워주세요.
   ★ 설정 방법은 README.md 또는 하단 주석을 참고하세요.
========================================================= */

var FIREBASE_CONFIG = {
  apiKey:            "여기에_apiKey_붙여넣기",
  authDomain:        "여기에_authDomain_붙여넣기",
  databaseURL:       "여기에_databaseURL_붙여넣기",
  projectId:         "여기에_projectId_붙여넣기",
  storageBucket:     "여기에_storageBucket_붙여넣기",
  messagingSenderId: "여기에_messagingSenderId_붙여넣기",
  appId:             "여기에_appId_붙여넣기"
};

/*
  설정값이 채워졌는지 자동으로 확인합니다.
  databaseURL이 없으면 온라인 대전 버튼이 비활성화됩니다.
*/
var FIREBASE_CONFIGURED = (
  FIREBASE_CONFIG.apiKey !== "여기에_apiKey_붙여넣기" &&
  typeof FIREBASE_CONFIG.databaseURL === "string" &&
  FIREBASE_CONFIG.databaseURL.indexOf("firebaseio.com") !== -1
);
