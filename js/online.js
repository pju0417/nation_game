/* =========================================================
   나라 경영 시뮬레이션 · online.js
   Firebase Realtime Database 온라인 멀티플레이 로직
   made by 박선생
========================================================= */

/* ─── Firebase 초기화 ────────────────────────────── */
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
  } catch (e) {
    console.error('Firebase 초기화 실패:', e);
    return false;
  }
}

/* ─── 온라인 전역 상태 ───────────────────────────── */
var OL = {
  roomCode:   null,
  myPlayerId: null,
  isHost:     false,
  playerName: '',
  climateKey: 'temperate',
  roomRef:    null,
  listeners:  [],
  submitted:  false,
  _processing: false
};

/* ─── 탭 전환 헬퍼 ───────────────────────────────── */
function tabBuild()    { G.tab = 'build';    render(); }
function tabResearch() { G.tab = 'research'; render(); }
function tabPolicy()   { G.tab = 'policy';   render(); }
function tabScores()   { G.tab = 'scores';   render(); }
function olTabCreate() { G._olTab = 'create'; render(); }
function olTabJoin()   { G._olTab = 'join';   render(); }

/* ─── 유틸 ───────────────────────────────────────── */
function genRoomCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function offAll() {
  OL.listeners.forEach(function (r) { r.off(); });
  OL.listeners = [];
}

function dbRef(code) { return db.ref('rooms/' + code); }

/* ─── 방 만들기 ──────────────────────────────────── */
function createRoom() {
  if (!initFirebase()) { alert('Firebase 설정을 먼저 완료해 주세요!'); return; }

  var name    = (document.getElementById('ol-name')    || {}).value || '';
  var climate = (document.getElementById('ol-climate') || {}).value || 'temperate';
  var diff    = (document.getElementById('ol-diff')    || {}).value || 'normal';
  var turns   = parseInt((document.getElementById('ol-turns') || {}).value) || 20;
  var maxp    = parseInt((document.getElementById('ol-maxp')  || {}).value) || 4;

  name = name.trim();
  if (!name) { alert('이름을 입력해 주세요.'); return; }

  OL.playerName = name;
  OL.climateKey = climate;
  OL.isHost     = true;
  OL.myPlayerId = 0;
  OL.roomCode   = genRoomCode();
  OL.roomRef    = dbRef(OL.roomCode);

  var roomData = {
    host: 0, diff: diff, maxTurns: turns, turn: 1,
    phase: 'lobby', maxPlayers: maxp, submittedCount: 0,
    players: { 0: { id: 0, name: name, climate: climate, ready: false } }
  };

  OL.roomRef.set(roomData)
    .then(function () { G.phase = 'ol-lobby'; render(); listenLobby(); })
    .catch(function (e) { alert('방 생성 실패: ' + e.message); });
}

/* ─── 방 참가 ────────────────────────────────────── */
function joinRoom() {
  if (!initFirebase()) { alert('Firebase 설정을 먼저 완료해 주세요!'); return; }

  var name    = ((document.getElementById('ol-name-join')    || {}).value || '').trim();
  var climate = (document.getElementById('ol-climate-join')  || {}).value || 'temperate';
  var code    = ((document.getElementById('ol-code')         || {}).value || '').toUpperCase().trim();

  if (!name) { alert('이름을 입력해 주세요.'); return; }
  if (!code) { alert('방 코드를 입력해 주세요.'); return; }

  OL.playerName = name;
  OL.climateKey = climate;
  OL.isHost     = false;
  OL.roomCode   = code;
  OL.roomRef    = dbRef(code);

  OL.roomRef.once('value').then(function (snap) {
    var data = snap.val();
    if (!data) { alert('방을 찾을 수 없습니다.'); return; }
    if (data.phase !== 'lobby') { alert('이미 게임이 시작된 방입니다.'); return; }

    var players = data.players || {};
    var count   = Object.keys(players).length;
    if (count >= data.maxPlayers) { alert('방이 꽉 찼습니다.'); return; }

    var climateUsed = Object.values(players).some(function (p) { return p.climate === climate; });
    if (climateUsed) { alert('이미 선택된 기후입니다. 다른 기후를 선택해 주세요.'); return; }

    OL.myPlayerId = count;
    OL.roomRef.child('players/' + count)
      .set({ id: count, name: name, climate: climate, ready: false })
      .then(function () { G.phase = 'ol-lobby'; render(); listenLobby(); });
  }).catch(function (e) { alert('방 참가 실패: ' + e.message); });
}

/* ─── 준비 토글 ──────────────────────────────────── */
function toggleReady() {
  OL.roomRef.child('players/' + OL.myPlayerId + '/ready')
    .transaction(function (cur) { return !cur; });
}

/* ─── 게임 시작 (호스트) ─────────────────────────── */
function hostStartGame() {
  OL.roomRef.once('value').then(function (snap) {
    var data    = snap.val();
    var players = data.players || {};
    var list    = Object.values(players);

    if (list.length < 2) { alert('최소 2명이 필요합니다.'); return; }
    var notReady = list.filter(function (p) { return p.id !== 0 && !p.ready; });
    if (notReady.length > 0) { alert('모든 플레이어가 준비 완료해야 합니다.'); return; }

    var startBonus = data.diff === 'easy' ? 6 : data.diff === 'hard' ? -3 : 0;
    var colors     = playerColors();
    var emojis     = playerEmojis();

    var initPlayers = {};
    list.forEach(function (cfg) {
      var base    = CLIMATES[cfg.climate].base;
      var names   = COUNTRY_NAMES[cfg.climate];
      var country = names[Math.floor(Math.random() * names.length)];
      initPlayers[cfg.id] = {
        id: cfg.id, name: cfg.name, country: country, climate: cfg.climate,
        color: colors[cfg.id % colors.length], emoji: emojis[cfg.id % emojis.length],
        resources: {
          food:       base.food       * 2 + 6 + startBonus,
          production: base.production * 2 + 5 + startBonus,
          gold:       base.gold       * 2 + 5 + startBonus,
          science:    base.science    * 2     + startBonus,
          culture:    base.culture    * 2     + startBonus
        },
        population: 3, buildings: [], techs: [], military: 5,
        dipBonus: 0, allies: [], tradeLog: [],
        action: { build: null, research: null, policy: null, diplo: null },
        scores: { econ: 0, mil: 0, sci: 0, cult: 0, pop: 0, dip: 0, total: 0 },
        submitted: false
      };
      initPlayers[cfg.id].scores = calcScoreObj(initPlayers[cfg.id]);
    });

    OL.roomRef.update({
      phase: 'playing', turn: 1, players: initPlayers, submittedCount: 0, turnLog: null
    }).then(function () { G.phase = 'ol-game'; render(); listenGame(); });
  });
}

/* ─── 로비 리스너 ────────────────────────────────── */
function listenLobby() {
  offAll();
  OL.listeners.push(OL.roomRef);
  OL.roomRef.on('value', function (snap) {
    var data = snap.val();
    if (!data) return;
    var list = Object.values(data.players || {});
    list.sort(function (a, b) { return a.id - b.id; });
    G.players = list;
    if (data.phase === 'playing' && G.phase === 'ol-lobby') {
      G.phase = 'ol-game'; render(); listenGame(); return;
    }
    render();
  });
}

/* ─── 게임 리스너 ────────────────────────────────── */
function listenGame() {
  offAll();
  OL.listeners.push(OL.roomRef);
  OL._processing = false;

  OL.roomRef.on('value', function (snap) {
    var data = snap.val();
    if (!data) return;

    G.diff     = data.diff;
    G.maxTurns = data.maxTurns;
    G.turn     = data.turn || 1;

    var list = Object.values(data.players || {});
    list.sort(function (a, b) { return a.id - b.id; });
    G.players = list;

    /* 호스트가 모든 제출 완료를 감지해서 턴 처리 */
    if (OL.isHost && data.phase === 'playing' && !OL._processing) {
      var allSub = list.length > 0 && list.every(function (p) { return p.submitted === true; });
      if (allSub) {
        OL._processing = true;
        hostProcessTurn(data);
        return;
      }
    }

    if (data.phase === 'events' && G.phase !== 'ol-events') {
      G.turnLog    = data.turnLog ? Object.values(data.turnLog) : [];
      OL.submitted = false; OL._processing = false;
      G.phase = 'ol-events'; render(); return;
    }
    if (data.phase === 'summary' && G.phase !== 'ol-summary') { G.phase = 'ol-summary'; render(); return; }
    if (data.phase === 'results' && G.phase !== 'ol-results') { G.phase = 'ol-results'; render(); return; }
    if (data.phase === 'playing') render();
  });
}

/* ─── 턴 제출 (온라인) ───────────────────────────── */
function olSubmitTurn() {
  if (OL.submitted) return;
  OL.submitted = true;
  var action = { build: G.selBuild, research: G.selTech, policy: G.selPolicy };
  OL.roomRef.child('players/' + OL.myPlayerId).update({ action: action, submitted: true });
  G.selBuild = null; G.selTech = null; G.selPolicy = null;
  render();
}

/* ─── 호스트: 턴 처리 ────────────────────────────── */
function hostProcessTurn(data) {
  var players = Object.values(data.players || {});
  players.sort(function (a, b) { return a.id - b.id; });
  var log = [];

  players.forEach(function (p) {
    var act  = p.action || {};
    var gain = totalGainObj(p);
    gain = applyPolicy(gain, act.policy);

    if (act.policy === 'military')     p.military += 4;
    if (act.policy === 'diplomacy_pol') p.dipBonus = (p.dipBonus || 0) + 8;

    Object.keys(gain).forEach(function (r) { p.resources[r] = (p.resources[r] || 0) + gain[r]; });

    /* 건설 (고유 건물 포함) */
    if (act.build) {
      var allBlds = BUILDINGS.concat(typeof UNIQUE_BUILDINGS !== 'undefined' ? UNIQUE_BUILDINGS : []);
      var bDef = allBlds.find(function (x) { return x.id === act.build; });
      if (bDef) {
        var climateOk = !bDef.climate || bDef.climate === p.climate;
        var cnt = (p.buildings || []).filter(function(b){ return b===act.build; }).length;
        var ok = climateOk && cnt < (bDef.max || 1);
        Object.keys(bDef.cost || {}).forEach(function (r) { if ((p.resources[r] || 0) < bDef.cost[r]) ok = false; });
        if (ok) {
          Object.keys(bDef.cost || {}).forEach(function (r) { p.resources[r] -= bDef.cost[r]; });
          if (!Array.isArray(p.buildings)) p.buildings = [];
          p.buildings.push(act.build);
          if (bDef.spec === 'mil5')  p.military   += 5;
          if (bDef.spec === 'mil12') p.military   += 12;
          if (bDef.spec === 'mil3')  p.military   += 3;
          if (bDef.spec === 'pop1')  p.population += 1;
          if (bDef.spec === 'dip5')  p.dipBonus    = (p.dipBonus || 0) + 5;
        }
      }
    }

    /* 연구 (전문 분야 25% 할인) */
    if (act.research) {
      var tDef = TECHS.find(function (x) { return x.id === act.research; });
      if (!Array.isArray(p.techs)) p.techs = [];
      if (tDef && !p.techs.includes(act.research)) {
        var reqOk = !tDef.req || p.techs.indexOf(tDef.req) !== -1;
        if (reqOk) {
          var cl2 = CLIMATES[p.climate];
          var isSpec = cl2.specialty && tDef.branch === cl2.specialty;
          var techCost = {};
          Object.keys(tDef.cost || {}).forEach(function (r) {
            techCost[r] = isSpec ? Math.floor(tDef.cost[r] * 0.75) : tDef.cost[r];
          });
          var okT = true;
          Object.keys(techCost).forEach(function (r) { if ((p.resources[r] || 0) < techCost[r]) okT = false; });
          if (okT) {
            Object.keys(techCost).forEach(function (r) { p.resources[r] -= techCost[r]; });
            p.techs.push(act.research);
            if (tDef.spec === 'mil6')  p.military   += 6;
            if (tDef.spec === 'mil10') p.military   += 10;
            if (tDef.spec === 'mil16') p.military   += 16;
            if (tDef.spec === 'pop1')  p.population += 1;
            if (tDef.spec === 'dip15') p.dipBonus    = (p.dipBonus || 0) + 15;
            if (tDef.spec === 'dip25') p.dipBonus    = (p.dipBonus || 0) + 25;
            if (tDef.spec === 'dip40') p.dipBonus    = (p.dipBonus || 0) + 40;
          }
        }
      }
    }

    /* 인구 성장 */
    if (!Array.isArray(p.buildings)) p.buildings = [];
    if (!Array.isArray(p.techs))     p.techs     = [];
    var surplus = p.resources.food - p.population * 2;
    var grow    = 0.18;
    if (p.buildings.indexOf('aqueduct')    !== -1) grow += 0.15;
    if (p.techs.indexOf('crop_rotation')   !== -1) grow += 0.15;
    if (surplus > 5) grow += 0.2;
    if (Math.random() < grow && p.population < 20) p.population += 1;

    p.resources.food = Math.max(0, p.resources.food - Math.max(0, p.population - 2));

    /* 이벤트 */
    var ev      = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    var applyEv = true;
    if (data.diff === 'easy' && ev.type === 'bad'  && Math.random() < 0.45) applyEv = false;
    if (data.diff === 'hard' && ev.type === 'good' && Math.random() < 0.30) applyEv = false;
    var fxStr = applyEv ? ev.fx(p) : '';

    Object.keys(p.resources).forEach(function (r) { p.resources[r] = Math.max(0, p.resources[r]); });
    p.scores    = calcScoreObj(p);
    p.submitted = false;
    p.action    = { build: null, research: null, policy: null, diplo: null };

    log.push({
      pid: p.id, pname: p.name, country: p.country, climate: p.climate,
      ev: applyEv ? { id: ev.id, name: ev.name, emoji: ev.emoji, type: ev.type, desc: ev.desc } : null,
      fx: fxStr, gain: gain
    });
  });

  var newPlayers = {};
  players.forEach(function (p) { newPlayers[p.id] = p; });
  var isLast = data.turn >= data.maxTurns;
  OL.roomRef.update({ players: newPlayers, turnLog: log, submittedCount: 0, phase: isLast ? 'results' : 'events' });
}

/* ─── 점수 계산 (독립형) ─────────────────────────── */
function calcScoreObj(p) {
  function bc(id) {
    if (!Array.isArray(p.buildings)) return 0;
    return p.buildings.filter(function (b) { return b === id; }).length;
  }
  var econ  = Math.floor(p.resources.gold / 2) + bc('market')*8 + bc('harbor')*10 + bc('foundry')*4 + bc('workshop')*2;
  var mil   = Math.floor(p.military * 2.5);
  var sci   = (Array.isArray(p.techs) ? p.techs.length : 0) * 10 + Math.floor(p.resources.science / 3);
  var cult  = Math.floor(p.resources.culture / 2) + bc('temple')*8 + bc('theater')*15;
  var pop   = p.population * 6;
  var dip   = (p.dipBonus || 0) + ((p.allies || []).length * 5);
  var total = econ + mil + sci + cult + pop + dip;
  return { econ: econ, mil: mil, sci: sci, cult: cult, pop: pop, dip: dip, total: total };
}

/* ─── totalGain (독립형) ─────────────────────────── */
function totalGainObj(p) {
  var base = CLIMATES[p.climate].base;
  var g = { food: base.food, production: base.production, gold: base.gold, science: base.science, culture: base.culture };
  if (!Array.isArray(p.buildings)) p.buildings = [];
  if (!Array.isArray(p.techs))     p.techs     = [];
  p.buildings.forEach(function (id) {
    var allBlds = BUILDINGS.concat(typeof UNIQUE_BUILDINGS !== 'undefined' ? UNIQUE_BUILDINGS : []);
    var b = allBlds.find(function (x) { return x.id === id; });
    if (b && b.perTurn) Object.keys(b.perTurn).forEach(function (r) { g[r] = (g[r] || 0) + b.perTurn[r]; });
  });
  p.techs.forEach(function (id) {
    var t = TECHS.find(function (x) { return x.id === id; });
    if (t && t.perTurn) Object.keys(t.perTurn).forEach(function (r) { g[r] = (g[r] || 0) + t.perTurn[r]; });
  });
  return g;
}

/* ─── 이벤트 → 다음 ──────────────────────────────── */
function olNextFromEvents() {
  if (!OL.isHost) { G.phase = 'ol-waiting'; render(); return; }
  OL.roomRef.once('value').then(function (snap) {
    var data   = snap.val();
    var isLast = data.turn >= data.maxTurns;
    OL.roomRef.update({ phase: isLast ? 'results' : 'summary' });
  });
}

/* ─── 요약 → 다음 턴 ────────────────────────────── */
function olNextFromSummary() {
  if (!OL.isHost) { G.phase = 'ol-waiting'; render(); return; }
  OL.roomRef.once('value').then(function (snap) {
    var data = snap.val();
    OL.roomRef.update({ phase: 'playing', turn: (data.turn || 1) + 1, submittedCount: 0 });
  });
}

/* ─── 방 나가기 ──────────────────────────────────── */
function leaveRoom() {
  offAll();
  if (OL.isHost && OL.roomRef)  OL.roomRef.remove();
  else if (OL.roomRef)          OL.roomRef.child('players/' + OL.myPlayerId).remove();
  OL.roomCode = null; OL.myPlayerId = null; OL.isHost = false;
  OL.roomRef  = null; OL.submitted  = false;
  G.phase = 'menu'; render();
}

/* ==========================================================
   온라인 화면 렌더링
========================================================== */
function renderOnlineMenu() {
  var ckeys      = Object.keys(CLIMATES);
  var configured = typeof FIREBASE_CONFIGURED !== 'undefined' && FIREBASE_CONFIGURED;
  var tabSel     = G._olTab || 'create';
  var dis        = !configured ? ' disabled style="opacity:0.4;"' : '';
  var climateOpts = ckeys.map(function (k) {
    return '<option value="' + k + '">' + CLIMATES[k].emoji + ' ' + CLIMATES[k].name + ' 기후</option>';
  }).join('');

  var html = '<div class="screen anim" style="background:var(--bg);"><div style="max-width:600px;width:100%;">';
  html += '<div class="topbar" style="border-radius:8px 8px 0 0;"><span style="font-weight:700;color:var(--gold);">🌐 온라인 멀티플레이</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button></div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;">';

  if (!configured) {
    html += '<div style="background:rgba(224,80,80,0.1);border:1px solid rgba(224,80,80,0.4);border-radius:8px;padding:14px;margin-bottom:16px;">';
    html += '<div style="font-weight:700;color:#f09090;margin-bottom:4px;">⚠️ Firebase 설정 필요</div>';
    html += '<div style="font-size:0.84em;color:var(--text2);">js/firebase-config.js 파일에 Firebase 정보를 입력해 주세요.</div></div>';
  }

  html += '<div class="tabs" style="margin-bottom:16px;">';
  html += '<div class="tab' + (tabSel === 'create' ? ' active' : '') + '" onclick="olTabCreate()">🏠 방 만들기</div>';
  html += '<div class="tab' + (tabSel === 'join'   ? ' active' : '') + '" onclick="olTabJoin()">🚪 방 참가하기</div>';
  html += '</div>';

  if (tabSel === 'create') {
    html += '<div style="display:grid;gap:12px;">';
    html += '<div><div class="section-title">내 이름</div><input type="text" id="ol-name" placeholder="이름 입력" maxlength="12" style="width:100%;"></div>';
    html += '<div><div class="section-title">내 기후</div><select id="ol-climate" style="width:100%;">' + climateOpts + '</select></div>';
    html += '<div class="grid3"><div><div class="section-title">난이도</div><select id="ol-diff"><option value="easy">쉬움</option><option value="normal" selected>보통</option><option value="hard">어려움</option></select></div>';
    html += '<div><div class="section-title">총 턴</div><select id="ol-turns"><option value="15">15턴</option><option value="20" selected>20턴</option><option value="30">30턴</option></select></div>';
    html += '<div><div class="section-title">최대 인원</div><select id="ol-maxp"><option value="2">2명</option><option value="3">3명</option><option value="4" selected>4명</option><option value="5">5명</option><option value="6">6명</option></select></div></div>';
    html += '<button class="btn btn-primary btn-block" onclick="createRoom()"' + dis + '>🏠 방 만들기</button></div>';
  } else {
    html += '<div style="display:grid;gap:12px;">';
    html += '<div><div class="section-title">내 이름</div><input type="text" id="ol-name-join" placeholder="이름 입력" maxlength="12" style="width:100%;"></div>';
    html += '<div><div class="section-title">내 기후</div><select id="ol-climate-join" style="width:100%;">' + climateOpts + '</select></div>';
    html += '<div><div class="section-title">방 코드</div><input type="text" id="ol-code" placeholder="예: AB3K7Z" maxlength="6" style="width:100%;text-transform:uppercase;letter-spacing:3px;font-size:1.2em;text-align:center;"></div>';
    html += '<button class="btn btn-primary btn-block" onclick="joinRoom()"' + dis + '>🚪 방 참가하기</button></div>';
  }

  html += '<div style="margin-top:16px;padding:12px;background:rgba(0,0,0,0.25);border-radius:7px;font-size:0.78em;line-height:1.8;color:var(--text2);">';
  html += '💡 ① 한 명이 방을 만들고 방 코드를 친구에게 알려줍니다<br>';
  html += '② 친구들이 방 코드로 참가 후 준비 완료<br>';
  html += '③ 방장이 게임 시작 → 각자 자신의 기기에서 동시 진행!';
  html += '</div></div></div></div>';
  return html;
}

function renderOnlineLobby() {
  var players = G.players || [];
  var html = '<div class="screen anim" style="background:var(--bg);"><div style="max-width:560px;width:100%;">';
  html += '<div class="topbar" style="border-radius:8px 8px 0 0;"><span style="font-weight:700;color:var(--gold);">🏠 대기실</span>';
  html += '<button class="btn btn-sm" onclick="leaveRoom()">나가기</button></div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;">';
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<div style="font-size:0.75em;color:var(--text2);margin-bottom:6px;letter-spacing:2px;">방 코드</div>';
  html += '<div style="font-size:2.8em;font-weight:900;color:var(--gold);letter-spacing:8px;">' + (OL.roomCode || '------') + '</div>';
  html += '<div style="font-size:0.78em;color:var(--text2);margin-top:6px;">이 코드를 친구에게 알려주세요</div></div>';

  html += '<div class="section-title">👥 참가자</div>';
  players.forEach(function (p) {
    var cl = CLIMATES[p.climate];
    var isMe = p.id === OL.myPlayerId;
    html += '<div class="panel-sm" style="display:flex;align-items:center;gap:10px;margin-bottom:7px;border-color:' + (isMe ? cl.color : cl.color + '44') + ';">';
    html += '<span style="font-size:1.3em;">' + cl.emoji + '</span>';
    html += '<div style="flex:1;"><div style="font-weight:700;">' + p.name + (isMe ? ' <span style="color:var(--text2);font-size:0.8em;">(나)</span>' : '') + (p.id === 0 ? ' <span style="font-size:0.75em;color:var(--gold);">방장</span>' : '') + '</div>';
    html += '<div style="font-size:0.78em;color:' + cl.color + ';">' + cl.name + ' 기후</div></div>';
    html += '<span class="badge ' + ((p.id === 0 || p.ready) ? 'badge-good' : 'badge-bad') + '">' + (p.id === 0 ? '방장' : (p.ready ? '준비 완료' : '대기 중')) + '</span>';
    html += '</div>';
  });

  html += '<div style="margin-top:14px;display:grid;gap:8px;">';
  if (OL.isHost) {
    var allReady = players.length >= 2 && players.filter(function (p) { return p.id !== 0 && !p.ready; }).length === 0;
    html += allReady
      ? '<button class="btn btn-primary btn-block" onclick="hostStartGame()">⚔️ 게임 시작!</button>'
      : '<button class="btn btn-primary btn-block" disabled style="opacity:0.4;">⏳ 모든 플레이어 준비 대기 중...</button>';
  } else {
    var myP    = players.find(function (p) { return p.id === OL.myPlayerId; });
    var amReady = myP && myP.ready;
    html += amReady
      ? '<button class="btn btn-primary btn-block" onclick="toggleReady()">✅ 준비 완료 (취소)</button>'
      : '<button class="btn btn-block" onclick="toggleReady()">✋ 준비 완료</button>';
    html += '<div style="color:var(--text2);font-size:0.82em;text-align:center;">방장이 게임을 시작하기를 기다리는 중...</div>';
  }
  html += '</div></div></div></div>';
  return html;
}

function renderOnlineGame() {
  var myP = G.players ? G.players[OL.myPlayerId] : null;
  if (!myP) return '<div class="screen"><div style="color:var(--text2);">로딩 중... ⏳</div></div>';

  var cl             = CLIMATES[myP.climate];
  var gain           = totalGainObj(myP);
  var gainWithPolicy = applyPolicy(Object.assign({}, gain), G.selPolicy);
  myP.scores         = calcScoreObj(myP);

  var submitted    = myP.submitted;
  var sorted       = G.players.slice().sort(function (a, b) { return b.scores.total - a.scores.total; });
  var selBuildDef  = G.selBuild  ? [].concat(BUILDINGS, typeof UNIQUE_BUILDINGS !== 'undefined' ? UNIQUE_BUILDINGS : []).find(function (x) { return x.id === G.selBuild;  }) : null;
  var selTechDef   = G.selTech   ? TECHS.find(function (x)     { return x.id === G.selTech;   }) : null;
  var selPolicyDef = G.selPolicy ? POLICIES.find(function (x)  { return x.id === G.selPolicy; }) : null;

  var html = '<div style="background:var(--bg);min-height:100vh;">';

  /* 상단 바 */
  html += '<div class="topbar">';
  html += '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.4em;">' + myP.emoji + '</span>';
  html += '<div><div style="font-weight:700;">' + myP.name + ' <span style="color:' + cl.color + ';font-size:0.85em;">' + cl.emoji + ' ' + myP.country + '</span></div>';
  html += '<div style="font-size:0.73em;color:var(--text2);">⚔️' + myP.military + ' · 👥' + myP.population + ' · 🌐 ' + OL.roomCode + '</div></div></div>';
  html += '<div style="text-align:center;"><div class="turn-num">턴 ' + G.turn + ' / ' + G.maxTurns + '</div></div>';
  html += '<div style="text-align:right;"><div style="font-size:0.7em;color:var(--text2);">종합 국력</div><div class="turn-num">' + myP.scores.total + '</div></div></div>';

  /* 세계지도 */
  html += '<div style="padding:10px 10px 0;"><canvas id="worldMap" width="760" height="380" style="width:100%;border-radius:8px;border:1px solid rgba(240,192,64,0.18);display:block;"></canvas></div>';

  html += '<div class="game-grid">';

  /* 왼쪽 */
  html += '<div class="col">';
  html += '<div class="panel"><div class="section-title">📦 보유 자원</div>';
  ['food', 'production', 'gold', 'science', 'culture'].forEach(function (k) { html += resPreviewRow(k, myP.resources[k], gainWithPolicy[k]); });
  html += '</div>';

  var bArr = Array.isArray(myP.buildings) ? myP.buildings : [];
  html += '<div class="panel"><div class="section-title">🏗️ 건물 (' + bArr.length + ')</div>';
  if (bArr.length === 0) html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  else {
    var bShown = {};
    bArr.forEach(function (id) { bShown[id] = (bShown[id] || 0) + 1; });
    Object.keys(bShown).forEach(function (id) {
      var allBlds = BUILDINGS.concat(typeof UNIQUE_BUILDINGS !== 'undefined' ? UNIQUE_BUILDINGS : []);
      var b = allBlds.find(function (x) { return x.id === id; });
      if (b) html += '<div style="font-size:0.82em;padding:2px 0;">' + b.emoji + ' ' + b.name + (bShown[id] > 1 ? ' x' + bShown[id] : '') + '</div>';
    });
  }
  html += '</div>';

  var tArr = Array.isArray(myP.techs) ? myP.techs : [];
  html += '<div class="panel"><div class="section-title">🔬 기술 (' + tArr.length + ')</div>';
  if (tArr.length === 0) html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  else tArr.forEach(function (id) { var t = TECHS.find(function (x) { return x.id === id; }); if (t) html += '<div style="font-size:0.82em;padding:2px 0;">' + t.emoji + ' ' + t.name + '</div>'; });
  html += '</div></div>';

  /* 중앙 */
  html += '<div class="col">';
  if (submitted) {
    var submitCount = G.players.filter(function (p) { return p.submitted; }).length;
    html += '<div class="panel" style="text-align:center;padding:40px 20px;">';
    html += '<div style="font-size:3em;margin-bottom:14px;" class="pulse">⏳</div>';
    html += '<div style="font-size:1.2em;font-weight:700;color:var(--gold);margin-bottom:8px;">턴 제출 완료!</div>';
    html += '<div style="color:var(--text2);margin-bottom:16px;">다른 플레이어를 기다리는 중...</div>';
    html += '<div style="font-size:1.5em;font-weight:900;color:var(--gold);">' + submitCount + ' / ' + G.players.length + '</div>';
    html += '</div>';
  } else {
    html += '<div class="panel" style="padding:0;overflow:hidden;"><div class="tabs" style="padding:0 12px;">';
    html += '<div class="tab' + (G.tab === 'build'    ? ' active' : '') + '" onclick="tabBuild()">🏗️ 건설</div>';
    html += '<div class="tab' + (G.tab === 'research' ? ' active' : '') + '" onclick="tabResearch()">🔬 연구</div>';
    html += '<div class="tab' + (G.tab === 'policy'   ? ' active' : '') + '" onclick="tabPolicy()">📜 정책</div>';
    html += '<div class="tab' + (G.tab === 'scores'   ? ' active' : '') + '" onclick="tabScores()">📊 국력</div>';
    html += '</div><div style="padding:12px;">';
    G.players[OL.myPlayerId] = myP; G.curPlayer = OL.myPlayerId;
    if (G.tab === 'build')    html += renderBuildTab(myP);
    if (G.tab === 'research') html += renderResearchTab(myP);
    if (G.tab === 'policy')   html += renderPolicyTab();
    if (G.tab === 'scores')   html += renderScoresTab(myP);
    html += '</div></div>';

    html += '<div class="panel" style="background:rgba(240,192,64,0.04);border-color:rgba(240,192,64,0.28);">';
    html += '<div class="section-title">✅ 이번 턴 결정</div>';
    html += '<div class="grid3" style="gap:8px;margin-bottom:12px;">';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">건설</div><div style="font-weight:700;font-size:0.85em;color:' + (selBuildDef ? 'var(--gold)' : 'var(--text2)') + ';">' + (selBuildDef ? selBuildDef.emoji + ' ' + selBuildDef.name : '선택 안 함') + '</div></div>';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">연구</div><div style="font-weight:700;font-size:0.85em;color:' + (selTechDef ? 'var(--gold)' : 'var(--text2)') + ';">' + (selTechDef ? selTechDef.emoji + ' ' + selTechDef.name : '선택 안 함') + '</div></div>';
    html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;"><div style="color:var(--text2);font-size:0.76em;">정책</div><div style="font-weight:700;font-size:0.85em;color:' + (selPolicyDef ? 'var(--gold)' : 'var(--text2)') + ';">' + (selPolicyDef ? selPolicyDef.emoji + ' ' + selPolicyDef.name : '선택 안 함') + '</div></div>';
    html += '</div><button class="btn btn-primary btn-block" onclick="olSubmitTurn()">턴 제출 →</button></div>';
  }
  html += '</div>';

  /* 오른쪽: 순위 */
  html += '<div class="col"><div class="panel"><div class="section-title">🏆 순위</div>';
  sorted.forEach(function (sp, idx) {
    var cl2 = CLIMATES[sp.climate];
    var isMe = sp.id === OL.myPlayerId;
    html += '<div style="display:flex;align-items:center;gap:7px;padding:5px;border-bottom:1px solid rgba(255,255,255,0.05);">';
    html += '<span style="font-weight:900;width:22px;text-align:center;color:' + (idx === 0 ? '#f0c040' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#c08040' : 'var(--text2)') + ';">' + (idx + 1) + '</span>';
    html += '<span>' + sp.emoji + '</span>';
    html += '<div style="flex:1;min-width:0;"><div style="font-size:0.82em;font-weight:' + (isMe ? 700 : 400) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sp.name + (isMe ? ' (나)' : '') + '</div>';
    html += '<div style="font-size:0.72em;color:' + cl2.color + ';">' + cl2.emoji + ' ' + sp.country + '</div></div>';
    html += '<span style="font-weight:700;color:var(--gold);font-size:0.9em;">' + sp.scores.total + '</span>';
    html += sp.submitted ? '<span class="badge badge-good" style="font-size:0.65em;">제출</span>' : '<span class="badge badge-bad" style="font-size:0.65em;">대기</span>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '</div></div>';
  return html;
}

function renderOnlineEvents() {
  var log  = Array.isArray(G.turnLog) ? G.turnLog : [];
  var html = '<div class="screen anim" style="background:var(--bg);"><div style="max-width:800px;width:100%;">';
  html += '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:2em;">📰</div>';
  html += '<h2 style="color:var(--gold);">턴 ' + G.turn + ' 이벤트</h2></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:22px;">';
  log.forEach(function (entry) {
    var p  = G.players ? G.players.find(function (x) { return x.id === entry.pid; }) : null;
    if (!p) return;
    var cl = CLIMATES[entry.climate]; var ev = entry.ev;
    html += '<div class="ev-card ' + (ev ? ev.type : 'neutral') + '" style="border-color:' + p.color + '44;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span>' + p.emoji + '</span>';
    html += '<div><div style="font-weight:700;font-size:0.88em;">' + entry.pname + (p.id === OL.myPlayerId ? ' (나)' : '') + '</div>';
    html += '<div style="font-size:0.73em;color:' + cl.color + ';">' + cl.emoji + ' ' + entry.country + '</div></div></div>';
    if (ev) {
      html += '<div style="font-size:2em;margin-bottom:5px;">' + ev.emoji + '</div>';
      html += '<div style="font-weight:700;margin-bottom:3px;">' + ev.name + '</div>';
      html += '<div style="font-size:0.8em;color:var(--text2);margin-bottom:7px;">' + ev.desc + '</div>';
      html += '<span class="badge ' + (ev.type === 'good' ? 'badge-good' : 'badge-bad') + '">' + entry.fx + '</span>';
    } else { html += '<div style="color:var(--text2);font-size:0.85em;padding:8px 0;">평온한 턴 😌</div>'; }
    html += '</div>';
  });
  html += '</div><div style="text-align:center;">';
  html += OL.isHost
    ? '<button class="btn btn-primary" onclick="olNextFromEvents()">📊 결과 보기 →</button>'
    : '<button class="btn btn-primary" onclick="olNextFromEvents()">확인 완료</button><div style="color:var(--text2);font-size:0.82em;margin-top:10px;">방장이 다음 단계로 넘어가기를 기다리는 중...</div>';
  html += '</div></div></div>';
  return html;
}

function renderOnlineSummary() {
  var sorted = (G.players || []).slice().sort(function (a, b) { return b.scores.total - a.scores.total; });
  var medals = ['🥇', '🥈', '🥉'];
  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:760px;width:100%;padding-bottom:30px;">';
  html += '<div style="text-align:center;margin-bottom:16px;"><h2 style="color:var(--gold);">턴 ' + G.turn + ' 종료</h2>';
  html += '<p style="color:var(--text2);font-size:0.84em;">남은 턴: ' + (G.maxTurns - G.turn) + '턴</p></div>';
  html += '<canvas id="worldMap" width="760" height="300" style="width:100%;border-radius:8px;border:1px solid rgba(240,192,64,0.18);display:block;margin-bottom:14px;"></canvas>';
  sorted.forEach(function (p, idx) { html += rankRow(p, idx, true); });
  html += '<div style="text-align:center;margin-top:18px;">';
  html += OL.isHost
    ? '<button class="btn btn-primary" onclick="olNextFromSummary()">다음 턴 →</button>'
    : '<div style="color:var(--text2);font-size:0.85em;" class="pulse">⏳ 방장이 다음 턴을 시작하기를 기다리는 중...</div>';
  html += '</div></div></div>';
  return html;
}

function renderOnlineResults() {
  var sorted    = (G.players || []).slice().sort(function (a, b) { return b.scores.total - a.scores.total; });
  var winner    = sorted[0];
  if (!winner)  return '<div class="screen"><div>로딩 중...</div></div>';
  var winnerCl  = CLIMATES[winner.climate];
  var isIWinner = winner.id === OL.myPlayerId;
  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:700px;width:100%;padding-bottom:30px;">';
  html += '<div class="winner-banner" style="margin-bottom:24px;">';
  html += '<div style="font-size:3em;margin-bottom:10px;">🏆</div>';
  if (isIWinner) html += '<div style="font-size:1.2em;font-weight:900;color:var(--gold);margin-bottom:6px;" class="glow">🎉 축하합니다! 당신이 이겼습니다! 🎉</div>';
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);" class="glow">' + winner.emoji + ' ' + winner.name + '</div>';
  html += '<div style="color:' + winnerCl.color + ';margin-bottom:6px;">' + winnerCl.emoji + ' ' + winner.country + '</div>';
  html += '<div style="font-size:2.2em;font-weight:900;color:var(--gold);">' + winner.scores.total + ' 점</div></div>';
  sorted.forEach(function (p, idx) { html += rankRow(p, idx, true); });
  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:24px;">';
  html += '<button class="btn btn-primary" onclick="leaveRoom()">🏠 메인으로</button></div>';
  html += '</div></div>';
  return html;
}
