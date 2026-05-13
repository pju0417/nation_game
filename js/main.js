/* =========================================================
   나라 경영 시뮬레이션 · main.js
   게임 상태 · 전역 핸들러 · 렌더 라우터 · 초기화
   made by 박선생
========================================================= */

/* ─── 게임 전역 상태 ─────────────────────────────── */
var G = {
  phase:     'menu',   /* 현재 화면 */

  /* 설정 */
  mode:      'solo',
  diff:      'normal',
  maxTurns:  20,
  pCount:    3,
  pConfigs:  [],

  /* 진행 */
  turn:      1,
  players:   [],
  curPlayer: 0,
  turnLog:   [],
  scoreHist: [],

  /* UI */
  tab:       'build',
  selBuild:  null,
  selTech:   null,
  selPolicy: null,
  _olTab:    'create'   /* 온라인 메뉴 탭 */
};

/* ─── 설정 초기화 ────────────────────────────────── */
function initSetup(count) {
  var ckeys = Object.keys(CLIMATES);
  G.pConfigs = [];
  for (var i = 0; i < count; i++) {
    G.pConfigs.push({
      id:      i,
      name:    i === 0 ? '플레이어 1' : (G.mode === 'multi' ? '플레이어 ' + (i + 1) : 'AI ' + i),
      climate: ckeys[i % ckeys.length],
      isAI:    G.mode === 'solo' ? i > 0 : false
    });
  }
}

/* ─── 게임 시작 ──────────────────────────────────── */
function startGame() {
  G.players   = G.pConfigs.map(function (cfg) { return mkPlayer(cfg); });
  G.turn      = 1;
  G.scoreHist = [];
  G.turnLog   = [];
  G.selBuild  = null;
  G.selTech   = null;
  G.selPolicy = null;
  G.tab       = 'build';

  G.players.forEach(function (p) { calcScore(p); });

  var firstHuman = -1;
  for (var i = 0; i < G.players.length; i++) {
    if (!G.players[i].isAI) { firstHuman = i; break; }
  }
  G.curPlayer = firstHuman >= 0 ? firstHuman : 0;
  G.phase     = firstHuman >= 0 ? 'cover' : 'events';
  render();
}

/* ─── 턴 제출 ────────────────────────────────────── */
function submitTurn() {
  var p = G.players[G.curPlayer];
  p.action = { build: G.selBuild, research: G.selTech, policy: G.selPolicy };
  advanceHuman();
}

/* ─── 다음 인간 플레이어 ─────────────────────────── */
function advanceHuman() {
  var next = G.curPlayer + 1;
  while (next < G.players.length && G.players[next].isAI) next++;

  if (next >= G.players.length) {
    /* 모든 인간 완료 → AI 처리 */
    G.players.forEach(function (p) {
      if (p.isAI) p.action = aiDecide(p);
    });
    processTurn();
    G.phase = 'events';
  } else {
    G.curPlayer = next;
    G.phase     = 'cover';
  }

  G.selBuild  = null;
  G.selTech   = null;
  G.selPolicy = null;
  G.tab       = 'build';
  render();
}

/* ─── 다음 턴 ────────────────────────────────────── */
function nextTurn() {
  if (G.turn >= G.maxTurns) { G.phase = 'results'; render(); return; }
  G.turn++;
  var firstHuman = -1;
  for (var i = 0; i < G.players.length; i++) {
    if (!G.players[i].isAI) { firstHuman = i; break; }
  }
  G.curPlayer = firstHuman >= 0 ? firstHuman : 0;
  G.phase     = firstHuman >= 0 ? 'cover' : 'events';
  G.selBuild  = null;
  G.selTech   = null;
  G.selPolicy = null;
  render();
}

/* ─── 화면 전환 핸들러 ───────────────────────────── */
function goMenu()    { G.phase = 'menu';    render(); }
function goHelp()    { G.phase = 'help';    render(); }
function goOnline()  { G.phase = 'ol-menu'; G._olTab = 'create'; render(); }
function goSummary() { G.phase = 'summary'; render(); }
function goResults() { G.phase = 'results'; render(); }
function startTurn() { G.phase = 'playerTurn'; render(); }

/* ─── 탭 전환 (인자 없이 호출 가능하도록 분리) ───── */
function tabBuild()    { G.tab = 'build';    render(); }
function tabResearch() { G.tab = 'research'; render(); }
function tabPolicy()   { G.tab = 'policy';   render(); }
function tabScores()   { G.tab = 'scores';   render(); }
function olTabCreate() { G._olTab = 'create'; render(); }
function olTabJoin()   { G._olTab = 'join';   render(); }

/* ─── 설정 핸들러 ────────────────────────────────── */
function selectMode(m) {
  G.mode   = m;
  G.pCount = m === 'solo' ? 3 : 2;
  initSetup(G.pCount);
  G.phase = 'setup';
  render();
}

function restartGame() {
  initSetup(G.pCount);
  G.phase = 'setup';
  render();
}

function updCount(n) {
  G.pCount = n;
  initSetup(n);
  render();
}

function updClimate(i, v) {
  G.pConfigs[i].climate = v;
  render();
}

function updName(i, v) {
  G.pConfigs[i].name = v;
}

function setAI(i, v) {
  G.pConfigs[i].isAI = v;
  if (v) G.pConfigs[i].name = 'AI ' + (i + 1);
  render();
}

/* ─── 행동 선택 핸들러 ───────────────────────────── */
function selBuild(id)  { G.selBuild  = G.selBuild  === id ? null : id; render(); }
function selTech(id)   { G.selTech   = G.selTech   === id ? null : id; render(); }
function selPolicy(id) { G.selPolicy = G.selPolicy === id ? null : id; render(); }

/* ─── 렌더 라우터 ────────────────────────────────── */
function render() {
  var app = document.getElementById('app');
  var html = '';

  switch (G.phase) {
    /* 오프라인 */
    case 'menu':       html = renderMenu();       break;
    case 'help':       html = renderHelp();       break;
    case 'setup':      html = renderSetup();      break;
    case 'cover':      html = renderCover();      break;
    case 'playerTurn': html = renderPlayerTurn(); break;
    case 'events':     html = renderEvents();     break;
    case 'summary':    html = renderSummary();    break;
    case 'results':    html = renderResults();    break;
    /* 온라인 */
    case 'ol-menu':    html = renderOnlineMenu();    break;
    case 'ol-lobby':   html = renderOnlineLobby();   break;
    case 'ol-game':    html = renderOnlineGame();     break;
    case 'ol-events':  html = renderOnlineEvents();   break;
    case 'ol-summary': html = renderOnlineSummary();  break;
    case 'ol-results': html = renderOnlineResults();  break;
    case 'ol-waiting': html = renderOnlineSummary();  break;
    default:           html = renderMenu();
  }

  app.innerHTML = html;
}

/* ─── 별 배경 ────────────────────────────────────── */
function initStars() {
  var canvas = document.getElementById('stars');
  var ctx    = canvas.getContext('2d');
  var stars  = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (var i = 0; i < 160; i++) {
      stars.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.4 + 0.4,
        a:  Math.random(),
        sp: Math.random() * 0.008 + 0.003
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var t = Date.now() * 0.001;
    stars.forEach(function (s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,215,255,' + (0.25 + 0.35 * Math.sin(t * s.sp * 10 + s.a * 100)) + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ─── 진입점 ─────────────────────────────────────── */
initStars();
initSetup(G.pCount);
render();
