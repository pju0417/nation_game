/* =========================================================
   나라 경영 시뮬레이션 · ui.js
   재사용 UI 헬퍼 함수
   made by 박선생
========================================================= */

/* ─── 자원 바 ────────────────────────────────────── */
function rbar(res, compact) {
  var html = '<div class="res-bar">';
  Object.keys(res).forEach(function (k) {
    html += '<div class="res-item">';
    html += (R_EMOJI[k] || '') + ' ';
    if (!compact) {
      html += '<span style="color:var(--text2);font-size:0.78em;">' + (R_NAME[k] || k) + '</span> ';
    }
    html += '<span class="res-val">' + Math.floor(res[k]) + '</span>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ─── 자원 미리보기 행 (자원 + 획득량) ──────────── */
function resPreviewRow(key, curVal, gainVal) {
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);">';
  html += '<span style="font-size:0.85em;">' + (R_EMOJI[key] || '') + ' ' + (R_NAME[key] || key) + '</span>';
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:0.75em;color:#60d060;">+' + Math.floor(gainVal || 0) + '</span>';
  html += '<span style="font-weight:700;color:var(--gold);">' + Math.floor(curVal) + '</span>';
  html += '</div></div>';
  return html;
}

/* ─── 점수 바 ────────────────────────────────────── */
function scoreBar(label, val, maxVal, color) {
  var pct  = maxVal > 0 ? Math.min(100, (val / maxVal) * 100) : 0;
  var html = '<div style="margin-bottom:9px;">';
  html += '<div style="display:flex;justify-content:space-between;font-size:0.82em;margin-bottom:3px;">';
  html += '<span>' + label + '</span>';
  html += '<span style="font-weight:700;color:var(--gold);">' + val + '</span>';
  html += '</div>';
  html += '<div class="progress-track">';
  html += '<div class="progress-fill" style="width:' + pct + '%;background:' + (color || 'var(--gold2)') + ';"></div>';
  html += '</div></div>';
  return html;
}

/* ─── 랭킹 행 ────────────────────────────────────── */
function rankRow(p, rank, showDetail) {
  var medals    = ['🥇', '🥈', '🥉'];
  var rankClass = rank === 0 ? 'rank-gold' : rank === 1 ? 'rank-silver' : rank === 2 ? 'rank-bronze' : 'rank-other';
  var cl        = CLIMATES[p.climate];

  var html = '<div class="rank-row ' + rankClass + '" style="border-left:4px solid ' + p.color + ';">';
  html += '<div style="font-weight:900;font-size:1.3em;width:30px;text-align:center;">' + (medals[rank] || (rank + 1) + '위') + '</div>';
  html += '<span style="font-size:1.4em;">' + p.emoji + '</span>';
  html += '<div style="flex:1;min-width:0;">';
  html += '<div style="font-weight:700;">' + p.name + (p.isAI ? '<span class="badge-ai">AI</span>' : '') + '</div>';
  html += '<div style="font-size:0.78em;color:' + cl.color + ';">' + cl.emoji + ' ' + p.country + '</div>';
  html += '</div>';
  html += '<div style="text-align:right;">';
  html += '<div style="font-size:1.35em;font-weight:900;color:var(--gold);">' + p.scores.total + '</div>';
  if (showDetail) {
    html += '<div style="font-size:0.7em;color:var(--text2);">';
    html += '💰' + p.scores.econ + ' ⚔️' + p.scores.mil + ' 🔬' + p.scores.sci + ' 🎨' + p.scores.cult + ' 👥' + p.scores.pop;
    html += '</div>';
  }
  html += '</div></div>';
  return html;
}

/* ─── 미니 플레이어 카드 ─────────────────────────── */
function miniCard(p) {
  var cl = CLIMATES[p.climate];
  var html = '<div class="panel-sm" style="border-color:' + p.color + '44;margin-bottom:6px;">';
  html += '<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">';
  html += '<span style="font-size:1.3em;">' + p.emoji + '</span>';
  html += '<div style="flex:1;min-width:0;">';
  html += '<div style="font-weight:700;font-size:0.87em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.name + '</div>';
  html += '<div style="font-size:0.73em;color:' + cl.color + ';">' + cl.emoji + ' ' + p.country + '</div>';
  html += '</div>';
  html += '<div style="font-size:1.05em;font-weight:900;color:var(--gold);">' + p.scores.total + '</div>';
  html += '</div>';
  html += '<div class="res-bar" style="gap:4px;">';
  html += '<div class="res-item">🌾 <span class="res-val">' + Math.floor(p.resources.food)       + '</span></div>';
  html += '<div class="res-item">💰 <span class="res-val">' + Math.floor(p.resources.gold)       + '</span></div>';
  html += '<div class="res-item">⚙️ <span class="res-val">' + Math.floor(p.resources.production) + '</span></div>';
  html += '<div class="res-item">⚔️ <span class="res-val">' + p.military                          + '</span></div>';
  html += '</div></div>';
  return html;
}

/* ─── 건물 비용 표시 ─────────────────────────────── */
function costHtml(cost, resources) {
  var html = '';
  Object.keys(cost || {}).forEach(function (r) {
    var enough = (resources[r] || 0) >= cost[r];
    html += '<div style="color:' + (enough ? 'var(--text2)' : '#f09090') + ';font-size:0.8em;">';
    html += (R_EMOJI[r] || '') + cost[r];
    html += '</div>';
  });
  return html;
}

/* ─── 건설 가능 여부 ─────────────────────────────── */
function canAffordBuilding(p, bDef) {
  var ok = true;
  Object.keys(bDef.cost || {}).forEach(function (r) {
    if ((p.resources[r] || 0) < bDef.cost[r]) ok = false;
  });
  return ok;
}

/* ─── 연구 가능 여부 ─────────────────────────────── */
function canAffordTech(p, tDef) {
  var ok = true;
  Object.keys(tDef.cost || {}).forEach(function (r) {
    if ((p.resources[r] || 0) < tDef.cost[r]) ok = false;
  });
  return ok;
}

/* ─── 건물 수량 맵 ───────────────────────────────── */
function buildCount(p) {
  var bc = {};
  p.buildings.forEach(function (id) { bc[id] = (bc[id] || 0) + 1; });
  return bc;
}

/* ─── 기후 참고 박스 ─────────────────────────────── */
function climateRefBox(c) {
  var html = '<div class="climate-info" style="border-left:3px solid ' + c.color + ';">';
  html += '<div style="font-weight:700;color:' + c.color + ';margin-bottom:2px;">' + c.emoji + ' ' + c.name + ' 기후</div>';
  html += '<div style="font-size:0.75em;color:var(--text2);margin-bottom:4px;">' + c.geo + '</div>';
  html += '<div style="font-size:0.75em;color:#80e890;">' + c.perk + '</div>';
  html += '<div style="font-size:0.75em;color:#f09090;">' + c.weakness + '</div>';
  html += '<div style="font-size:0.72em;color:var(--text2);margin-top:3px;">';
  html += '🌾' + c.base.food + ' ⚙️' + c.base.production + ' 💰' + c.base.gold + ' 🔬' + c.base.science + ' 🎨' + c.base.culture;
  html += '</div></div>';
  return html;
}
