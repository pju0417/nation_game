/* =========================================================
   나라 경영 시뮬레이션 · online.js
   Firebase Realtime Database 온라인 멀티플레이 로직
   made by 박선생
========================================================= */

/* ─── Firebase 앱 초기화 ─────────────────────────── */
var firebaseApp = null;
var db = null;

function initFirebase() {
  if (!FIREBASE_CONFIGURED) return false;
  try {
    if (!firebaseApp) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.database();
    return true;
  } catch(e) {
    console.error('Firebase 초기화 실패:', e);
    return false;
  }
}

/* ─── 온라인 상태 ────────────────────────────────── */
var OL = {
  roomCode:    null,   // 방 코드 (6자리)
  myPlayerId:  null,   // 이 기기의 플레이어 인덱스 (0~5)
  isHost:      false,  // 방장 여부
  playerName:  '',
  climateKey:  'temperate',
  roomRef:     null,   // Firebase 참조
  listeners:   [],     // 등록된 리스너 목록
  phase:       'lobby', // lobby | waiting | myTurn | waiting_turn | events | summary | results
  submitted:   false   // 이번 턴 제출 여부
};

/* ─── 유틸 ───────────────────────────────────────── */
function genRoomCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function roomRef(code) {
  return db.ref('rooms/' + code);
}

function offAll() {
  OL.listeners.forEach(function(ref) { ref.off(); });
  OL.listeners = [];
}

/* ─── 방 만들기 (호스트) ─────────────────────────── */
function createRoom() {
  if (!initFirebase()) { alert('Firebase 설정을 먼저 완료해 주세요!'); return; }

  var name    = document.getElementById('ol-name')    ? document.getElementById('ol-name').value.trim()    : '';
  var climate = document.getElementById('ol-climate') ? document.getElementById('ol-climate').value : 'temperate';
  if (!name) { alert('이름을 입력해 주세요.'); return; }

  OL.playerName = name;
  OL.climateKey = climate;
  OL.isHost     = true;
  OL.myPlayerId = 0;
  OL.roomCode   = genRoomCode();
  OL.roomRef    = roomRef(OL.roomCode);

  var diffVal     = document.getElementById('ol-diff')  ? document.getElementById('ol-diff').value  : 'normal';
  var turnsVal    = document.getElementById('ol-turns') ? parseInt(document.getElementById('ol-turns').value) : 20;

  var roomData = {
    host:      0,
    diff:      diffVal,
    maxTurns:  turnsVal,
    turn:      1,
    phase:     'lobby',
    maxPlayers: parseInt(document.getElementById('ol-maxp') ? document.getElementById('ol-maxp').value : 4),
    submittedCount: 0,
    players: {}
  };

  roomData.players[0] = {
    id:      0,
    name:    name,
    climate: climate,
    ready:   false
  };

  OL.roomRef.set(roomData).then(function() {
    G.phase = 'ol-lobby';
    render();
    listenLobby();
  }).catch(function(e) {
    alert('방 생성 실패: ' + e.message);
  });
}

/* ─── 방 참가 (게스트) ───────────────────────────── */
function joinRoom() {
  if (!initFirebase()) { alert('Firebase 설정을 먼저 완료해 주세요!'); return; }

  var name    = document.getElementById('ol-name-join')    ? document.getElementById('ol-name-join').value.trim()    : '';
  var climate = document.getElementById('ol-climate-join') ? document.getElementById('ol-climate-join').value : 'temperate';
  var code    = document.getElementById('ol-code')         ? document.getElementById('ol-code').value.toUpperCase().trim() : '';

  if (!name)  { alert('이름을 입력해 주세요.'); return; }
  if (!code)  { alert('방 코드를 입력해 주세요.'); return; }

  OL.playerName = name;
  OL.climateKey = climate;
  OL.isHost     = false;
  OL.roomCode   = code;
  OL.roomRef    = roomRef(code);

  OL.roomRef.once('value').then(function(snap) {
    var data = snap.val();
    if (!data) { alert('방을 찾을 수 없습니다. 코드를 확인해 주세요.'); return; }
    if (data.phase !== 'lobby') { alert('이미 게임이 시작된 방입니다.'); return; }

    var players = data.players || {};
    var count   = Object.keys(players).length;
    if (count >= data.maxPlayers) { alert('방이 꽉 찼습니다.'); return; }

    /* 동일 기후 체크 */
    var climateUsed = Object.values(players).some(function(p) { return p.climate === climate; });
    if (climateUsed) {
      alert('이미 선택된 기후입니다. 다른 기후를 선택해 주세요.');
      return;
    }

    OL.myPlayerId = count;

    var playerData = {
      id:      count,
      name:    name,
      climate: climate,
      ready:   false
    };

    OL.roomRef.child('players/' + count).set(playerData).then(function() {
      G.phase = 'ol-lobby';
      render();
      listenLobby();
    });
  }).catch(function(e) {
    alert('방 참가 실패: ' + e.message);
  });
}

/* ─── 준비 완료 토글 ─────────────────────────────── */
function toggleReady() {
  OL.roomRef.child('players/' + OL.myPlayerId + '/ready').transaction(function(cur) {
    return !cur;
  });
}

/* ─── 게임 시작 (호스트만) ───────────────────────── */
function hostStartGame() {
  OL.roomRef.once('value').then(function(snap) {
    var data    = snap.val();
    var players = data.players || {};
    var list    = Object.values(players);

    if (list.length < 2) { alert('최소 2명이 필요합니다.'); return; }
    var notReady = list.filter(function(p) { return p.id !== 0 && !p.ready; });
    if (notReady.length > 0) { alert('모든 플레이어가 준비 완료해야 합니다.'); return; }

    /* 플레이어 초기 데이터 생성 */
    var startBonus = data.diff === 'easy' ? 6 : data.diff === 'hard' ? -3 : 0;
    var colors  = playerColors();
    var emojis  = playerEmojis();
    var cNames  = {};
    list.forEach(function(cfg) {
      var names = COUNTRY_NAMES[cfg.climate];
      cNames[cfg.id] = names[Math.floor(Math.random() * names.length)];
    });

    var initPlayers = {};
    list.forEach(function(cfg) {
      var base = CLIMATES[cfg.climate].base;
      initPlayers[cfg.id] = {
        id:       cfg.id,
        name:     cfg.name,
        country:  cNames[cfg.id],
        climate:  cfg.climate,
        color:    colors[cfg.id % colors.length],
        emoji:    emojis[cfg.id % emojis.length],
        resources: {
          food:       base.food       * 2 + 6 + startBonus,
          production: base.production * 2 + 5 + startBonus,
          gold:       base.gold       * 2 + 5 + startBonus,
          science:    base.science    * 2     + startBonus,
          culture:    base.culture    * 2     + startBonus
        },
        population: 3,
        buildings:  [],
        techs:      [],
        military:   5,
        dipBonus:   0,
        action:     { build:null, research:null, policy:null },
        scores:     { econ:0, mil:0, sci:0, cult:0, pop:0, dip:0, total:0 },
        submitted:  false
      };
      /* 초기 점수 */
      initPlayers[cfg.id].scores = calcScoreObj(initPlayers[cfg.id]);
    });

    OL.roomRef.update({
      phase:          'playing',
      turn:           1,
      players:        initPlayers,
      submittedCount: 0,
      turnLog:        null,
      scoreHist:      null
    }).then(function() {
      G.phase = 'ol-game';
      render();
      listenGame();
    });
  });
}

/* ─── 로비 리스너 ────────────────────────────────── */
function listenLobby() {
  offAll();
  var ref = OL.roomRef;
  OL.listeners.push(ref);

  ref.on('value', function(snap) {
    var data = snap.val();
    if (!data) return;

    if (data.phase === 'playing' && G.phase === 'ol-lobby') {
      G.phase = 'ol-game';
      render();
      listenGame();
      return;
    }

    if (G.phase === 'ol-lobby') render();
  });
}

/* ─── 게임 리스너 ────────────────────────────────── */
function listenGame() {
  offAll();
  var ref = OL.roomRef;
  OL.listeners.push(ref);

  ref.on('value', function(snap) {
    var data = snap.val();
    if (!data) return;

    /* 상태 동기화: G에 반영 */
    G.diff     = data.diff;
    G.maxTurns = data.maxTurns;
    G.turn     = data.turn || 1;

    var playerList = Object.values(data.players || {});
    playerList.sort(function(a,b){ return a.id - b.id; });
    G.players = playerList;
    G.curPlayer = OL.myPlayerId;

    /* 이벤트/요약 화면 전환 */
    if (data.phase === 'events' && G.phase !== 'ol-events') {
      G.turnLog  = data.turnLog  ? Object.values(data.turnLog)  : [];
      OL.submitted = false;
      G.phase = 'ol-events';
      render();
      return;
    }
    if (data.phase === 'summary' && G.phase !== 'ol-summary') {
      G.phase = 'ol-summary';
      render();
      return;
    }
    if (data.phase === 'results' && G.phase !== 'ol-results') {
      G.phase = 'ol-results';
      render();
      return;
    }
    if (data.phase === 'playing') {
      render();
    }
  });
}

/* ─── 턴 제출 (온라인) ───────────────────────────── */
function olSubmitTurn() {
  if (OL.submitted) return;
  OL.submitted = true;

  var myP = G.players[OL.myPlayerId];
  var action = { build: G.selBuild, research: G.selTech, policy: G.selPolicy };

  OL.roomRef.child('players/' + OL.myPlayerId + '/action').set(action);
  OL.roomRef.child('players/' + OL.myPlayerId + '/submitted').set(true);

  /* 제출 카운트 증가 → 호스트가 처리 */
  OL.roomRef.child('submittedCount').transaction(function(cur) {
    return (cur || 0) + 1;
  }).then(function(result) {
    var count = result.snapshot.val();
    /* 호스트만 전체 처리 */
    if (OL.isHost) {
      OL.roomRef.once('value').then(function(snap) {
        var data = snap.val();
        var total = Object.keys(data.players || {}).length;
        if (count >= total) hostProcessTurn(data);
      });
    }
  });

  G.selBuild = null; G.selTech = null; G.selPolicy = null;
  render();
}

/* ─── 호스트: 전체 턴 처리 ───────────────────────── */
function hostProcessTurn(data) {
  var players = Object.values(data.players || {}).sort(function(a,b){ return a.id - b.id; });
  var log = [];

  players.forEach(function(p) {
    var act  = p.action || {};
    var gain = totalGainObj(p);
    gain = applyPolicy(gain, act.policy);

    if (act.policy === 'military') p.military += 4;

    /* 자원 수령 */
    Object.keys(gain).forEach(function(r) {
      p.resources[r] = (p.resources[r] || 0) + gain[r];
    });

    /* 건설 */
    if (act.build) {
      var bDef = BUILDINGS.find(function(x){ return x.id === act.build; });
      if (bDef) {
        var canBuild = true;
        Object.keys(bDef.cost||{}).forEach(function(r){
          if ((p.resources[r]||0) < bDef.cost[r]) canBuild = false;
        });
        if (canBuild) {
          Object.keys(bDef.cost||{}).forEach(function(r){ p.resources[r] -= bDef.cost[r]; });
          if (!Array.isArray(p.buildings)) p.buildings = [];
          p.buildings.push(act.build);
          if (bDef.spec === 'mil5')  p.military += 5;
          if (bDef.spec === 'mil10') p.military += 10;
          if (bDef.spec === 'pop')   p.population += 1;
        }
      }
    }

    /* 연구 */
    if (act.research) {
      var tDef = TECHS.find(function(x){ return x.id === act.research; });
      if (!Array.isArray(p.techs)) p.techs = [];
      if (tDef && !p.techs.includes(act.research)) {
        var canRes = true;
        Object.keys(tDef.cost||{}).forEach(function(r){
          if ((p.resources[r]||0) < tDef.cost[r]) canRes = false;
        });
        if (canRes) {
          Object.keys(tDef.cost||{}).forEach(function(r){ p.resources[r] -= tDef.cost[r]; });
          p.techs.push(act.research);
          if (tDef.spec === 'mil8')  p.military += 8;
          if (tDef.spec === 'pop1')  p.population += 1;
          if (tDef.spec === 'dip15') p.dipBonus = (p.dipBonus||0) + 15;
        }
      }
    }

    /* 인구 성장 */
    if (!Array.isArray(p.buildings)) p.buildings = [];
    if (!Array.isArray(p.techs))     p.techs = [];
    var surplus = p.resources.food - p.population * 2;
    var growChance = 0.18;
    if (p.buildings.includes('granary')) growChance += 0.15;
    if (p.techs.includes('medicine'))    growChance += 0.15;
    if (surplus > 5)                     growChance += 0.2;
    if (Math.random() < growChance && p.population < 20) p.population += 1;

    /* 식량 소비 */
    p.resources.food = Math.max(0, p.resources.food - Math.max(0, p.population - 2));

    /* 랜덤 이벤트 */
    var evIdx = Math.floor(Math.random() * EVENTS.length);
    var ev    = EVENTS[evIdx];
    var applyEv = true;
    if (data.diff === 'easy' && ev.type === 'bad'  && Math.random() < 0.45) applyEv = false;
    if (data.diff === 'hard' && ev.type === 'good' && Math.random() < 0.30) applyEv = false;

    var fxStr = '';
    if (applyEv) fxStr = ev.fx(p);

    /* 자원 음수 방지 */
    Object.keys(p.resources).forEach(function(r){ p.resources[r] = Math.max(0, p.resources[r]); });

    /* 점수 재계산 */
    p.scores = calcScoreObj(p);
    p.submitted = false;
    p.action    = { build:null, research:null, policy:null };

    log.push({
      pid:     p.id,
      pname:   p.name,
      country: p.country,
      climate: p.climate,
      ev:      applyEv ? { id:ev.id, name:ev.name, emoji:ev.emoji, type:ev.type, desc:ev.desc } : null,
      fx:      fxStr,
      gain:    gain
    });
  });

  /* Firebase 업데이트 */
  var newPlayers = {};
  players.forEach(function(p){ newPlayers[p.id] = p; });

  var isLast = (data.turn >= data.maxTurns);

  var update = {
    players:        newPlayers,
    turnLog:        log,
    submittedCount: 0,
    phase:          'events'
  };
  if (isLast) {
    update.phase = 'results';
  }

  OL.roomRef.update(update);
}

/* ─── 이벤트 확인 후 다음 단계 ──────────────────── */
function olNextFromEvents() {
  if (!OL.isHost) {
    G.phase = 'ol-waiting';
    render();
    return;
  }
  OL.roomRef.once('value').then(function(snap) {
    var data = snap.val();
    var isLast = (data.turn >= data.maxTurns);
    OL.roomRef.update({ phase: isLast ? 'results' : 'summary' });
  });
}

function olNextFromSummary() {
  if (!OL.isHost) {
    G.phase = 'ol-waiting';
    render();
    return;
  }
  OL.roomRef.once('value').then(function(snap) {
    var data = snap.val();
    OL.roomRef.update({
      phase:          'playing',
      turn:           (data.turn || 1) + 1,
      submittedCount: 0
    });
  });
}

/* ─── 점수 계산 (객체 반환, G.players 비의존) ────── */
function calcScoreObj(p) {
  function bc(id) {
    if (!Array.isArray(p.buildings)) return 0;
    return p.buildings.filter(function(b){ return b === id; }).length;
  }
  var econ  = Math.floor(p.resources.gold/2) + bc('market')*8 + bc('mine')*5 + bc('harbor')*6 + bc('workshop')*2;
  var mil   = Math.floor(p.military * 2.5);
  var sci   = (Array.isArray(p.techs) ? p.techs.length : 0)*12 + Math.floor(p.resources.science/3);
  var cult  = Math.floor(p.resources.culture/2) + bc('temple')*8 + bc('theater')*14;
  var pop   = p.population * 6;
  var dip   = p.dipBonus || 0;
  return { econ:econ, mil:mil, sci:sci, cult:cult, pop:pop, dip:dip, total:econ+mil+sci+cult+pop+dip };
}

/* ─── totalGain (engine.js의 totalGain과 동일, 로컬 객체용) ── */
function totalGainObj(p) {
  var base = CLIMATES[p.climate].base;
  var g = { food:base.food, production:base.production, gold:base.gold, science:base.science, culture:base.culture };
  if (!Array.isArray(p.buildings)) p.buildings = [];
  if (!Array.isArray(p.techs))     p.techs = [];
  p.buildings.forEach(function(id) {
    var bDef = BUILDINGS.find(function(x){ return x.id === id; });
    if (bDef && bDef.perTurn) Object.keys(bDef.perTurn).forEach(function(r){ g[r] = (g[r]||0) + bDef.perTurn[r]; });
  });
  p.techs.forEach(function(id) {
    var tDef = TECHS.find(function(x){ return x.id === id; });
    if (tDef && tDef.perTurn) Object.keys(tDef.perTurn).forEach(function(r){ g[r] = (g[r]||0) + tDef.perTurn[r]; });
  });
  return g;
}

/* ─── 방 나가기 ──────────────────────────────────── */
function leaveRoom() {
  offAll();
  if (OL.isHost && OL.roomRef) {
    OL.roomRef.remove();
  } else if (OL.roomRef) {
    OL.roomRef.child('players/' + OL.myPlayerId).remove();
  }
  OL.roomCode = null; OL.myPlayerId = null; OL.isHost = false;
  OL.roomRef = null; OL.submitted = false;
  G.phase = 'menu';
  render();
}

/* ─── 온라인 화면: 모드 선택 ────────────────────── */
function renderOnlineMenu() {
  var ckeys = Object.keys(CLIMATES);
  var configured = typeof FIREBASE_CONFIGURED !== 'undefined' && FIREBASE_CONFIGURED;

  var html = '<div class="screen anim" style="background:var(--bg);">';
  html += '<div style="max-width:600px;width:100%;">';
  html += '<div class="topbar" style="border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">🌐 온라인 멀티플레이</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button>';
  html += '</div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;">';

  if (!configured) {
    html += '<div style="background:rgba(224,80,80,0.1);border:1px solid rgba(224,80,80,0.4);border-radius:8px;padding:16px;margin-bottom:18px;">';
    html += '<div style="font-weight:700;color:#f09090;margin-bottom:6px;">⚠️ Firebase 설정 필요</div>';
    html += '<div style="font-size:0.84em;line-height:1.7;color:var(--text2);">';
    html += '<code>js/firebase-config.js</code> 파일을 열어 Firebase 프로젝트 정보를 입력해 주세요.<br>';
    html += 'README.md의 Firebase 설정 안내를 참고하세요.';
    html += '</div></div>';
  }

  /* 탭 */
  var tabSel = G._olTab || 'create';
  html += '<div class="tabs" style="margin-bottom:16px;">';
  html += '<div class="tab' + (tabSel==='create'?' active':'') + '" onclick="G._olTab=\'create\';render()">🏠 방 만들기</div>';
  html += '<div class="tab' + (tabSel==='join'  ?' active':'') + '" onclick="G._olTab=\'join\';render()">🚪 방 참가하기</div>';
  html += '</div>';

  /* 기후 선택 옵션 공통 */
  var climateOpts = ckeys.map(function(k){
    return '<option value="' + k + '">' + CLIMATES[k].emoji + ' ' + CLIMATES[k].name + ' 기후</option>';
  }).join('');

  if (tabSel === 'create') {
    html += '<div style="display:grid;gap:12px;">';

    html += '<div><div class="section-title">내 이름</div>';
    html += '<input type="text" id="ol-name" placeholder="이름 입력" maxlength="12" style="width:100%;"></div>';

    html += '<div><div class="section-title">내 기후 선택</div>';
    html += '<select id="ol-climate" style="width:100%;">' + climateOpts + '</select></div>';

    html += '<div class="grid3">';
    html += '<div><div class="section-title">난이도</div>';
    html += '<select id="ol-diff"><option value="easy">쉬움</option><option value="normal" selected>보통</option><option value="hard">어려움</option></select></div>';

    html += '<div><div class="section-title">총 턴</div>';
    html += '<select id="ol-turns"><option value="15">15턴</option><option value="20" selected>20턴</option><option value="30">30턴</option></select></div>';

    html += '<div><div class="section-title">최대 인원</div>';
    html += '<select id="ol-maxp"><option value="2">2명</option><option value="3">3명</option><option value="4" selected>4명</option><option value="5">5명</option><option value="6">6명</option></select></div>';
    html += '</div>'; /* grid3 */

    html += '<button class="btn btn-primary btn-block" onclick="createRoom()"' + (!configured?' disabled style="opacity:0.4;"':'') + '>🏠 방 만들기</button>';
    html += '</div>';

  } else {
    html += '<div style="display:grid;gap:12px;">';

    html += '<div><div class="section-title">내 이름</div>';
    html += '<input type="text" id="ol-name-join" placeholder="이름 입력" maxlength="12" style="width:100%;"></div>';

    html += '<div><div class="section-title">내 기후 선택</div>';
    html += '<select id="ol-climate-join" style="width:100%;">' + climateOpts + '</select></div>';

    html += '<div><div class="section-title">방 코드 (6자리)</div>';
    html += '<input type="text" id="ol-code" placeholder="예: AB3K7Z" maxlength="6" style="width:100%;text-transform:uppercase;letter-spacing:3px;font-size:1.2em;text-align:center;"></div>';

    html += '<button class="btn btn-primary btn-block" onclick="joinRoom()"' + (!configured?' disabled style="opacity:0.4;"':'') + '>🚪 방 참가하기</button>';
    html += '</div>';
  }

  html += '<div style="margin-top:18px;padding:12px;background:rgba(0,0,0,0.25);border-radius:7px;font-size:0.78em;line-height:1.8;color:var(--text2);">';
  html += '💡 <strong style="color:var(--text);">온라인 플레이 방법</strong><br>';
  html += '① 한 명이 방을 만들고 <strong>방 코드</strong>를 친구에게 알려줍니다<br>';
  html += '② 친구들이 방 코드로 참가 후 준비 완료<br>';
  html += '③ 방장이 게임 시작 → 각자 자신의 기기에서 동시 진행!';
  html += '</div>';

  html += '</div></div></div>';
  return html;
}

/* ─── 온라인 화면: 로비 ──────────────────────────── */
function renderOnlineLobby() {
  var html = '<div class="screen anim" style="background:var(--bg);">';
  html += '<div style="max-width:560px;width:100%;">';

  html += '<div class="topbar" style="border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">🏠 대기실</span>';
  html += '<button class="btn btn-sm" onclick="leaveRoom()">나가기</button>';
  html += '</div>';

  html += '<div class="panel" style="border-radius:0 0 8px 8px;">';

  /* 방 코드 */
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<div style="font-size:0.75em;color:var(--text2);margin-bottom:6px;letter-spacing:2px;">방 코드</div>';
  html += '<div style="font-size:2.8em;font-weight:900;color:var(--gold);letter-spacing:8px;text-shadow:0 0 20px rgba(240,192,64,0.3);">' + (OL.roomCode || '------') + '</div>';
  html += '<div style="font-size:0.78em;color:var(--text2);margin-top:6px;">이 코드를 친구에게 알려주세요</div>';
  html += '</div>';

  /* 플레이어 목록 */
  html += '<div class="section-title">👥 참가자 목록</div>';
  var players = G.players || [];
  players.forEach(function(p) {
    var cl = CLIMATES[p.climate];
    var isMe = p.id === OL.myPlayerId;
    html += '<div class="panel-sm" style="display:flex;align-items:center;gap:10px;margin-bottom:7px;border-color:' + (isMe?cl.color:cl.color+'44') + ';">';
    html += '<span style="font-size:1.3em;">' + cl.emoji + '</span>';
    html += '<div style="flex:1;">';
    html += '<div style="font-weight:700;">' + p.name + (isMe ? ' <span style="color:var(--text2);font-size:0.8em;">(나)</span>' : '') + (p.id===0?' <span style="font-size:0.75em;color:var(--gold);">방장</span>':'') + '</div>';
    html += '<div style="font-size:0.78em;color:' + cl.color + ';">' + cl.emoji + ' ' + cl.name + ' 기후</div>';
    html += '</div>';
    html += '<span class="badge ' + (p.ready||p.id===0 ? 'badge-good' : 'badge-bad') + '">' + (p.id===0 ? '방장' : (p.ready?'준비 완료':'대기 중')) + '</span>';
    html += '</div>';
  });

  /* 버튼 */
  html += '<div style="margin-top:16px;display:grid;gap:8px;">';
  if (OL.isHost) {
    var allReady = players.length>=2 && players.filter(function(p){return p.id!==0&&!p.ready;}).length===0;
    html += '<button class="btn btn-primary btn-block" onclick="hostStartGame()"' + (!allReady?' disabled style="opacity:0.4;cursor:not-allowed;"':'') + '>';
    html += allReady ? '⚔️ 게임 시작!' : '⏳ 모든 플레이어 준비 대기 중...';
    html += '</button>';
  } else {
    var myReady = players.find(function(p){ return p.id === OL.myPlayerId; });
    var ready   = myReady && myReady.ready;
    html += '<button class="btn' + (ready?' btn-primary':'') + ' btn-block" onclick="toggleReady()">' + (ready ? '✅ 준비 완료 (취소)' : '✋ 준비 완료') + '</button>';
    html += '<div style="color:var(--text2);font-size:0.82em;text-align:center;">방장이 게임을 시작하기를 기다리는 중...</div>';
  }
  html += '</div>';
  html += '</div></div></div>';
  return html;
}

/* ─── 온라인 화면: 게임 (플레이어 턴) ───────────── */
function renderOnlineGame() {
  var myP  = G.players ? G.players[OL.myPlayerId] : null;
  if (!myP) {
    return '<div class="screen"><div style="color:var(--text2);">게임 데이터 로딩 중... ⏳</div></div>';
  }
  var cl   = CLIMATES[myP.climate];
  var gain = totalGainObj(myP);
  var gainWithPolicy = applyPolicy(Object.assign({}, gain), G.selPolicy);
  myP.scores = calcScoreObj(myP);

  var submitted = myP.submitted;
  var sorted = G.players.slice().sort(function(a,b){ return b.scores.total - a.scores.total; });

  var selBuildDef  = G.selBuild  ? BUILDINGS.find(function(x){ return x.id === G.selBuild;  }) : null;
  var selTechDef   = G.selTech   ? TECHS.find(function(x){ return x.id === G.selTech;   }) : null;
  var selPolicyDef = G.selPolicy ? POLICIES.find(function(x){ return x.id === G.selPolicy; }) : null;

  var html = '<div style="background:var(--bg);min-height:100vh;">';

  /* TOP BAR */
  html += '<div class="topbar">';
  html += '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<span style="font-size:1.4em;">' + myP.emoji + '</span>';
  html += '<div><div style="font-weight:700;">' + myP.name + ' <span style="color:' + cl.color + ';font-size:0.85em;">' + cl.emoji + ' ' + myP.country + '</span></div>';
  html += '<div style="font-size:0.73em;color:var(--text2);">⚔️' + myP.military + ' · 👥' + myP.population + ' · 🌐 방코드: ' + OL.roomCode + '</div></div></div>';
  html += '<div style="text-align:center;"><div class="turn-num">턴 ' + G.turn + ' / ' + G.maxTurns + '</div></div>';
  html += '<div style="text-align:right;"><div style="font-size:0.7em;color:var(--text2);">종합 국력</div><div class="turn-num">' + myP.scores.total + '</div></div>';
  html += '</div>';

  html += '<div class="game-grid">';

  /* 왼쪽: 자원 */
  html += '<div class="col">';
  html += '<div class="panel">';
  html += '<div class="section-title">📦 현재 보유 자원</div>';
  ['food','production','gold','science','culture'].forEach(function(k) {
    html += resPreviewRow(k, myP.resources[k], gainWithPolicy[k]);
  });
  html += '</div>';

  html += '<div class="panel" style="border-color:' + cl.color + '44;">';
  html += '<div class="section-title">' + cl.emoji + ' ' + cl.name + ' 기후</div>';
  html += '<div style="font-size:0.78em;color:var(--text2);">' + cl.desc + '</div>';
  html += '</div>';

  html += '<div class="panel">';
  html += '<div class="section-title">🏗️ 건물 (' + (Array.isArray(myP.buildings)?myP.buildings.length:0) + ')</div>';
  var bArr = Array.isArray(myP.buildings) ? myP.buildings : [];
  if (bArr.length===0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  } else {
    var shown={};
    bArr.forEach(function(id){
      if(!shown[id]){shown[id]=1;}else{shown[id]++;}
    });
    Object.keys(shown).forEach(function(id){
      var b=BUILDINGS.find(function(x){return x.id===id;});
      if(b) html+='<div style="font-size:0.82em;padding:2px 0;">'+b.emoji+' '+b.name+(shown[id]>1?' ×'+shown[id]:'')+' </div>';
    });
  }
  html += '</div>';

  html += '<div class="panel">';
  html += '<div class="section-title">🔬 기술 (' + (Array.isArray(myP.techs)?myP.techs.length:0) + ')</div>';
  var tArr = Array.isArray(myP.techs) ? myP.techs : [];
  if (tArr.length===0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  } else {
    tArr.forEach(function(id){
      var t=TECHS.find(function(x){return x.id===id;});
      if(t) html+='<div style="font-size:0.82em;padding:2px 0;">'+t.emoji+' '+t.name+'</div>';
    });
  }
  html += '</div>';
  html += '</div>'; /* col */

  /* 중앙: 행동 탭 */
  html += '<div class="col">';

  if (submitted) {
    /* 제출 후 대기 화면 */
    var submitCount = G.players.filter(function(p){ return p.submitted; }).length;
    html += '<div class="panel" style="text-align:center;padding:40px 20px;">';
    html += '<div style="font-size:3em;margin-bottom:16px;" class="pulse">⏳</div>';
    html += '<div style="font-size:1.2em;font-weight:700;color:var(--gold);margin-bottom:8px;">턴 제출 완료!</div>';
    html += '<div style="color:var(--text2);margin-bottom:18px;">다른 플레이어를 기다리는 중...</div>';
    html += '<div style="font-size:1.5em;font-weight:900;color:var(--gold);">' + submitCount + ' / ' + G.players.length + '</div>';
    html += '<div style="font-size:0.8em;color:var(--text2);margin-top:4px;">제출 완료</div></div>';
  } else {
    /* 행동 탭 */
    html += '<div class="panel" style="padding:0;overflow:hidden;">';
    html += '<div class="tabs" style="padding:0 12px;">';
    html += '<div class="tab' + (G.tab==='build'?' active':'') + '" onclick="selTab(\'build\')">🏗️ 건설</div>';
    html += '<div class="tab' + (G.tab==='research'?' active':'') + '" onclick="selTab(\'research\')">🔬 연구</div>';
    html += '<div class="tab' + (G.tab==='policy'?' active':'') + '" onclick="selTab(\'policy\')">📜 정책</div>';
    html += '<div class="tab' + (G.tab==='scores'?' active':'') + '" onclick="selTab(\'scores\')">📊 국력</div>';
    html += '</div>';
    html += '<div style="padding:12px;">';

    /* tabs 내용: myP를 넘겨서 렌더 */
    G.players[OL.myPlayerId] = myP;
    G.curPlayer = OL.myPlayerId;
    if (G.tab==='build')    html += renderBuildTab(myP);
    if (G.tab==='research') html += renderResearchTab(myP);
    if (G.tab==='policy')   html += renderPolicyTab();
    if (G.tab==='scores')   html += renderScoresTab(myP);
    html += '</div></div>';

    /* 결정 요약 + 제출 */
    html += '<div class="panel" style="background:rgba(240,192,64,0.04);border-color:rgba(240,192,64,0.28);">';
    html += '<div class="section-title">✅ 이번 턴 결정</div>';
    html += '<div class="grid3" style="gap:8px;margin-bottom:12px;">';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">건설</div><div style="font-weight:700;font-size:0.85em;color:' + (selBuildDef?'var(--gold)':'var(--text2)') + ';">' + (selBuildDef?selBuildDef.emoji+' '+selBuildDef.name:'선택 안 함') + '</div></div>';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">연구</div><div style="font-weight:700;font-size:0.85em;color:' + (selTechDef?'var(--gold)':'var(--text2)') + ';">' + (selTechDef?selTechDef.emoji+' '+selTechDef.name:'선택 안 함') + '</div></div>';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">정책</div><div style="font-weight:700;font-size:0.85em;color:' + (selPolicyDef?'var(--gold)':'var(--text2)') + ';">' + (selPolicyDef?selPolicyDef.emoji+' '+selPolicyDef.name:'선택 안 함') + '</div></div>';
    html += '</div>';
    html += '<button class="btn btn-primary btn-block" onclick="olSubmitTurn()">턴 제출 →</button>';
    html += '</div>';
  }

  html += '</div>'; /* col */

  /* 오른쪽: 순위 */
  html += '<div class="col">';
  html += '<div class="panel">';
  html += '<div class="section-title">🏆 현재 순위</div>';
  sorted.forEach(function(sp, idx) {
    var cl2 = CLIMATES[sp.climate];
    var isMe = sp.id === OL.myPlayerId;
    html += '<div style="display:flex;align-items:center;gap:7px;padding:5px' + (isMe?';background:rgba(240,192,64,0.06);border-radius:5px;padding:5px 7px;':'') + ';border-bottom:1px solid rgba(255,255,255,0.05);">';
    html += '<span style="font-weight:900;width:22px;text-align:center;color:' + (idx===0?'#f0c040':idx===1?'#c0c0c0':idx===2?'#c08040':'var(--text2)') + ';">' + (idx+1) + '</span>';
    html += '<span>' + sp.emoji + '</span>';
    html += '<div style="flex:1;min-width:0;"><div style="font-size:0.82em;font-weight:' + (isMe?700:400) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sp.name + (isMe?' (나)':'') + '</div>';
    html += '<div style="font-size:0.72em;color:' + cl2.color + ';">' + cl2.emoji + ' ' + sp.country + '</div></div>';
    html += '<span style="font-weight:700;color:var(--gold);font-size:0.9em;">' + sp.scores.total + '</span>';
    html += (sp.submitted ? '<span class="badge badge-good" style="font-size:0.65em;">제출</span>' : '<span class="badge badge-bad" style="font-size:0.65em;">대기</span>');
    html += '</div>';
  });
  html += '</div>';
  html += '</div>'; /* col */

  html += '</div>'; /* game-grid */
  html += '</div>';
  return html;
}

/* ─── 온라인: 이벤트 화면 ───────────────────────── */
function renderOnlineEvents() {
  var html = '<div class="screen anim" style="background:var(--bg);">';
  html += '<div style="max-width:800px;width:100%;">';
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<div style="font-size:2em;">📰</div>';
  html += '<h2 style="color:var(--gold);">턴 ' + G.turn + ' 이벤트 발표</h2>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:22px;">';
  var log = Array.isArray(G.turnLog) ? G.turnLog : [];
  log.forEach(function(entry) {
    var p  = G.players ? G.players.find(function(x){ return x.id === entry.pid; }) : null;
    if (!p) return;
    var cl = CLIMATES[entry.climate];
    var ev = entry.ev;
    html += '<div class="ev-card ' + (ev ? ev.type : 'neutral') + '" style="border-color:' + p.color + '44;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    html += '<span style="font-size:1.1em;">' + p.emoji + '</span>';
    html += '<div style="text-align:left;"><div style="font-weight:700;font-size:0.88em;">' + entry.pname + (p.id===OL.myPlayerId?' (나)':'') + '</div>';
    html += '<div style="font-size:0.73em;color:' + cl.color + ';">' + cl.emoji + ' ' + entry.country + '</div></div></div>';
    if (ev) {
      html += '<div style="font-size:2em;margin-bottom:5px;">' + ev.emoji + '</div>';
      html += '<div style="font-weight:700;margin-bottom:3px;">' + ev.name + '</div>';
      html += '<div style="font-size:0.8em;color:var(--text2);margin-bottom:7px;">' + ev.desc + '</div>';
      html += '<span class="badge ' + (ev.type==='good'?'badge-good':'badge-bad') + '">' + entry.fx + '</span>';
    } else {
      html += '<div style="color:var(--text2);font-size:0.85em;padding:8px 0;">평온한 턴 😌</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  html += '<div style="text-align:center;">';
  if (OL.isHost) {
    html += '<button class="btn btn-primary" onclick="olNextFromEvents()">📊 결과 보기 →</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="olNextFromEvents()">확인 완료</button>';
    html += '<div style="color:var(--text2);font-size:0.82em;margin-top:10px;">방장이 다음 단계로 넘어가기를 기다리는 중...</div>';
  }
  html += '</div>';
  html += '</div></div>';
  return html;
}

/* ─── 온라인: 요약 화면 ─────────────────────────── */
function renderOnlineSummary() {
  var sorted = (G.players||[]).slice().sort(function(a,b){ return b.scores.total - a.scores.total; });
  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:760px;width:100%;padding-bottom:30px;">';
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<h2 style="color:var(--gold);">턴 ' + G.turn + ' 종료 · 국력 순위</h2>';
  html += '<p style="color:var(--text2);font-size:0.84em;">남은 턴: ' + (G.maxTurns - G.turn) + '턴</p>';
  html += '</div>';

  sorted.forEach(function(p, idx) {
    var isMe = p.id === OL.myPlayerId;
    var cl   = CLIMATES[p.climate];
    var medals = ['🥇','🥈','🥉'];
    html += '<div class="rank-row ' + (idx===0?'rank-gold':idx===1?'rank-silver':idx===2?'rank-bronze':'rank-other') + '" style="border-left:4px solid ' + p.color + ';">';
    html += '<div style="font-weight:900;font-size:1.3em;width:30px;text-align:center;">' + (medals[idx]||(idx+1)+'위') + '</div>';
    html += '<span style="font-size:1.4em;">' + p.emoji + '</span>';
    html += '<div style="flex:1;min-width:0;"><div style="font-weight:700;">' + p.name + (isMe?' <span style="color:var(--text2);font-size:0.8em;">(나)</span>':'') + '</div>';
    html += '<div style="font-size:0.78em;color:' + cl.color + ';">' + cl.emoji + ' ' + p.country + '</div></div>';
    html += '<div style="text-align:right;"><div style="font-size:1.35em;font-weight:900;color:var(--gold);">' + p.scores.total + '</div>';
    html += '<div style="font-size:0.7em;color:var(--text2);">💰'+p.scores.econ+' ⚔️'+p.scores.mil+' 🔬'+p.scores.sci+' 🎨'+p.scores.cult+'</div></div>';
    html += '</div>';
  });

  html += '<div style="text-align:center;margin-top:20px;">';
  if (OL.isHost) {
    html += '<button class="btn btn-primary" onclick="olNextFromSummary()">다음 턴 (' + (G.turn+1) + '/' + G.maxTurns + ') →</button>';
  } else {
    html += '<div style="color:var(--text2);font-size:0.85em;" class="pulse">⏳ 방장이 다음 턴을 시작하기를 기다리는 중...</div>';
  }
  html += '</div>';
  html += '</div></div>';
  return html;
}

/* ─── 온라인: 최종 결과 ─────────────────────────── */
function renderOnlineResults() {
  var sorted = (G.players||[]).slice().sort(function(a,b){ return b.scores.total - a.scores.total; });
  var winner = sorted[0];
  if (!winner) return '<div class="screen"><div>로딩 중...</div></div>';
  var winnerCl = CLIMATES[winner.climate];
  var isIWinner = winner.id === OL.myPlayerId;

  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:700px;width:100%;padding-bottom:30px;">';

  html += '<div class="winner-banner" style="margin-bottom:24px;">';
  html += '<div style="font-size:3em;margin-bottom:10px;">🏆</div>';
  if (isIWinner) {
    html += '<div style="font-size:1.2em;font-weight:900;color:var(--gold);margin-bottom:6px;" class="glow">🎉 축하합니다! 당신이 이겼습니다! 🎉</div>';
  }
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);" class="glow">' + winner.emoji + ' ' + winner.name + '</div>';
  html += '<div style="color:' + winnerCl.color + ';margin-bottom:6px;">' + winnerCl.emoji + ' ' + winner.country + '</div>';
  html += '<div style="font-size:2.2em;font-weight:900;color:var(--gold);">' + winner.scores.total + ' 점</div>';
  html += '</div>';

  sorted.forEach(function(p, idx) {
    var isMe = p.id === OL.myPlayerId;
    html += rankRow(p, idx, true);
    if (isMe) {} /* rankRow 내부에서 처리 */
  });

  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:24px;">';
  html += '<button class="btn btn-primary" onclick="leaveRoom()">🏠 메인으로</button>';
  html += '</div>';
  html += '</div></div>';
  return html;
}
