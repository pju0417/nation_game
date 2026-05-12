/* =========================================================
   나라 경영 시뮬레이션 · screens.js
   각 화면(스크린) 렌더링 함수 모음
   made by 박선생
========================================================= */

/* ─── 메인 메뉴 ──────────────────────────────────── */
function renderMenu() {
  return [
    '<div class="screen anim" style="background:linear-gradient(180deg,#04060f,#08091a);">',
    '<div style="text-align:center;max-width:520px;width:100%;">',
    '<div style="font-size:3em;margin-bottom:10px;">🌍</div>',
    '<h1 class="glow" style="font-size:2.4em;font-weight:900;color:var(--gold);letter-spacing:2px;text-shadow:0 0 30px rgba(240,192,64,0.4);line-height:1.2;margin-bottom:6px;">나라 경영 시뮬레이션</h1>',
    '<p style="color:var(--text2);letter-spacing:1px;margin-bottom:6px;font-size:0.9em;">기후와 문명의 이야기</p>',
    '<p style="color:var(--text2);font-size:0.76em;margin-bottom:30px;">초등학교 6학년 사회 · 여러 가지 기후</p>',

    '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(240,192,64,0.18);border-radius:10px;padding:16px;margin-bottom:26px;font-size:0.84em;line-height:1.75;text-align:left;color:var(--text);">',
    '<div style="color:var(--gold);font-weight:700;margin-bottom:6px;">🎮 게임 소개</div>',
    '세계 여러 <strong style="color:var(--gold);">기후 지역</strong>의 나라를 맡아 경영하는 <strong style="color:var(--gold);">문명 시뮬레이션</strong>입니다.<br>',
    '건물을 짓고, 기술을 연구하고, 정책을 펼쳐 나라를 발전시키세요!<br>',
    '정해진 턴 안에 <strong style="color:var(--gold);">종합 국력 1위</strong>를 달성한 나라가 승리합니다.',
    '</div>',

    '<button class="menu-btn menu-primary" onclick="selectMode(\'solo\')">🌐 혼자 하기 (솔로 플레이)</button>',
    '<button class="menu-btn" onclick="selectMode(\'multi\')">👥 같이 하기 (한 기기 · 2~6인)</button>',
    '<button class="menu-btn" style="border-color:rgba(100,160,255,0.5);color:#80b8ff;background:rgba(100,160,255,0.06);" onclick="G.phase=\'ol-menu\';G._olTab=\'create\';render()">🌏 온라인 대전 (다른 기기 · 2~6인)</button>',
    '<button class="menu-btn" onclick="goHelp()" style="font-size:0.9em;border-color:rgba(240,192,64,0.2);">📖 도움말 · 게임 규칙</button>',

    '<div style="margin-top:28px;font-size:0.75em;color:var(--text2);letter-spacing:0.5px;">',
    '🌴 열대 · 🏜️ 건조 · 🌿 온대 · 🌲 냉대 · 🌾 계절풍 · ⛰️ 고산',
    '</div></div></div>'
  ].join('');
}

/* ─── 도움말 ─────────────────────────────────────── */
function renderHelp() {
  var html = '';
  html += '<div class="screen anim" style="background:var(--bg);align-items:center;">';
  html += '<div style="max-width:720px;width:100%;">';
  html += '<div class="topbar" style="position:relative;border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">📖 게임 도움말</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button>';
  html += '</div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;max-height:82vh;overflow-y:auto;padding:20px;">';

  html += '<div class="section-title">🎯 승리 조건</div>';
  html += '<p style="font-size:0.85em;line-height:1.7;margin-bottom:16px;">정해진 턴이 끝났을 때 <strong style="color:var(--gold);">종합 국력 점수가 가장 높은 나라</strong>가 승리합니다.</p>';

  html += '<div class="section-title">📊 국력 점수 구성</div>';
  html += '<div style="font-size:0.82em;line-height:1.95;margin-bottom:16px;">';
  html += '💰 <strong>경제력</strong>: 금화 자원 ÷2 + 시장×8 + 광산×5 + 항구×6<br>';
  html += '⚔️ <strong>군사력</strong>: 군사 수치 × 2.5<br>';
  html += '🔬 <strong>과학력</strong>: 연구 기술 수 × 12 + 과학 자원 ÷3<br>';
  html += '🎨 <strong>문화력</strong>: 문화 자원 ÷2 + 사원×8 + 극장×14<br>';
  html += '👥 <strong>인구력</strong>: 인구 × 6<br>';
  html += '🤝 <strong>외교력</strong>: 외교 보너스 합계';
  html += '</div>';

  html += '<div class="section-title">🔄 턴 진행 순서</div>';
  html += '<div style="font-size:0.82em;line-height:1.9;margin-bottom:16px;">';
  html += '1. 각 플레이어가 순서대로 <strong>건설 / 연구 / 정책</strong>을 각 1개씩 선택<br>';
  html += '2. 모든 플레이어의 결정이 끝나면 동시에 처리됩니다<br>';
  html += '3. 무작위 이벤트(풍년·가뭄·발견 등)가 각 나라에 발생<br>';
  html += '4. 턴 결과를 확인하고 다음 턴으로 진행';
  html += '</div>';

  html += '<div class="section-title">🌍 6대 기후와 특징</div>';
  html += '<div class="grid2" style="gap:8px;margin-bottom:16px;">';
  Object.values(CLIMATES).forEach(function(c) { html += climateRefBox(c); });
  html += '</div>';

  html += '<div class="section-title">⚙️ 자원 설명</div>';
  html += '<div style="font-size:0.82em;line-height:1.9;margin-bottom:20px;">';
  html += '🌾 <strong>식량</strong>: 인구를 유지하고 성장시킵니다 (인구×2 소비/턴)<br>';
  html += '⚙️ <strong>생산력</strong>: 건물을 건설하는 데 소모됩니다<br>';
  html += '💰 <strong>금화</strong>: 건물 건설과 경제 점수에 기여합니다<br>';
  html += '🔬 <strong>과학</strong>: 기술을 연구하는 데 소모됩니다<br>';
  html += '🎨 <strong>문화</strong>: 문화 점수에 기여합니다';
  html += '</div>';

  html += '<div style="text-align:center;">';
  html += '<button class="btn btn-primary" onclick="goMenu()">게임 시작하러 가기 →</button>';
  html += '</div>';
  html += '</div></div></div>';
  return html;
}

/* ─── 게임 설정 ──────────────────────────────────── */
function renderSetup() {
  var ckeys = Object.keys(CLIMATES);

  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:16px;">';
  html += '<div style="max-width:860px;width:100%;margin-top:10px;">';

  html += '<div class="topbar" style="position:relative;border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">' + (G.mode === 'solo' ? '🌐 솔로 플레이 설정' : '👥 멀티플레이 설정') + '</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button>';
  html += '</div>';

  html += '<div class="panel" style="border-radius:0 0 8px 8px;max-height:88vh;overflow-y:auto;">';

  /* 게임 설정 3열 */
  html += '<div class="grid3" style="margin-bottom:18px;">';

  html += '<div><div class="section-title">🎯 난이도</div>';
  html += '<select onchange="G.diff=this.value">';
  html += '<option value="easy"'   + (G.diff === 'easy'   ? ' selected' : '') + '>쉬움 🟢</option>';
  html += '<option value="normal"' + (G.diff === 'normal' ? ' selected' : '') + '>보통 🟡</option>';
  html += '<option value="hard"'   + (G.diff === 'hard'   ? ' selected' : '') + '>어려움 🔴</option>';
  html += '</select></div>';

  html += '<div><div class="section-title">🔄 총 턴 수</div>';
  html += '<select onchange="G.maxTurns=parseInt(this.value)">';
  html += '<option value="15"' + (G.maxTurns === 15 ? ' selected' : '') + '>15턴 (단기)</option>';
  html += '<option value="20"' + (G.maxTurns === 20 ? ' selected' : '') + '>20턴 (표준)</option>';
  html += '<option value="30"' + (G.maxTurns === 30 ? ' selected' : '') + '>30턴 (장기)</option>';
  html += '</select></div>';

  html += '<div><div class="section-title">👤 참여 인원</div>';
  html += '<select onchange="updCount(parseInt(this.value))">';
  [2,3,4,5,6].forEach(function(n) {
    var label = n + '명' + (G.mode === 'solo' ? ' (AI ' + (n-1) + '명)' : '');
    html += '<option value="' + n + '"' + (G.pCount === n ? ' selected' : '') + '>' + label + '</option>';
  });
  html += '</select></div>';

  html += '</div>'; /* grid3 */

  /* 플레이어 설정 */
  html += '<div class="section-title">🌍 나라 선택</div>';

  G.pConfigs.forEach(function(cfg, i) {
    var cl = CLIMATES[cfg.climate];
    html += '<div class="panel-sm" style="margin-bottom:8px;border-color:' + cl.color + '33;">';
    html += '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;">';
    html += '<div style="font-size:2em;padding-top:4px;">' + cl.emoji + '</div>';

    html += '<div>';
    html += '<input type="text" value="' + cfg.name + '" onchange="updName(' + i + ',this.value)" placeholder="이름 입력"' + (cfg.isAI ? ' disabled' : '') + ' style="margin-bottom:7px;">';
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
    html += '<select onchange="updClimate(' + i + ',this.value)" style="flex:1;min-width:110px;">';
    ckeys.forEach(function(k) {
      html += '<option value="' + k + '"' + (cfg.climate === k ? ' selected' : '') + '>' + CLIMATES[k].emoji + ' ' + CLIMATES[k].name + ' 기후</option>';
    });
    html += '</select>';
    if (G.mode === 'solo' && i > 0) {
      html += '<span class="badge-ai">AI</span>';
    } else if (G.mode === 'multi') {
      html += '<label style="font-size:0.82em;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;">';
      html += '<input type="checkbox"' + (cfg.isAI ? ' checked' : '') + ' onchange="setAI(' + i + ',this.checked)"> AI';
      html += '</label>';
    }
    html += '</div></div>';

    html += '<div style="font-size:0.75em;min-width:130px;color:var(--text2);line-height:1.65;">';
    html += '<div style="color:' + cl.color + ';font-weight:700;">' + cl.name + ' 기후</div>';
    html += '<div style="color:#80e890;">' + cl.perk + '</div>';
    html += '<div style="color:#f09090;">' + cl.weakness + '</div>';
    html += '<div style="margin-top:3px;">🌾' + cl.base.food + ' ⚙️' + cl.base.production + ' 💰' + cl.base.gold + ' 🔬' + cl.base.science + ' 🎨' + cl.base.culture + '</div>';
    html += '</div>';

    html += '</div></div>'; /* grid / panel-sm */
  });

  /* 기후 참고표 */
  html += '<div class="section-title" style="margin-top:16px;">📚 기후 기본 자원 참고표 (턴당)</div>';
  html += '<div class="grid3" style="gap:6px;margin-bottom:20px;">';
  Object.values(CLIMATES).forEach(function(c) {
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px;border-left:3px solid ' + c.color + ';font-size:0.77em;">';
    html += '<div style="font-weight:700;margin-bottom:2px;">' + c.emoji + ' ' + c.name + '</div>';
    html += '<div style="color:var(--text2);">🌾' + c.base.food + ' ⚙️' + c.base.production + ' 💰' + c.base.gold + ' 🔬' + c.base.science + ' 🎨' + c.base.culture + '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '<div style="text-align:center;">';
  html += '<button class="btn btn-primary" onclick="startGame()" style="font-size:1.1em;padding:14px 40px;">⚔️ 게임 시작!</button>';
  html += '</div>';

  html += '</div></div></div>';
  return html;
}

/* ─── 커버 화면 (플레이어 교체) ─────────────────── */
function renderCover() {
  var p  = G.players[G.curPlayer];
  var cl = CLIMATES[p.climate];

  var html = '<div class="cover anim" style="background:' + cl.bg + ';">';
  html += '<div style="text-align:center;">';
  html += '<div style="font-size:4em;margin-bottom:12px;">' + p.emoji + '</div>';
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);margin-bottom:6px;">' + p.name + '</div>';
  html += '<div style="font-size:1.15em;color:' + cl.color + ';margin-bottom:4px;">' + cl.emoji + ' ' + p.country + '</div>';
  html += '<div style="font-size:0.85em;color:var(--text2);margin-bottom:36px;">' + cl.name + ' 기후 문명</div>';

  html += '<div style="background:rgba(0,0,0,0.5);border:1px solid rgba(240,192,64,0.3);border-radius:10px;padding:20px;margin-bottom:28px;max-width:380px;">';
  html += '<div style="font-size:0.78em;color:var(--gold);font-weight:700;margin-bottom:10px;">턴 ' + G.turn + ' / ' + G.maxTurns + ' · 현재 종합 국력</div>';
  html += '<div style="font-size:2.2em;font-weight:900;color:var(--gold);">' + p.scores.total + ' 점</div>';
  html += '<div style="margin-top:10px;">' + rbar(p.resources, true) + '</div>';
  html += '<div style="font-size:0.8em;color:var(--text2);margin-top:8px;">⚔️ 군사력 ' + p.military + '  ·  👥 인구 ' + p.population + '</div>';
  html += '</div>';

  html += '<div style="color:var(--text2);font-size:0.84em;margin-bottom:20px;">다른 플레이어는 화면을 보지 마세요 👀</div>';
  html += '<button class="btn btn-primary" onclick="startTurn()" style="font-size:1.1em;padding:14px 40px;">내 차례 시작하기 ▶</button>';
  html += '</div></div>';
  return html;
}

/* ─── 플레이어 턴 메인 화면 ─────────────────────── */
function renderPlayerTurn() {
  var p  = G.players[G.curPlayer];
  var cl = CLIMATES[p.climate];
  var gain = totalGain(p);
  var gainWithPolicy = applyPolicy(Object.assign({}, gain), G.selPolicy);
  calcScore(p);

  /* 현재 선택 요약 */
  var selBuildDef  = G.selBuild  ? BUILDINGS.find(function(x){ return x.id === G.selBuild;  }) : null;
  var selTechDef   = G.selTech   ? TECHS.find(function(x){ return x.id === G.selTech;   }) : null;
  var selPolicyDef = G.selPolicy ? POLICIES.find(function(x){ return x.id === G.selPolicy; }) : null;

  /* 순위 목록 */
  var sortedPlayers = G.players.slice().sort(function(a,b) { return b.scores.total - a.scores.total; });

  var html = '<div style="background:var(--bg);min-height:100vh;">';

  /* TOP BAR */
  html += '<div class="topbar">';
  html += '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<span style="font-size:1.4em;">' + p.emoji + '</span>';
  html += '<div>';
  html += '<div style="font-weight:700;">' + p.name + ' <span style="color:' + cl.color + ';font-size:0.85em;">' + cl.emoji + ' ' + p.country + '</span></div>';
  html += '<div style="font-size:0.74em;color:var(--text2);">⚔️ 군사력 ' + p.military + ' · 👥 인구 ' + p.population + '</div>';
  html += '</div></div>';
  html += '<div style="text-align:center;">';
  html += '<div class="turn-num">턴 ' + G.turn + ' / ' + G.maxTurns + '</div>';
  html += '<div style="font-size:0.7em;color:var(--text2);">남은 턴 ' + (G.maxTurns - G.turn) + '턴</div>';
  html += '</div>';
  html += '<div style="text-align:right;">';
  html += '<div style="font-size:0.7em;color:var(--text2);">종합 국력</div>';
  html += '<div class="turn-num">' + p.scores.total + '</div>';
  html += '</div></div>';

  /* 메인 그리드 */
  html += '<div class="game-grid">';

  /* ── 왼쪽: 내 나라 상태 ── */
  html += '<div class="col">';

  /* 자원 패널 */
  html += '<div class="panel">';
  html += '<div class="section-title">📦 현재 보유 자원</div>';
  ['food','production','gold','science','culture'].forEach(function(k) {
    html += resPreviewRow(k, p.resources[k], gainWithPolicy[k]);
  });
  html += '</div>';

  /* 기후 정보 */
  html += '<div class="panel" style="border-color:' + cl.color + '44;">';
  html += '<div class="section-title">' + cl.emoji + ' ' + cl.name + ' 기후</div>';
  html += '<div style="font-size:0.8em;color:var(--text2);margin-bottom:7px;">' + cl.desc + '</div>';
  html += '<div style="font-size:0.77em;margin-bottom:3px;">🌍 ' + cl.geo + '</div>';
  html += '<div style="font-size:0.77em;color:#80e890;">' + cl.perk + '</div>';
  html += '<div style="font-size:0.77em;color:#f09090;">' + cl.weakness + '</div>';
  html += '</div>';

  /* 건물 목록 */
  var bc = buildCount(p);
  html += '<div class="panel">';
  html += '<div class="section-title">🏗️ 완성된 건물 (' + p.buildings.length + '개)</div>';
  if (p.buildings.length === 0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 건물이 없습니다</div>';
  } else {
    var shown = {};
    p.buildings.forEach(function(id) {
      if (!shown[id]) {
        shown[id] = true;
        var b = BUILDINGS.find(function(x){ return x.id === id; });
        if (b) html += '<div style="font-size:0.82em;padding:2px 0;">' + b.emoji + ' ' + b.name + (bc[id] > 1 ? ' ×' + bc[id] : '') + '</div>';
      }
    });
  }
  html += '</div>';

  /* 기술 목록 */
  html += '<div class="panel">';
  html += '<div class="section-title">🔬 연구된 기술 (' + p.techs.length + '개)</div>';
  if (p.techs.length === 0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 연구한 기술이 없습니다</div>';
  } else {
    p.techs.forEach(function(id) {
      var t = TECHS.find(function(x){ return x.id === id; });
      if (t) html += '<div style="font-size:0.82em;padding:2px 0;">' + t.emoji + ' ' + t.name + '</div>';
    });
  }
  html += '</div>';

  html += '</div>'; /* col 끝 */

  /* ── 중앙: 행동 탭 ── */
  html += '<div class="col">';

  html += '<div class="panel" style="padding:0;overflow:hidden;">';
  html += '<div class="tabs" style="padding:0 12px;">';
  html += '<div class="tab' + (G.tab === 'build'    ? ' active' : '') + '" onclick="selTab(\'build\')">🏗️ 건설</div>';
  html += '<div class="tab' + (G.tab === 'research' ? ' active' : '') + '" onclick="selTab(\'research\')">🔬 연구</div>';
  html += '<div class="tab' + (G.tab === 'policy'   ? ' active' : '') + '" onclick="selTab(\'policy\')">📜 정책</div>';
  html += '<div class="tab' + (G.tab === 'scores'   ? ' active' : '') + '" onclick="selTab(\'scores\')">📊 국력</div>';
  html += '</div>';
  html += '<div style="padding:12px;">';
  if (G.tab === 'build')    html += renderBuildTab(p);
  if (G.tab === 'research') html += renderResearchTab(p);
  if (G.tab === 'policy')   html += renderPolicyTab();
  if (G.tab === 'scores')   html += renderScoresTab(p);
  html += '</div></div>';

  /* 결정 요약 + 턴 종료 */
  html += '<div class="panel" style="background:rgba(240,192,64,0.04);border-color:rgba(240,192,64,0.28);">';
  html += '<div class="section-title">✅ 이번 턴 결정 요약</div>';
  html += '<div class="grid3" style="gap:8px;margin-bottom:12px;">';

  html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">';
  html += '<div style="color:var(--text2);font-size:0.76em;">건설</div>';
  html += '<div style="font-weight:700;font-size:0.85em;color:' + (selBuildDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selBuildDef ? selBuildDef.emoji + ' ' + selBuildDef.name : '선택 안 함';
  html += '</div></div>';

  html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">';
  html += '<div style="color:var(--text2);font-size:0.76em;">연구</div>';
  html += '<div style="font-weight:700;font-size:0.85em;color:' + (selTechDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selTechDef ? selTechDef.emoji + ' ' + selTechDef.name : '선택 안 함';
  html += '</div></div>';

  html += '<div style="text-align:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">';
  html += '<div style="color:var(--text2);font-size:0.76em;">정책</div>';
  html += '<div style="font-weight:700;font-size:0.85em;color:' + (selPolicyDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selPolicyDef ? selPolicyDef.emoji + ' ' + selPolicyDef.name : '선택 안 함';
  html += '</div></div>';

  html += '</div>';
  html += '<button class="btn btn-primary btn-block" onclick="submitTurn()">턴 종료 →</button>';
  html += '</div>';

  html += '</div>'; /* col 끝 */

  /* ── 오른쪽: 순위 + 다른 나라 ── */
  html += '<div class="col">';

  html += '<div class="panel">';
  html += '<div class="section-title">🏆 현재 순위</div>';
  sortedPlayers.forEach(function(sp, idx) {
    var isSelf = sp.id === p.id;
    var cl2 = CLIMATES[sp.climate];
    html += '<div style="display:flex;align-items:center;gap:7px;padding:5px' + (isSelf ? ';background:rgba(240,192,64,0.06);border-radius:5px;padding:5px 7px;' : '') + ';border-bottom:1px solid rgba(255,255,255,0.05);">';
    html += '<span style="font-weight:900;width:22px;text-align:center;color:' + (idx === 0 ? '#f0c040' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#c08040' : 'var(--text2)') + ';">' + (idx + 1) + '</span>';
    html += '<span>' + sp.emoji + '</span>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:0.82em;font-weight:' + (isSelf ? 700 : 400) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sp.name + '</div>';
    html += '<div style="font-size:0.72em;color:' + cl2.color + ';">' + cl2.emoji + ' ' + sp.country + '</div>';
    html += '</div>';
    html += '<span style="font-weight:700;color:var(--gold);font-size:0.9em;">' + sp.scores.total + '</span>';
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="panel">';
  html += '<div class="section-title">🌍 다른 나라 현황</div>';
  G.players.forEach(function(op) {
    if (op.id !== p.id) html += miniCard(op, null);
  });
  html += '</div>';

  html += '</div>'; /* col 끝 */
  html += '</div>'; /* game-grid 끝 */
  html += '</div>'; /* 페이지 끝 */
  return html;
}

/* ─── 건설 탭 ────────────────────────────────────── */
function renderBuildTab(p) {
  var bc = buildCount(p);
  var html = '';
  html += '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">건물을 선택하면 이번 턴에 건설합니다. 완성 후 매 턴 혜택을 받습니다.</div>';
  html += '<div class="scrollable" style="max-height:340px;">';

  BUILDINGS.forEach(function(b) {
    var count    = bc[b.id] || 0;
    var maxed    = count >= b.max;
    var needsReq = b.req && !p.buildings.includes(b.req);
    var afford   = canAffordBuilding(p, b);
    var disabled = maxed || needsReq || !afford;
    var selected = G.selBuild === b.id;

    html += '<div class="card' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '"';
    if (!disabled) html += ' onclick="selBuild(\'\' + b.id + \'\')"';
    html += ' style="margin-bottom:8px;">';

    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="font-size:1.35em;">' + b.emoji + '</span>';
    html += '<div style="flex:1;">';
    html += '<div style="font-weight:700;font-size:0.9em;">' + b.name;
    if (count > 0) html += ' <span style="color:var(--text2);font-size:0.85em;">(' + count + '/' + b.max + ')</span>';
    html += '</div>';
    html += '<div style="font-size:0.78em;color:#80c080;">' + b.desc + '</div>';
    if (needsReq) {
      var reqDef = BUILDINGS.find(function(x){ return x.id === b.req; });
      html += '<div style="font-size:0.72em;color:#f09090;">⚠️ 필요: ' + (reqDef ? reqDef.name : b.req) + '</div>';
    }
    html += '</div>';
    html += '<div style="text-align:right;">' + costHtml(b.cost, p.resources) + '</div>';
    html += '</div>';

    if (maxed) html += '<div style="color:#f09090;font-size:0.74em;margin-top:4px;">최대 보유</div>';
    else if (!afford && !needsReq) html += '<div style="color:#f09090;font-size:0.74em;margin-top:4px;">자원 부족</div>';
    else if (selected) html += '<div style="color:var(--gold);font-size:0.74em;margin-top:4px;">✓ 선택됨</div>';

    html += '</div>';
  });

  html += '</div>';
  return html;
}

/* ─── 연구 탭 ────────────────────────────────────── */
function renderResearchTab(p) {
  var html = '';
  html += '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">기술을 연구하면 영구적인 혜택을 받습니다. 과학 자원이 필요합니다.</div>';
  html += '<div class="scrollable" style="max-height:340px;">';

  TECHS.forEach(function(t) {
    var researched = p.techs.includes(t.id);
    var afford     = canAffordTech(p, t);
    var disabled   = researched || !afford;
    var selected   = G.selTech === t.id;

    html += '<div class="card' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '"';
    if (!disabled) html += ' onclick="selTech(\'\' + t.id + \'\')"';
    html += ' style="margin-bottom:8px;">';

    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="font-size:1.35em;">' + t.emoji + '</span>';
    html += '<div style="flex:1;">';
    html += '<div style="font-weight:700;font-size:0.9em;">' + t.name + '</div>';
    html += '<div style="font-size:0.78em;color:#80c080;">' + t.desc + '</div>';
    html += '</div>';
    html += '<div style="text-align:right;">' + costHtml(t.cost, p.resources) + '</div>';
    html += '</div>';

    if (researched) html += '<div style="color:#60d060;font-size:0.74em;margin-top:4px;">✓ 이미 연구됨</div>';
    else if (!afford) html += '<div style="color:#f09090;font-size:0.74em;margin-top:4px;">과학 자원 부족</div>';
    else if (selected) html += '<div style="color:var(--gold);font-size:0.74em;margin-top:4px;">✓ 선택됨</div>';

    html += '</div>';
  });

  html += '</div>';
  return html;
}

/* ─── 정책 탭 ────────────────────────────────────── */
function renderPolicyTab() {
  var html = '';
  html += '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">이번 턴에 집중할 국가 정책을 1개 선택하세요.</div>';
  html += '<div class="grid2" style="gap:8px;">';

  POLICIES.forEach(function(pol) {
    var selected = G.selPolicy === pol.id;
    html += '<div class="card' + (selected ? ' selected' : '') + '" onclick="selPolicy(\'\' + pol.id + \'\')"';
    html += ' style="border-color:' + (selected ? pol.color : 'rgba(255,255,255,0.08)') + ';">';
    html += '<div style="font-size:1.7em;margin-bottom:4px;">' + pol.emoji + '</div>';
    html += '<div style="font-weight:700;font-size:0.84em;">' + pol.name + '</div>';
    html += '<div style="font-size:0.74em;color:var(--text2);margin-top:3px;">' + pol.desc + '</div>';
    if (selected) html += '<div style="color:' + pol.color + ';font-size:0.75em;margin-top:5px;font-weight:700;">✓ 선택됨</div>';
    html += '</div>';
  });

  html += '</div>';
  return html;
}

/* ─── 국력 탭 ────────────────────────────────────── */
function renderScoresTab(p) {
  var s = p.scores;
  var items = [
    { label:'💰 경제력', val:s.econ,  desc:'금화 자원 + 경제 건물' },
    { label:'⚔️ 군사력', val:s.mil,   desc:'군사 수치 × 2.5' },
    { label:'🔬 과학력', val:s.sci,   desc:'기술 × 12 + 과학 자원 ÷3' },
    { label:'🎨 문화력', val:s.cult,  desc:'문화 자원 + 문화 건물' },
    { label:'👥 인구력', val:s.pop,   desc:'인구 × 6' },
    { label:'🤝 외교력', val:s.dip,   desc:'외교 보너스 합계' }
  ];
  var maxVal = Math.max.apply(null, items.map(function(x){ return x.val; }).concat([1]));

  var html = '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">' + p.name + '의 분야별 국력 점수입니다.</div>';
  items.forEach(function(item) {
    html += scoreBar(item.label + ' <span style="color:var(--text2);font-size:0.75em;">' + item.desc + '</span>', item.val, maxVal);
  });
  html += '<div style="border-top:1px solid var(--border);padding-top:9px;margin-top:6px;display:flex;justify-content:space-between;align-items:center;">';
  html += '<span style="font-weight:700;">🏆 종합 국력</span>';
  html += '<span style="font-size:1.3em;font-weight:900;color:var(--gold);">' + s.total + '</span>';
  html += '</div>';
  return html;
}

/* ─── 이벤트 화면 ────────────────────────────────── */
function renderEvents() {
  var html = '<div class="screen anim" style="background:var(--bg);">';
  html += '<div style="max-width:800px;width:100%;">';
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<div style="font-size:2em;">📰</div>';
  html += '<h2 style="color:var(--gold);font-size:1.45em;">턴 ' + G.turn + ' 이벤트 발표</h2>';
  html += '<p style="color:var(--text2);font-size:0.84em;margin-top:4px;">각 나라에 다음과 같은 이벤트가 발생했습니다</p>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-bottom:22px;">';

  G.turnLog.forEach(function(log) {
    var p  = G.players.find(function(x){ return x.id === log.pid; });
    var cl = CLIMATES[log.climate];
    var ev = log.ev;

    html += '<div class="ev-card ' + (ev ? ev.type : 'neutral') + '" style="border-color:' + p.color + '44;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    html += '<span style="font-size:1.15em;">' + p.emoji + '</span>';
    html += '<div style="text-align:left;">';
    html += '<div style="font-weight:700;font-size:0.88em;">' + log.pname + '</div>';
    html += '<div style="font-size:0.73em;color:' + cl.color + ';">' + cl.emoji + ' ' + log.country + '</div>';
    html += '</div></div>';

    if (ev) {
      html += '<div style="font-size:2.2em;margin-bottom:6px;">' + ev.emoji + '</div>';
      html += '<div style="font-weight:700;margin-bottom:4px;">' + ev.name + '</div>';
      html += '<div style="font-size:0.8em;color:var(--text2);margin-bottom:8px;">' + ev.desc + '</div>';
      html += '<span class="badge ' + (ev.type === 'good' ? 'badge-good' : 'badge-bad') + '">' + log.fx + '</span>';
    } else {
      html += '<div style="color:var(--text2);font-size:0.85em;padding:10px 0;">평온한 턴이었습니다 😌</div>';
    }

    html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.73em;color:var(--text2);">';
    html += '자원 획득: ';
    var gainParts = [];
    Object.keys(log.gain).forEach(function(k) { gainParts.push((R_EMOJI[k]||'') + '+' + log.gain[k]); });
    html += gainParts.join(' ');
    html += '</div></div>';
  });

  html += '</div>';
  html += '<div style="text-align:center;">';
  html += '<button class="btn btn-primary" onclick="G.phase=\'summary\';render()">📊 이번 턴 결과 보기 →</button>';
  html += '</div>';
  html += '</div></div>';
  return html;
}

/* ─── 턴 요약 화면 ───────────────────────────────── */
function renderSummary() {
  var sorted = G.players.slice().sort(function(a,b){ return b.scores.total - a.scores.total; });
  var turnsLeft = G.maxTurns - G.turn;

  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:900px;width:100%;padding-bottom:30px;">';
  html += '<div style="text-align:center;margin-bottom:20px;">';
  html += '<div style="font-size:2em;">📊</div>';
  html += '<h2 style="color:var(--gold);font-size:1.45em;">턴 ' + G.turn + ' 종료 · 국력 순위</h2>';
  html += '<p style="color:var(--text2);font-size:0.84em;margin-top:4px;">남은 턴: ' + turnsLeft + '턴' + (turnsLeft === 0 ? ' · ⚔️ 게임 종료!' : '') + '</p>';
  html += '</div>';

  /* 순위 목록 */
  html += '<div style="margin-bottom:18px;">';
  sorted.forEach(function(p, idx) { html += rankRow(p, idx, true); });
  html += '</div>';

  /* 점수 바 차트 */
  html += '<div class="panel" style="margin-bottom:18px;">';
  html += '<div class="section-title">📈 국력 비교</div>';
  var maxTotal = sorted[0] ? sorted[0].scores.total : 1;
  sorted.forEach(function(p) {
    var pct = Math.min(100, maxTotal > 0 ? (p.scores.total / maxTotal) * 100 : 0);
    html += '<div style="margin-bottom:7px;">';
    html += '<div style="display:flex;justify-content:space-between;font-size:0.82em;margin-bottom:2px;">';
    html += '<span>' + p.emoji + ' ' + p.name + '</span>';
    html += '<span style="color:var(--gold);font-weight:700;">' + p.scores.total + '</span>';
    html += '</div>';
    html += '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%;background:' + p.color + ';opacity:0.8;"></div></div>';
    html += '</div>';
  });
  html += '</div>';

  /* 상세 표 */
  html += '<div class="panel" style="margin-bottom:18px;">';
  html += '<div class="section-title">🔍 나라별 상세 현황</div>';
  html += '<div style="overflow-x:auto;">';
  html += '<table class="data-table">';
  html += '<thead><tr><th style="text-align:left;">나라</th><th>🌾식량</th><th>💰금화</th><th>⚙️생산</th><th>🔬과학</th><th>🎨문화</th><th>⚔️군사</th><th>👥인구</th><th>🏗️건물</th><th>🧪기술</th></tr></thead>';
  html += '<tbody>';
  G.players.forEach(function(p) {
    html += '<tr>';
    html += '<td>' + p.emoji + ' ' + p.name + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + Math.floor(p.resources.food) + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + Math.floor(p.resources.gold) + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + Math.floor(p.resources.production) + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + Math.floor(p.resources.science) + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + Math.floor(p.resources.culture) + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + p.military + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + p.population + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + p.buildings.length + '</td>';
    html += '<td style="text-align:center;color:var(--gold);">' + p.techs.length + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  html += '<div style="text-align:center;">';
  if (turnsLeft === 0) {
    html += '<button class="btn btn-primary" onclick="G.phase=\'results\';render()" style="font-size:1.05em;padding:14px 40px;">🏆 최종 결과 보기</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="nextTurn()" style="font-size:1.05em;padding:14px 40px;">다음 턴으로 (' + (G.turn + 1) + '/' + G.maxTurns + ') →</button>';
  }
  html += '</div>';

  html += '</div></div>';
  return html;
}

/* ─── 최종 결과 화면 ─────────────────────────────── */
function renderResults() {
  var sorted = G.players.slice().sort(function(a,b){ return b.scores.total - a.scores.total; });
  var winner = sorted[0];
  var winnerCl = CLIMATES[winner.climate];

  /* 분야별 1등 */
  function topPlayer(field) {
    return G.players.slice().sort(function(a,b){ return b.scores[field] - a.scores[field]; })[0];
  }
  var catAwards = [
    { label:'💰 경제 강국', field:'econ',  p:topPlayer('econ') },
    { label:'⚔️ 군사 강국', field:'mil',   p:topPlayer('mil') },
    { label:'🔬 과학 강국', field:'sci',   p:topPlayer('sci') },
    { label:'🎨 문화 강국', field:'cult',  p:topPlayer('cult') },
    { label:'👥 인구 강국', field:'pop',   p:topPlayer('pop') }
  ];

  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:800px;width:100%;padding-bottom:30px;">';

  /* 승자 배너 */
  html += '<div class="winner-banner" style="margin-bottom:24px;">';
  html += '<div style="font-size:3em;margin-bottom:10px;">🏆</div>';
  html += '<div style="font-size:0.88em;color:var(--text2);margin-bottom:8px;">최종 승자</div>';
  html += '<div style="font-size:2.4em;margin-bottom:4px;">' + winner.emoji + '</div>';
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);" class="glow">' + winner.name + '</div>';
  html += '<div style="font-size:1em;color:' + winnerCl.color + ';margin-bottom:8px;">' + winnerCl.emoji + ' ' + winner.country + ' · ' + winnerCl.name + ' 기후</div>';
  html += '<div style="font-size:2.4em;font-weight:900;color:var(--gold);">' + winner.scores.total + ' 점</div>';
  html += '<div style="font-size:0.82em;color:var(--text2);margin-top:6px;">' + G.maxTurns + '턴 게임 완료</div>';
  html += '</div>';

  /* 최종 순위 */
  html += '<div style="margin-bottom:18px;">';
  sorted.forEach(function(p, idx) { html += rankRow(p, idx, true); });
  html += '</div>';

  /* 분야별 1등 */
  html += '<div class="panel" style="margin-bottom:18px;">';
  html += '<div class="section-title">🏅 분야별 1등</div>';
  html += '<div class="grid2" style="gap:8px;">';
  catAwards.forEach(function(aw) {
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:10px;display:flex;align-items:center;gap:8px;">';
    html += '<div>';
    html += '<div style="font-size:0.72em;color:var(--text2);">' + aw.label + '</div>';
    html += '<div style="font-weight:700;font-size:0.88em;">' + aw.p.emoji + ' ' + aw.p.name + '</div>';
    html += '<div style="font-size:0.8em;color:var(--gold);">' + aw.p.scores[aw.field] + '점</div>';
    html += '</div></div>';
  });
  html += '</div></div>';

  /* 최종 점수표 */
  html += '<div class="panel" style="margin-bottom:22px;">';
  html += '<div class="section-title">📊 최종 점수 분석</div>';
  html += '<div style="overflow-x:auto;">';
  html += '<table class="data-table">';
  html += '<thead><tr><th style="text-align:left;">순위</th><th style="text-align:left;">나라</th><th>💰경제</th><th>⚔️군사</th><th>🔬과학</th><th>🎨문화</th><th>👥인구</th><th>🤝외교</th><th style="color:var(--gold);">합계</th></tr></thead>';
  html += '<tbody>';
  var medals2 = ['🥇','🥈','🥉'];
  sorted.forEach(function(p, idx) {
    html += '<tr' + (idx === 0 ? ' style="background:rgba(240,192,64,0.05);"' : '') + '>';
    html += '<td>' + (medals2[idx] || (idx + 1) + '위') + '</td>';
    html += '<td>' + p.emoji + ' ' + p.name + '</td>';
    html += '<td style="text-align:center;">' + p.scores.econ + '</td>';
    html += '<td style="text-align:center;">' + p.scores.mil + '</td>';
    html += '<td style="text-align:center;">' + p.scores.sci + '</td>';
    html += '<td style="text-align:center;">' + p.scores.cult + '</td>';
    html += '<td style="text-align:center;">' + p.scores.pop + '</td>';
    html += '<td style="text-align:center;">' + p.scores.dip + '</td>';
    html += '<td style="text-align:center;font-weight:700;color:var(--gold);">' + p.scores.total + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';

  html += '<div style="display:flex;gap:12px;justify-content:center;">';
  html += '<button class="btn btn-primary" onclick="restartGame()">🔄 다시 하기</button>';
  html += '<button class="btn" onclick="goMenu()">🏠 메인 메뉴</button>';
  html += '</div>';

  html += '</div></div>';
  return html;
}
