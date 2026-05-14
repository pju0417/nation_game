/* =========================================================
   나라 경영 시뮬레이션 · screens.js
   화면 렌더링 함수 모음
   made by 박선생
========================================================= */

/* ─── 메인 메뉴 ──────────────────────────────────── */
function renderMenu() {
  var html = '';
  html += '<div class="screen anim" style="background:linear-gradient(180deg,#04060f,#08091a);">';
  html += '<div style="text-align:center;max-width:520px;width:100%;">';
  html += '<div style="font-size:3em;margin-bottom:10px;">🌍</div>';
  html += '<h1 class="glow" style="font-size:2.4em;font-weight:900;color:var(--gold);letter-spacing:2px;line-height:1.2;margin-bottom:6px;">나라 경영 시뮬레이션</h1>';
  html += '<p style="color:var(--text2);letter-spacing:1px;margin-bottom:6px;font-size:0.9em;">기후와 문명의 이야기</p>';
  html += '<p style="color:var(--text2);font-size:0.76em;margin-bottom:30px;">초등학교 6학년 사회 · 여러 가지 기후</p>';
  html += '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(240,192,64,0.18);border-radius:10px;padding:16px;margin-bottom:26px;font-size:0.84em;line-height:1.75;text-align:left;">';
  html += '<div style="color:var(--gold);font-weight:700;margin-bottom:6px;">🎮 게임 소개</div>';
  html += '세계 여러 <strong style="color:var(--gold);">기후 지역</strong>의 나라를 맡아 경영합니다.<br>';
  html += '건물·기술 연구·외교·무역을 통해 나라를 발전시키세요!<br>';
  html += '정해진 턴 안에 <strong style="color:var(--gold);">종합 국력 1위</strong>를 달성한 나라가 승리합니다.';
  html += '</div>';
  html += '<button class="menu-btn menu-primary" onclick="selectMode(\'solo\')">🌐 혼자 하기 (솔로 플레이)</button>';
  html += '<button class="menu-btn" onclick="selectMode(\'multi\')">👥 같이 하기 (한 기기 · 2~6인)</button>';
  html += '<button class="menu-btn" style="border-color:rgba(100,160,255,0.5);color:#80b8ff;background:rgba(100,160,255,0.06);" onclick="goOnline()">🌏 온라인 대전 (다른 기기 · 2~6인)</button>';
  html += '<button class="menu-btn" style="font-size:0.9em;border-color:rgba(240,192,64,0.2);" onclick="goHelp()">📖 도움말 · 게임 규칙</button>';
  html += '<div style="margin-top:28px;font-size:0.75em;color:var(--text2);">🌴 열대 · 🏜️ 건조 · 🌿 온대 · 🌲 냉대 · 🌾 계절풍 · ⛰️ 고산</div>';
  html += '</div></div>';
  return html;
}

/* ─── 도움말 ─────────────────────────────────────── */
function renderHelp() {
  var html = '';
  html += '<div class="screen anim" style="background:var(--bg);align-items:center;">';
  html += '<div style="max-width:760px;width:100%;">';
  html += '<div class="topbar" style="border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">📖 도움말</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button>';
  html += '</div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;max-height:82vh;overflow-y:auto;padding:20px;">';

  html += '<div class="section-title">🎯 승리 조건</div>';
  html += '<p style="font-size:0.85em;line-height:1.7;margin-bottom:16px;">정해진 턴 후 <strong style="color:var(--gold);">종합 국력 점수가 가장 높은 나라</strong>가 승리합니다.</p>';

  html += '<div class="section-title">📊 국력 점수</div>';
  html += '<div style="font-size:0.82em;line-height:1.95;margin-bottom:16px;">';
  html += '💰 <strong>경제력</strong>: 금화÷2 + 항구×10 + 시장×8<br>';
  html += '⚔️ <strong>군사력</strong>: 군사수치 × 2.5<br>';
  html += '🔬 <strong>과학력</strong>: 기술 수 × 10 + 과학÷3<br>';
  html += '🎨 <strong>문화력</strong>: 문화÷2 + 사원×8 + 극장×15<br>';
  html += '👥 <strong>인구력</strong>: 인구 × 6<br>';
  html += '🤝 <strong>외교력</strong>: 외교 보너스 + 동맹 수 × 5</div>';

  html += '<div class="section-title">🌿 기술 트리 (7분야 × 3단계)</div>';
  html += '<p style="font-size:0.82em;color:var(--text2);margin-bottom:8px;">20턴 기준 최대 5~7개만 연구 가능 — 전략적 선택 필수!</p>';
  html += '<div class="grid2" style="gap:6px;margin-bottom:16px;">';
  Object.keys(TECH_BRANCHES).forEach(function(k) {
    var br = TECH_BRANCHES[k];
    var bt = TECHS.filter(function(t){ return t.branch===k; });
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px;border-left:3px solid ' + br.color + ';">';
    html += '<div style="font-weight:700;margin-bottom:4px;">' + br.emoji + ' ' + br.name + ' 분야</div>';
    bt.forEach(function(t){
      html += '<div style="font-size:0.75em;color:var(--text2);">T' + t.tier + '. ' + t.name + ' (' + t.cost.science + '과학)</div>';
    });
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="section-title">🤝 외교·무역 시스템</div>';
  html += '<div style="font-size:0.82em;line-height:1.9;margin-bottom:16px;">';
  html += '🔄 <strong>자원 교역</strong>: 식량·금화 등 자원을 다른 나라와 교환<br>';
  html += '🤝 <strong>동맹 제안</strong>: 3턴간 이벤트 공유 + 외교 +10점 (금화 5 소비)<br>';
  html += '⚔️ <strong>군사 협력</strong>: 양측 군사력 +5 (금화 5 소비)</div>';

  html += '<div class="section-title">🌍 6대 기후</div>';
  html += '<div class="grid2" style="gap:8px;margin-bottom:20px;">';
  Object.values(CLIMATES).forEach(function(c){ html += climateRefBox(c); });
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
  var html = '';
  html += '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:16px;">';
  html += '<div style="max-width:860px;width:100%;margin-top:10px;">';
  html += '<div class="topbar" style="border-radius:8px 8px 0 0;">';
  html += '<span style="font-weight:700;color:var(--gold);">' + (G.mode==='solo'?'🌐 솔로 설정':'👥 멀티 설정') + '</span>';
  html += '<button class="btn btn-sm" onclick="goMenu()">← 뒤로</button>';
  html += '</div>';
  html += '<div class="panel" style="border-radius:0 0 8px 8px;max-height:88vh;overflow-y:auto;">';

  html += '<div class="grid3" style="margin-bottom:18px;">';
  html += '<div><div class="section-title">🎯 난이도</div><select onchange="G.diff=this.value">';
  html += '<option value="easy"'  +(G.diff==='easy'  ?' selected':'')+'>쉬움 🟢</option>';
  html += '<option value="normal"'+(G.diff==='normal'?' selected':'')+'>보통 🟡</option>';
  html += '<option value="hard"'  +(G.diff==='hard'  ?' selected':'')+'>어려움 🔴</option>';
  html += '</select></div>';
  html += '<div><div class="section-title">🔄 총 턴</div><select onchange="G.maxTurns=parseInt(this.value)">';
  html += '<option value="15"'+(G.maxTurns===15?' selected':'')+'>15턴 (단기)</option>';
  html += '<option value="20"'+(G.maxTurns===20?' selected':'')+'>20턴 (표준)</option>';
  html += '<option value="30"'+(G.maxTurns===30?' selected':'')+'>30턴 (장기)</option>';
  html += '</select></div>';
  html += '<div><div class="section-title">👤 인원</div><select onchange="updCount(parseInt(this.value))">';
  [2,3,4,5,6].forEach(function(n){
    html += '<option value="'+n+'"'+(G.pCount===n?' selected':'')+'>'+n+'명'+(G.mode==='solo'?' (AI '+(n-1)+'명)':'')+'</option>';
  });
  html += '</select></div></div>';

  html += '<div class="section-title">🌍 나라 선택</div>';
  G.pConfigs.forEach(function(cfg, i) {
    var cl = CLIMATES[cfg.climate];
    html += '<div class="panel-sm" style="margin-bottom:8px;border-color:'+cl.color+'33;">';
    html += '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;">';
    html += '<div style="font-size:2em;padding-top:4px;">'+cl.emoji+'</div>';
    html += '<div>';
    html += '<input type="text" value="'+cfg.name+'" onchange="updName('+i+',this.value)" placeholder="이름"'+(cfg.isAI?' disabled':'')+' style="margin-bottom:7px;">';
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
    html += '<select onchange="updClimate('+i+',this.value)" style="flex:1;min-width:110px;">';
    ckeys.forEach(function(k){
      html += '<option value="'+k+'"'+(cfg.climate===k?' selected':'')+'>'+CLIMATES[k].emoji+' '+CLIMATES[k].name+'</option>';
    });
    html += '</select>';
    if (G.mode==='solo'&&i>0) html += '<span class="badge-ai">AI</span>';
    else if (G.mode==='multi') html += '<label style="font-size:0.82em;cursor:pointer;display:flex;align-items:center;gap:4px;"><input type="checkbox"'+(cfg.isAI?' checked':'')+' onchange="setAI('+i+',this.checked)"> AI</label>';
    html += '</div></div>';
    html += '<div style="font-size:0.75em;min-width:130px;color:var(--text2);line-height:1.65;">';
    html += '<div style="color:'+cl.color+';font-weight:700;">'+cl.name+'</div>';
    html += '<div style="color:#80e890;">'+cl.perk+'</div>';
    html += '<div style="color:#f09090;">'+cl.weakness+'</div>';
    html += '<div>🌾'+cl.base.food+' ⚙️'+cl.base.production+' 💰'+cl.base.gold+' 🔬'+cl.base.science+' 🎨'+cl.base.culture+'</div>';
    html += '</div></div></div>';
  });

  html += '<div style="text-align:center;margin-top:18px;">';
  html += '<button class="btn btn-primary" onclick="startGame()" style="font-size:1.1em;padding:14px 40px;">⚔️ 게임 시작!</button>';
  html += '</div></div></div></div>';
  return html;
}

/* ─── 커버 화면 ──────────────────────────────────── */
function renderCover() {
  var p  = G.players[G.curPlayer];
  var cl = CLIMATES[p.climate];
  var html = '';
  html += '<div class="cover anim" style="background:'+cl.bg+';">';
  html += '<div style="text-align:center;">';
  html += '<div style="font-size:4em;margin-bottom:12px;">'+p.emoji+'</div>';
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);margin-bottom:6px;">'+p.name+'</div>';
  html += '<div style="font-size:1.15em;color:'+cl.color+';margin-bottom:4px;">'+cl.emoji+' '+p.country+'</div>';
  html += '<div style="font-size:0.85em;color:var(--text2);margin-bottom:36px;">'+cl.name+' 기후 문명</div>';

  /* 수신된 제안 알림 */
  var myTrades = (G.pendingTrades||[]).filter(function(t){ return t.toId===p.id && t.status==='pending'; });
  var myDiplos = (G.pendingDiplo||[]).filter(function(d){ return d.toId===p.id && d.status==='pending'; });
  var totalPending = myTrades.length + myDiplos.length;
  if (totalPending > 0) {
    html += '<div style="background:rgba(80,208,192,0.12);border:1px solid rgba(80,208,192,0.4);border-radius:8px;padding:10px 18px;margin-bottom:16px;max-width:380px;">';
    html += '<div style="color:#50d0c0;font-weight:700;font-size:0.9em;">📬 새로운 제안 ' + totalPending + '건이 있습니다!</div>';
    html += '<div style="color:var(--text2);font-size:0.78em;margin-top:3px;">외교 탭에서 확인하세요</div>';
    html += '</div>';
  }

  html += '<div style="background:rgba(0,0,0,0.5);border:1px solid rgba(240,192,64,0.3);border-radius:10px;padding:20px;margin-bottom:28px;max-width:380px;">';
  html += '<div style="font-size:0.78em;color:var(--gold);font-weight:700;margin-bottom:10px;">턴 '+G.turn+' / '+G.maxTurns+' · 종합 국력</div>';
  html += '<div style="font-size:2.2em;font-weight:900;color:var(--gold);">'+p.scores.total+' 점</div>';
  html += '<div style="margin-top:10px;">'+rbar(p.resources,true)+'</div>';
  html += '<div style="font-size:0.8em;color:var(--text2);margin-top:8px;">⚔️ '+p.military+' · 👥 '+p.population;
  if (p.allies && p.allies.length > 0) html += ' · 🤝 동맹 '+p.allies.length+'국';
  html += '</div></div>';

  html += '<div style="color:var(--text2);font-size:0.84em;margin-bottom:20px;">다른 플레이어는 화면을 보지 마세요 👀</div>';
  html += '<button class="btn btn-primary" onclick="startTurn()" style="font-size:1.1em;padding:14px 40px;">내 차례 시작하기 ▶</button>';
  html += '</div></div>';
  return html;
}

/* ─── 플레이어 턴 메인 ───────────────────────────── */
function renderPlayerTurn() {
  var p = G.players[G.curPlayer];
  var cl = CLIMATES[p.climate];
  var gain = totalGain(p);
  var gainWithPolicy = applyPolicy(Object.assign({}, gain), G.selPolicy);

  calcScore(p);

  var selBuildDef = G.selBuild
    ? BUILDINGS.find(function(x) { return x.id === G.selBuild; })
    : null;

  var selTechDef = G.selTech
    ? TECHS.find(function(x) { return x.id === G.selTech; })
    : null;

  var selPolicyDef = G.selPolicy
    ? POLICIES.find(function(x) { return x.id === G.selPolicy; })
    : null;

  var sortedPlayers = G.players.slice().sort(function(a, b) {
    return b.scores.total - a.scores.total;
  });

  var myTrades = (G.pendingTrades || []).filter(function(t) {
    return t.toId === p.id && t.status === 'pending';
  });

  var myDiplos = (G.pendingDiplo || []).filter(function(d) {
    return d.toId === p.id && d.status === 'pending';
  });

  var pendingCount = myTrades.length + myDiplos.length;

  var html = '';

  html += '<div class="game-screen-map-layout" style="background:var(--bg);min-height:100vh;">';

  /* 상단 바 */
  html += '<div class="topbar">';
  html += '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<span style="font-size:1.4em;">' + p.emoji + '</span>';
  html += '<div>';
  html += '<div style="font-weight:700;">' + p.name + ' <span style="color:' + cl.color + ';font-size:0.85em;">' + cl.emoji + ' ' + p.country + '</span></div>';
  html += '<div style="font-size:0.74em;color:var(--text2);">⚔️' + p.military + ' · 👥' + p.population + (p.allies && p.allies.length ? ' · 🤝동맹' + p.allies.length : '') + '</div>';
  html += '</div>';
  html += '</div>';

  html += '<div style="text-align:center;">';
  html += '<div class="turn-num">턴 ' + G.turn + ' / ' + G.maxTurns + '</div>';
  html += '<div style="font-size:0.7em;color:var(--text2);">남은 ' + (G.maxTurns - G.turn) + '턴</div>';
  html += '</div>';

  html += '<div style="text-align:right;">';
  html += '<div style="font-size:0.7em;color:var(--text2);">종합 국력</div>';
  html += '<div class="turn-num">' + p.scores.total + '</div>';
  html += '</div>';
  html += '</div>';

  /*
    새 배치:
    왼쪽: 현재 국가 정보
    가운데: 지도
    오른쪽: 선택창
  */
  html += '<div class="map-play-grid">';

  /* 왼쪽 정보 패널 */
  html += '<div class="map-side-col map-info-col">';

  html += '<div class="panel">';
  html += '<div class="section-title">📦 보유 자원</div>';

  ['food', 'production', 'gold', 'science', 'culture'].forEach(function(k) {
    html += resPreviewRow(k, p.resources[k], gainWithPolicy[k]);
  });

  html += '</div>';

  html += '<div class="panel" style="border-color:' + cl.color + '44;">';
  html += '<div class="section-title">' + cl.emoji + ' ' + cl.name + ' 기후</div>';
  html += '<div style="font-size:0.78em;color:var(--text2);margin-bottom:4px;">' + cl.desc + '</div>';
  html += '<div style="font-size:0.77em;color:#80e890;">' + cl.perk + '</div>';
  html += '<div style="font-size:0.77em;color:#f09090;">' + cl.weakness + '</div>';
  html += '</div>';

  var bc = buildCount(p);

  html += '<div class="panel">';
  html += '<div class="section-title">🏗️ 건물 (' + p.buildings.length + ')</div>';

  if (p.buildings.length === 0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  } else {
    var bShown = {};

    p.buildings.forEach(function(id) {
      if (!bShown[id]) {
        bShown[id] = true;

        var b = BUILDINGS.find(function(x) {
          return x.id === id;
        });

        if (b) {
          html += '<div style="font-size:0.82em;padding:2px 0;">' + b.emoji + ' ' + b.name + (bc[id] > 1 ? ' x' + bc[id] : '') + '</div>';
        }
      }
    });
  }

  html += '</div>';

  html += '<div class="panel">';
  html += '<div class="section-title">🔬 기술 (' + p.techs.length + ')</div>';

  if (p.techs.length === 0) {
    html += '<div style="color:var(--text2);font-size:0.82em;">아직 없음</div>';
  } else {
    p.techs.forEach(function(id) {
      var t = TECHS.find(function(x) {
        return x.id === id;
      });

      if (t) {
        html += '<div style="font-size:0.82em;padding:2px 0;">' + t.emoji + ' ' + t.name + '</div>';
      }
    });
  }

  html += '</div>';

  html += '</div>';

  /* 가운데 지도 */
  html += '<div class="map-center-col">';
  html += '<div id="worldMapButtonHost"></div>';
  html += '</div>';

  /* 오른쪽 선택 패널 */
  html += '<div class="map-side-col map-action-col">';

  html += '<div class="panel" style="padding:0;overflow:hidden;">';

  html += '<div class="tabs" style="padding:0 8px;overflow-x:auto;white-space:nowrap;">';
  html += '<div class="tab' + (G.tab === 'build' ? ' active' : '') + '" onclick="tabBuild()">🏗️ 건설</div>';
  html += '<div class="tab' + (G.tab === 'research' ? ' active' : '') + '" onclick="tabResearch()">🔬 연구</div>';
  html += '<div class="tab' + (G.tab === 'policy' ? ' active' : '') + '" onclick="tabPolicy()">📜 정책</div>';

  html += '<div class="tab' + (G.tab === 'diplo' ? ' active' : '') + '" onclick="tabDiplo()">';
  html += '🤝 외교' + (pendingCount > 0 ? '<span style="background:#e05050;color:#fff;border-radius:10px;padding:1px 5px;font-size:0.65em;margin-left:4px;">' + pendingCount + '</span>' : '');
  html += '</div>';

  html += '<div class="tab' + (G.tab === 'scores' ? ' active' : '') + '" onclick="tabScores()">📊 국력</div>';
  html += '</div>';

  html += '<div style="padding:12px;">';

  if (G.tab === 'build') html += renderBuildTab(p);
  if (G.tab === 'research') html += renderResearchTab(p);
  if (G.tab === 'policy') html += renderPolicyTab();
  if (G.tab === 'diplo') html += renderDiploTab(p);
  if (G.tab === 'scores') html += renderScoresTab(p);

  html += '</div>';
  html += '</div>';

  /* 결정 요약 */
  html += '<div class="panel" style="background:rgba(240,192,64,0.04);border-color:rgba(240,192,64,0.28);">';
  html += '<div class="section-title">✅ 이번 턴 결정</div>';

  html += '<div class="decision-grid">';

  html += '<div class="decision-box">';
  html += '<div class="decision-label">건설</div>';
  html += '<div class="decision-value" style="color:' + (selBuildDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selBuildDef ? selBuildDef.emoji + ' ' + selBuildDef.name : '선택 안 함';
  html += '</div>';
  html += '</div>';

  html += '<div class="decision-box">';
  html += '<div class="decision-label">연구</div>';
  html += '<div class="decision-value" style="color:' + (selTechDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selTechDef ? selTechDef.emoji + ' ' + selTechDef.name : '선택 안 함';
  html += '</div>';
  html += '</div>';

  html += '<div class="decision-box">';
  html += '<div class="decision-label">정책</div>';
  html += '<div class="decision-value" style="color:' + (selPolicyDef ? 'var(--gold)' : 'var(--text2)') + ';">';
  html += selPolicyDef ? selPolicyDef.emoji + ' ' + selPolicyDef.name : '선택 안 함';
  html += '</div>';
  html += '</div>';

  html += '</div>';

  html += '<button class="btn btn-primary btn-block" onclick="submitTurn()">턴 종료 →</button>';
  html += '</div>';

  /* 순위 정보는 오른쪽 하단으로 이동 */
  html += '<div class="panel">';
  html += '<div class="section-title">🏆 현재 순위</div>';

  sortedPlayers.forEach(function(sp, idx) {
    var isSelf = sp.id === p.id;
    var cl2 = CLIMATES[sp.climate];
    var rankColor = idx === 0 ? '#f0c040' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#c08040' : 'var(--text2)';

    html += '<div style="display:flex;align-items:center;gap:7px;padding:5px;border-bottom:1px solid rgba(255,255,255,0.05);' + (isSelf ? 'background:rgba(240,192,64,0.06);border-radius:5px;' : '') + '">';
    html += '<span style="font-weight:900;width:22px;text-align:center;color:' + rankColor + ';">' + (idx + 1) + '</span>';
    html += '<span>' + sp.emoji + '</span>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:0.82em;font-weight:' + (isSelf ? 700 : 400) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sp.name + '</div>';
    html += '<div style="font-size:0.72em;color:' + cl2.color + ';">' + cl2.emoji + ' ' + sp.country + '</div>';
    html += '</div>';
    html += '<span style="font-weight:700;color:var(--gold);font-size:0.9em;">' + sp.scores.total + '</span>';
    html += '</div>';
  });

  html += '</div>';

  html += '</div>';

  html += '</div>';
  html += '</div>';

  return html;
}

/* ─── 건설 탭 ────────────────────────────────────── */
function renderBuildTab(p) {
  var bc   = buildCount(p);
  var html = '<div style="font-size:0.82em;color:var(--text2);margin-bottom:8px;">건물을 선택하면 이번 턴 건설합니다. 12개 중 최대 8개만 건설 가능!</div>';
  html += '<div class="scrollable" style="max-height:300px;">';

  /* 분야별 그룹핑 */
  var cats = ['food','production','commerce','science','culture','military'];
  var catNames = { food:'🌾 식량', production:'⚙️ 생산', commerce:'💰 상업', science:'🔬 과학', culture:'🎨 문화', military:'⚔️ 군사' };
  cats.forEach(function(cat) {
    var blist = BUILDINGS.filter(function(b){ return b.cat===cat; });
    html += '<div style="font-size:0.72em;color:var(--text2);margin:8px 0 4px;letter-spacing:1px;font-weight:700;">'+catNames[cat]+'</div>';
    blist.forEach(function(b) {
      var count    = bc[b.id]||0;
      var maxed    = count>=b.max;
      var needsReq = b.req && p.buildings.indexOf(b.req)===-1;
      var afford   = canAffordBuilding(p,b);
      var disabled = maxed||needsReq||!afford;
      var selected = G.selBuild===b.id;
      html += '<div class="card'+(selected?' selected':'')+(disabled?' disabled':'')+'"';
      if (!disabled) html += ' onclick="selBuild(\''+b.id+'\')"';
      html += ' style="margin-bottom:6px;padding:8px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="font-size:1.2em;">'+b.emoji+'</span>';
      html += '<div style="flex:1;">';
      html += '<div style="font-weight:700;font-size:0.88em;">'+b.name;
      html += ' <span style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-size:0.8em;">T'+b.tier+'</span>';
      if (count>0) html += ' <span style="color:var(--text2);font-size:0.8em;">('+count+'/'+b.max+')</span>';
      html += '</div>';
      html += '<div style="font-size:0.76em;color:#80c080;">'+b.desc+'</div>';
      if (needsReq) { var r=BUILDINGS.find(function(x){return x.id===b.req;}); html+='<div style="font-size:0.72em;color:#f09090;">⚠️ 선행: '+(r?r.name:b.req)+'</div>'; }
      html += '</div>';
      html += '<div style="text-align:right;">'+costHtml(b.cost,p.resources)+'</div>';
      html += '</div>';
      if (maxed) html += '<div style="color:#f09090;font-size:0.72em;margin-top:3px;">최대 보유</div>';
      else if (!afford&&!needsReq) html += '<div style="color:#f09090;font-size:0.72em;margin-top:3px;">자원 부족</div>';
      else if (selected) html += '<div style="color:var(--gold);font-size:0.72em;margin-top:3px;">✓ 선택됨</div>';
      html += '</div>';
    });
  });
  /* ★ 기후 고유 건물 섹션 */
  if (typeof UNIQUE_BUILDINGS !== 'undefined') {
    var myUnique = UNIQUE_BUILDINGS.filter(function(b){ return b.climate === p.climate; });
    if (myUnique.length > 0) {
      var cl = CLIMATES[p.climate];
      html += '<div style="font-size:0.72em;color:' + cl.color + ';margin:8px 0 4px;letter-spacing:1px;font-weight:700;">✨ ' + cl.emoji + ' ' + cl.name + ' 고유 건물</div>';
      myUnique.forEach(function(b) {
        var count    = bc[b.id] || 0;
        var maxed    = count >= (b.max || 1);
        var afford   = canAffordBuilding(p, b);
        var disabled = maxed || !afford;
        var selected = G.selBuild === b.id;
        html += '<div class="card' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '"';
        if (!disabled) html += " onclick=\"selBuild('" + b.id + "')\"";
        html += ' style="margin-bottom:6px;padding:8px;border-color:' + cl.color + '33;">';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="font-size:1.2em;">' + b.emoji + '</span>';
        html += '<div style="flex:1;">';
        html += '<div style="font-weight:700;font-size:0.88em;">' + b.name;
        html += ' <span style="background:' + cl.color + '33;color:' + cl.color + ';padding:1px 5px;border-radius:3px;font-size:0.8em;">고유</span>';
        html += '</div>';
        html += '<div style="font-size:0.76em;color:#80c080;">' + b.desc + '</div>';
        if (b.lore) html += '<div style="font-size:0.70em;color:var(--text2);font-style:italic;margin-top:1px;">' + b.lore + '</div>';
        html += '</div>';
        html += '<div style="text-align:right;">' + costHtml(b.cost, p.resources) + '</div>';
        html += '</div>';
        if (maxed) html += '<div style="color:#f09090;font-size:0.72em;margin-top:3px;">이미 건설됨</div>';
        else if (!afford) html += '<div style="color:#f09090;font-size:0.72em;margin-top:3px;">자원 부족</div>';
        else if (selected) html += '<div style="color:var(--gold);font-size:0.72em;margin-top:3px;">✓ 선택됨</div>';
        html += '</div>';
      });
    }
  }
  html += '</div>';
  return html;
}

/* ─── 연구 탭 (분야별 트리 표시) ─────────────────── */
function renderResearchTab(p) {
  var html = '<div style="font-size:0.82em;color:var(--text2);margin-bottom:8px;">7개 분야 · 각 분야 T1→T2→T3 순서로 연구. 20턴에 최대 5~7개!</div>';
  html += '<div class="scrollable" style="max-height:310px;">';

  Object.keys(TECH_BRANCHES).forEach(function(brKey) {
    var br = TECH_BRANCHES[brKey];
    var bTechs = TECHS.filter(function(t){ return t.branch===brKey; });
    var cl2 = CLIMATES[p.climate];
    var isMySpecialty = cl2.specialty === brKey;
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-size:0.75em;font-weight:700;color:'+br.color+';margin-bottom:5px;letter-spacing:1px;">'+br.emoji+' '+br.name+' 분야';
    if (isMySpecialty) html += ' <span style="background:'+br.color+'33;color:'+br.color+';padding:1px 6px;border-radius:3px;font-size:0.85em;">★ 전문 분야 (비용 25% 할인)</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:4px;align-items:flex-start;">';
    bTechs.forEach(function(t, ti) {
      var researched = p.techs.indexOf(t.id)!==-1;
      var needsReq   = t.req && p.techs.indexOf(t.req)===-1;
      var afford     = canAffordTech(p,t);
      var disabled   = researched||needsReq||!afford;
      var selected   = G.selTech===t.id;

      if (ti>0) html += '<div style="align-self:center;color:var(--text2);font-size:0.8em;">→</div>';

      html += '<div class="card'+(researched?' selected':'')+((!researched&&disabled)?' disabled':'')+((!researched&&!disabled&&selected)?' selected':'')+'"';
      if (!disabled&&!researched) html += ' onclick="selTech(\''+t.id+'\')"';
      html += ' style="flex:1;padding:7px;min-width:80px;">';
      html += '<div style="font-size:1.2em;margin-bottom:3px;">'+t.emoji+'</div>';
      html += '<div style="font-weight:700;font-size:0.75em;">'+t.name+'</div>';
      html += '<div style="font-size:0.7em;color:var(--text2);">'+t.desc+'</div>';
      var discountedCost = (isMySpecialty && t.branch === brKey) ? Math.floor(t.cost.science * 0.75) : t.cost.science;
      var displayCostColor = (afford||researched) ? br.color : '#f09090';
      html += '<div style="font-size:0.68em;margin-top:3px;color:'+displayCostColor+'">';
      if (researched) {
        html += '✓ 완료';
      } else if (isMySpecialty) {
        html += '🔬<span style="text-decoration:line-through;opacity:0.5;">'+t.cost.science+'</span> '+discountedCost;
      } else {
        html += '🔬'+t.cost.science;
      }
      html += '</div>';
      if (needsReq&&!researched) html += '<div style="font-size:0.65em;color:#f09090;margin-top:2px;">T'+(t.tier-1)+' 필요</div>';
      html += '</div>';
    });
    html += '</div></div>';
  });

  html += '</div>';
  return html;
}

/* ─── 정책 탭 ────────────────────────────────────── */
function renderPolicyTab() {
  var html = '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">이번 턴 국가 정책을 1개 선택하세요.</div>';
  html += '<div class="grid2" style="gap:8px;">';
  POLICIES.forEach(function(pol) {
    var selected = G.selPolicy===pol.id;
    html += '<div class="card'+(selected?' selected':'')+'" onclick="selPolicy(\''+pol.id+'\')"';
    html += ' style="border-color:'+(selected?pol.color:'rgba(255,255,255,0.08)')+';padding:10px;">';
    html += '<div style="font-size:1.5em;margin-bottom:4px;">'+pol.emoji+'</div>';
    html += '<div style="font-weight:700;font-size:0.83em;">'+pol.name+'</div>';
    html += '<div style="font-size:0.73em;color:var(--text2);margin-top:3px;">'+pol.desc+'</div>';
    if (selected) html += '<div style="color:'+pol.color+';font-size:0.74em;margin-top:4px;font-weight:700;">✓ 선택됨</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ─── 외교 탭 ────────────────────────────────────── */
function renderDiploTab(p) {
  var others   = G.players.filter(function(x){ return x.id!==p.id; });
  var myTrades = (G.pendingTrades||[]).filter(function(t){ return t.toId===p.id&&t.status==='pending'; });
  var myDiplos = (G.pendingDiplo||[]).filter(function(d){ return d.toId===p.id&&d.status==='pending'; });
  var html     = '';

  /* 동맹 현황 */
  if (p.allies && p.allies.length > 0) {
    html += '<div style="background:rgba(80,208,192,0.08);border:1px solid rgba(80,208,192,0.3);border-radius:7px;padding:10px;margin-bottom:10px;">';
    html += '<div style="font-weight:700;color:#50d0c0;font-size:0.85em;margin-bottom:5px;">🤝 현재 동맹국</div>';
    p.allies.forEach(function(a) {
      var ally = G.players.find(function(x){ return x.id===a.partnerId; });
      if (ally) {
        html += '<div style="display:flex;align-items:center;justify-content:space-between;font-size:0.82em;padding:3px 0;">';
        html += '<span>'+ally.emoji+' '+ally.name+'</span>';
        html += '<span style="color:#50d0c0;">남은 '+a.turnsLeft+'턴</span>';
        html += '</div>';
      }
    });
    html += '</div>';
  }

  /* 받은 제안 처리 */
  if (myTrades.length>0 || myDiplos.length>0) {
    html += '<div style="background:rgba(240,192,64,0.07);border:1px solid rgba(240,192,64,0.25);border-radius:7px;padding:10px;margin-bottom:10px;">';
    html += '<div style="font-weight:700;color:var(--gold);font-size:0.85em;margin-bottom:6px;">📬 받은 제안</div>';
    myTrades.forEach(function(t) {
      var from = G.players.find(function(x){ return x.id===t.fromId; });
      html += '<div style="background:rgba(0,0,0,0.2);border-radius:5px;padding:7px;margin-bottom:6px;font-size:0.82em;">';
      html += '<div>'+( from?from.emoji+' '+from.name:'?')+'의 교역 제안</div>';
      html += '<div style="color:var(--text2);margin:2px 0;">'+(R_EMOJI[t.give.res]||'')+' '+t.give.amt+' '+R_NAME[t.give.res]+' 줌 ↔ '+(R_EMOJI[t.receive.res]||'')+' '+t.receive.amt+' '+R_NAME[t.receive.res]+' 받음</div>';
      html += '<div style="display:flex;gap:6px;margin-top:5px;">';
      html += '<button class="btn btn-sm" style="background:rgba(80,208,80,0.12);border-color:#50d050;color:#80e880;" onclick="acceptTrade(\''+t.id+'\')">✓ 수락</button>';
      html += '<button class="btn btn-sm" style="background:rgba(208,80,80,0.1);border-color:#d05050;color:#f09090;" onclick="declineTrade(\''+t.id+'\')">✕ 거절</button>';
      html += '</div></div>';
    });
    myDiplos.forEach(function(d) {
      var from = G.players.find(function(x){ return x.id===d.fromId; });
      var dType = d.type==='alliance'?'동맹 제안':'군사 협력';
      var dDesc = d.type==='alliance'?'3턴 동맹 (금화 5 소비, 외교 +10)':'군사 협력 (금화 5 소비, 군사 +5)';
      html += '<div style="background:rgba(0,0,0,0.2);border-radius:5px;padding:7px;margin-bottom:6px;font-size:0.82em;">';
      html += '<div>'+(from?from.emoji+' '+from.name:'?')+'의 '+dType+'</div>';
      html += '<div style="color:var(--text2);margin:2px 0;">'+dDesc+'</div>';
      html += '<div style="display:flex;gap:6px;margin-top:5px;">';
      html += '<button class="btn btn-sm" style="background:rgba(80,208,80,0.12);border-color:#50d050;color:#80e880;" onclick="acceptDiplo(\''+d.id+'\')">✓ 수락</button>';
      html += '<button class="btn btn-sm" style="background:rgba(208,80,80,0.1);border-color:#d05050;color:#f09090;" onclick="declineDiplo(\''+d.id+'\')">✕ 거절</button>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  /* 새 제안 보내기 */
  if (others.length === 0) {
    html += '<div style="color:var(--text2);font-size:0.85em;">다른 플레이어가 없습니다.</div>';
    return html;
  }

  html += '<div class="section-title">📤 제안 보내기</div>';
  /* 대상 선택 */
  html += '<div style="margin-bottom:8px;font-size:0.82em;color:var(--text2);">대상 나라</div>';
  html += '<select id="diploTarget" style="width:100%;margin-bottom:10px;">';
  others.forEach(function(op){ html += '<option value="'+op.id+'">'+op.emoji+' '+op.name+'</option>'; });
  html += '</select>';

  /* 무역 섹션 */
  html += '<div style="background:rgba(240,192,64,0.06);border:1px solid rgba(240,192,64,0.2);border-radius:6px;padding:10px;margin-bottom:8px;">';
  html += '<div style="font-weight:700;font-size:0.85em;margin-bottom:8px;">🔄 자원 교역</div>';
  html += '<div class="grid2" style="gap:8px;">';
  /* 줄 자원 */
  html += '<div><div style="font-size:0.78em;color:var(--text2);margin-bottom:4px;">내가 줄 자원</div>';
  html += '<select id="tradeGiveRes" style="width:100%;margin-bottom:4px;">';
  TRADE_RESOURCES.forEach(function(r){ html += '<option value="'+r+'">'+R_EMOJI[r]+' '+R_NAME[r]+'</option>'; });
  html += '</select>';
  html += '<input type="number" id="tradeGiveAmt" min="1" max="20" value="3" style="width:100%;padding:6px;">';
  html += '</div>';
  /* 받을 자원 */
  html += '<div><div style="font-size:0.78em;color:var(--text2);margin-bottom:4px;">받을 자원</div>';
  html += '<select id="tradeRecvRes" style="width:100%;margin-bottom:4px;">';
  TRADE_RESOURCES.forEach(function(r){ html += '<option value="'+r+'">'+R_EMOJI[r]+' '+R_NAME[r]+'</option>'; });
  html += '</select>';
  html += '<input type="number" id="tradeRecvAmt" min="1" max="20" value="3" style="width:100%;padding:6px;">';
  html += '</div></div>';
  html += '<button class="btn btn-sm btn-block" style="margin-top:8px;" onclick="sendTrade()">교역 제안 보내기</button>';
  html += '</div>';

  /* 동맹/군사 */
  html += '<div class="grid2" style="gap:8px;">';
  html += '<div style="background:rgba(80,208,192,0.07);border:1px solid rgba(80,208,192,0.25);border-radius:6px;padding:10px;">';
  html += '<div style="font-weight:700;font-size:0.83em;margin-bottom:4px;">🤝 동맹 제안</div>';
  html += '<div style="font-size:0.75em;color:var(--text2);margin-bottom:6px;">3턴 동맹 · 이벤트 공유 · 외교 +10 (금화 5 소비)</div>';
  html += '<button class="btn btn-sm btn-block" style="border-color:#50d0c0;color:#50d0c0;" onclick="sendDiplo(\'alliance\')"'+((p.resources.gold||0)<5?' disabled style="opacity:0.4;"':'')+'>';
  html += (p.resources.gold>=5?'동맹 제안':'금화 부족 (5 필요)')+'</button>';
  html += '</div>';
  html += '<div style="background:rgba(224,80,80,0.07);border:1px solid rgba(224,80,80,0.25);border-radius:6px;padding:10px;">';
  html += '<div style="font-weight:700;font-size:0.83em;margin-bottom:4px;">⚔️ 군사 협력</div>';
  html += '<div style="font-size:0.75em;color:var(--text2);margin-bottom:6px;">양측 군사력 +5 (금화 5 소비)</div>';
  html += '<button class="btn btn-sm btn-block" style="border-color:#e05050;color:#e09090;" onclick="sendDiplo(\'mil_pact\')"'+((p.resources.gold||0)<5?' disabled style="opacity:0.4;"':'')+'>';
  html += (p.resources.gold>=5?'군사 협력 제안':'금화 부족 (5 필요)')+'</button>';
  html += '</div></div>';

  return html;
}

/* ─── 국력 탭 ────────────────────────────────────── */
function renderScoresTab(p) {
  var s     = p.scores;
  var items = [
    { label:'💰 경제력', val:s.econ, desc:'금화 + 상업 건물' },
    { label:'⚔️ 군사력', val:s.mil,  desc:'군사 수치 × 2.5' },
    { label:'🔬 과학력', val:s.sci,  desc:'기술 수 × 10 + 과학÷3' },
    { label:'🎨 문화력', val:s.cult, desc:'문화 + 문화 건물' },
    { label:'👥 인구력', val:s.pop,  desc:'인구 × 6' },
    { label:'🤝 외교력', val:s.dip,  desc:'외교 보너스 + 동맹 수×5' }
  ];
  var maxVal = Math.max.apply(null, items.map(function(x){ return x.val; }).concat([1]));

  var html = '<div style="font-size:0.82em;color:var(--text2);margin-bottom:10px;">'+p.name+'의 분야별 국력 점수</div>';
  items.forEach(function(item){ html += scoreBar(item.label+' <span style="color:var(--text2);font-size:0.72em;">'+item.desc+'</span>', item.val, maxVal); });
  html += '<div style="border-top:1px solid var(--border);padding-top:9px;margin-top:6px;display:flex;justify-content:space-between;align-items:center;">';
  html += '<span style="font-weight:700;">🏆 종합 국력</span>';
  html += '<span style="font-size:1.3em;font-weight:900;color:var(--gold);">'+s.total+'</span>';
  html += '</div>';
  return html;
}

/* ─── 이벤트 화면 ────────────────────────────────── */
function renderEvents() {
  var html = '<div class="screen anim" style="background:var(--bg);">';
  html += '<div style="max-width:800px;width:100%;">';
  html += '<div style="text-align:center;margin-bottom:18px;"><div style="font-size:2em;">📰</div>';
  html += '<h2 style="color:var(--gold);">턴 '+G.turn+' 이벤트</h2></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:18px;">';
  G.turnLog.forEach(function(log) {
    var p  = G.players.find(function(x){ return x.id===log.pid; });
    var cl = CLIMATES[log.climate];
    var ev = log.ev;
    html += '<div class="ev-card '+(ev?ev.type:'neutral')+'" style="border-color:'+p.color+'44;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    html += '<span style="font-size:1.1em;">'+p.emoji+'</span>';
    html += '<div><div style="font-weight:700;font-size:0.88em;">'+log.pname+'</div>';
    html += '<div style="font-size:0.73em;color:'+cl.color+';">'+cl.emoji+' '+log.country+'</div></div></div>';
    if (ev) {
      html += '<div style="font-size:2em;margin-bottom:5px;">'+ev.emoji+'</div>';
      html += '<div style="font-weight:700;margin-bottom:3px;">'+ev.name+'</div>';
      html += '<div style="font-size:0.8em;color:var(--text2);margin-bottom:7px;">'+ev.desc+'</div>';
      html += '<span class="badge '+(ev.type==='good'?'badge-good':'badge-bad')+'">'+log.fx+'</span>';
    } else {
      html += '<div style="color:var(--text2);font-size:0.85em;padding:8px 0;">평온한 턴 😌</div>';
    }
    /* 무역 로그 */
    if (p.tradeLog && p.tradeLog.length>0) {
      html += '<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);font-size:0.75em;color:#80d0c0;">';
      p.tradeLog.forEach(function(tl){ html += '🔄 '+tl.with+'와 교역 완료<br>'; });
      html += '</div>';
    }
    html += '<div style="margin-top:8px;font-size:0.72em;color:var(--text2);">';
    var parts=[]; Object.keys(log.gain).forEach(function(k){ parts.push((R_EMOJI[k]||'')+'+'+log.gain[k]); });
    html += parts.join(' ');
    html += '</div></div>';
  });
  html += '</div>';
  html += '<div style="text-align:center;">';
  html += '<button class="btn btn-primary" onclick="goSummary()">📊 결과 보기 →</button>';
  html += '</div></div></div>';
  return html;
}

/* ─── 턴 요약 ────────────────────────────────────── */
function renderSummary() {
  var sorted    = G.players.slice().sort(function(a,b){ return b.scores.total-a.scores.total; });
  var turnsLeft = G.maxTurns-G.turn;
  var html      = '';
  html += '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:16px;">';
  html += '<div style="max-width:900px;width:100%;padding-bottom:30px;">';
  html += '<div style="text-align:center;margin-bottom:16px;">';
  html += '<h2 style="color:var(--gold);">턴 '+G.turn+' 종료 · 국력 순위</h2>';
  html += '<p style="color:var(--text2);font-size:0.84em;">남은 턴: '+turnsLeft+'턴'+(turnsLeft===0?' · 게임 종료!':'')+'</p></div>';

  /* 세계지도 */
  html += '<canvas id="worldMap" width="760" height="380" style="width:100%;border-radius:8px;border:1px solid rgba(240,192,64,0.18);display:block;margin-bottom:14px;"></canvas>';

  html += '<div style="margin-bottom:14px;">';
  sorted.forEach(function(p,idx){ html+=rankRow(p,idx,true); });
  html += '</div>';

  html += '<div class="panel" style="margin-bottom:14px;">';
  html += '<div class="section-title">📈 국력 비교</div>';
  var maxT = sorted[0]?sorted[0].scores.total:1;
  sorted.forEach(function(p){
    var pct = Math.min(100,maxT>0?(p.scores.total/maxT)*100:0);
    html += '<div style="margin-bottom:6px;">';
    html += '<div style="display:flex;justify-content:space-between;font-size:0.82em;margin-bottom:2px;">';
    html += '<span>'+p.emoji+' '+p.name+'</span><span style="color:var(--gold);font-weight:700;">'+p.scores.total+'</span></div>';
    html += '<div class="progress-track"><div class="progress-fill" style="width:'+pct+'%;background:'+p.color+';opacity:0.8;"></div></div>';
    html += '</div>';
  });
  html += '</div>';

  html += '<div style="text-align:center;">';
  if (turnsLeft===0) {
    html += '<button class="btn btn-primary" onclick="goResults()" style="font-size:1.05em;padding:14px 40px;">🏆 최종 결과 보기</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="nextTurn()" style="font-size:1.05em;padding:14px 40px;">다음 턴 ('+(G.turn+1)+'/'+G.maxTurns+') →</button>';
  }
  html += '</div></div></div>';
  return html;
}

/* ─── 최종 결과 ──────────────────────────────────── */
function renderResults() {
  var sorted   = G.players.slice().sort(function(a,b){ return b.scores.total-a.scores.total; });
  var winner   = sorted[0];
  var winnerCl = CLIMATES[winner.climate];

  function topP(f){ return G.players.slice().sort(function(a,b){ return b.scores[f]-a.scores[f]; })[0]; }
  var awards = [
    {label:'💰 경제 강국',field:'econ',p:topP('econ')},
    {label:'⚔️ 군사 강국',field:'mil', p:topP('mil')},
    {label:'🔬 과학 강국',field:'sci', p:topP('sci')},
    {label:'🎨 문화 강국',field:'cult',p:topP('cult')},
    {label:'👥 인구 강국',field:'pop', p:topP('pop')},
    {label:'🤝 외교 강국',field:'dip', p:topP('dip')}
  ];

  var html = '<div class="screen anim" style="background:var(--bg);justify-content:flex-start;padding-top:20px;">';
  html += '<div style="max-width:800px;width:100%;padding-bottom:30px;">';

  html += '<div class="winner-banner" style="margin-bottom:20px;">';
  html += '<div style="font-size:3em;margin-bottom:8px;">🏆</div>';
  html += '<div style="font-size:2em;font-weight:900;color:var(--gold);" class="glow">'+winner.emoji+' '+winner.name+'</div>';
  html += '<div style="color:'+winnerCl.color+';margin-bottom:6px;">'+winnerCl.emoji+' '+winner.country+'</div>';
  html += '<div style="font-size:2.2em;font-weight:900;color:var(--gold);">'+winner.scores.total+' 점</div>';
  html += '<div style="font-size:0.82em;color:var(--text2);margin-top:6px;">'+G.maxTurns+'턴 게임 완료</div>';
  html += '</div>';

  html += '<canvas id="worldMap" width="760" height="360" style="width:100%;border-radius:8px;border:1px solid rgba(240,192,64,0.18);display:block;margin-bottom:16px;"></canvas>';

  html += '<div style="margin-bottom:14px;">';
  sorted.forEach(function(p,idx){ html+=rankRow(p,idx,true); });
  html += '</div>';

  html += '<div class="panel" style="margin-bottom:14px;">';
  html += '<div class="section-title">🏅 분야별 1위</div>';
  html += '<div class="grid3" style="gap:8px;">';
  awards.forEach(function(aw){
    html += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;padding:8px;text-align:center;">';
    html += '<div style="font-size:0.72em;color:var(--text2);">'+aw.label+'</div>';
    html += '<div style="font-size:1.3em;">'+aw.p.emoji+'</div>';
    html += '<div style="font-weight:700;font-size:0.82em;">'+aw.p.name+'</div>';
    html += '<div style="font-size:0.8em;color:var(--gold);">'+aw.p.scores[aw.field]+'점</div>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="panel" style="margin-bottom:20px;">';
  html += '<div class="section-title">📊 최종 점수 분석</div>';
  html += '<div style="overflow-x:auto;"><table class="data-table">';
  html += '<thead><tr><th style="text-align:left;">순위</th><th style="text-align:left;">나라</th><th>💰경제</th><th>⚔️군사</th><th>🔬과학</th><th>🎨문화</th><th>👥인구</th><th>🤝외교</th><th style="color:var(--gold);">합계</th></tr></thead>';
  html += '<tbody>';
  var medals=['🥇','🥈','🥉'];
  sorted.forEach(function(p,idx){
    html += '<tr'+(idx===0?' style="background:rgba(240,192,64,0.05);"':'')+'>'; 
    html += '<td>'+(medals[idx]||(idx+1)+'위')+'</td>';
    html += '<td>'+p.emoji+' '+p.name+'</td>';
    html += '<td style="text-align:center;">'+p.scores.econ+'</td>';
    html += '<td style="text-align:center;">'+p.scores.mil+'</td>';
    html += '<td style="text-align:center;">'+p.scores.sci+'</td>';
    html += '<td style="text-align:center;">'+p.scores.cult+'</td>';
    html += '<td style="text-align:center;">'+p.scores.pop+'</td>';
    html += '<td style="text-align:center;">'+p.scores.dip+'</td>';
    html += '<td style="text-align:center;font-weight:700;color:var(--gold);">'+p.scores.total+'</td>';
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
