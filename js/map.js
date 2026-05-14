/* =========================================================
   나라 경영 시뮬레이션 · map.js
   문명식 육각형 타일 지도 렌더링 버전
   made by 박선생

   사용 방법:
     - 기존 저장소의 js/map.js 파일을 이 파일로 교체하세요.
     - index.html 수정 없이 그대로 작동하도록 scheduleMapDraw() 이름을 유지했습니다.
========================================================= */

/* ─── 지도 상수 ──────────────────────────────────── */
var MAP_W = 760;
var MAP_H = 420;

var HEX_SIZE = 25;
var HEX_GAP = 1.5;
var HEX_W = Math.sqrt(3) * HEX_SIZE;
var HEX_H_STEP = HEX_SIZE * 1.5;

var MAP_OFFSET_X = 72;
var MAP_OFFSET_Y = 48;

var CLIMATE_ORDER = ['cold', 'highland', 'temperate', 'arid', 'monsoon', 'tropical'];

/*
  문명식 육각형 지도
  o = 바다, t = 설원, p = 초원, f = 숲, d = 사막, m = 산악, j = 열대우림, h = 고원
*/
var CIV_MAP = [
  ['o','o','t','t','t','m','m','h','h','o','o','o','o'],
  ['o','t','t','p','p','m','h','h','p','p','o','o','o'],
  ['o','t','p','p','f','m','d','d','p','f','f','o','o'],
  ['o','p','p','f','d','d','d','p','p','f','j','j','o'],
  ['o','p','f','f','p','d','d','p','f','j','j','j','o'],
  ['o','o','f','p','p','p','p','f','j','j','j','o','o'],
  ['o','o','o','j','j','p','f','f','j','j','o','o','o'],
  ['o','o','o','o','j','j','f','p','p','o','o','o','o']
];

var TILE_TYPES = {
  o: { id:'ocean',    name:'바다',     color:'#12395f', edge:'#1e5a88', icon:'≈' },
  t: { id:'tundra',   name:'설원',     color:'#9fc7d7', edge:'#d4eef8', icon:'❄' },
  p: { id:'plains',   name:'초원',     color:'#3f8d3d', edge:'#66c466', icon:'·' },
  f: { id:'forest',   name:'숲',       color:'#1f6436', edge:'#3fa05a', icon:'♣' },
  d: { id:'desert',   name:'사막',     color:'#b88932', edge:'#e4c15d', icon:'·' },
  m: { id:'mountain', name:'산악',     color:'#666a74', edge:'#b8bdc8', icon:'▲' },
  j: { id:'jungle',   name:'열대우림', color:'#157a3a', edge:'#35b85d', icon:'🌿' },
  h: { id:'highland', name:'고원',     color:'#555372', edge:'#b0b0d8', icon:'▲' }
};

/* 기후별 수도 위치 */
var CLIMATE_START = {
  cold:      { row:1, col:2 },
  highland:  { row:1, col:7 },
  temperate: { row:3, col:2 },
  arid:      { row:3, col:5 },
  monsoon:   { row:3, col:9 },
  tropical:  { row:6, col:4 }
};

/* 수도 주변 영토 확장 타일 */
var CLIMATE_TERRITORY = {
  cold:      [{row:0,col:2},{row:0,col:3},{row:1,col:1},{row:1,col:2},{row:1,col:3},{row:2,col:2}],
  highland:  [{row:0,col:6},{row:0,col:7},{row:1,col:6},{row:1,col:7},{row:1,col:8},{row:2,col:6}],
  temperate: [{row:2,col:2},{row:2,col:3},{row:3,col:1},{row:3,col:2},{row:3,col:3},{row:4,col:2}],
  arid:      [{row:2,col:6},{row:3,col:4},{row:3,col:5},{row:3,col:6},{row:4,col:5},{row:4,col:6}],
  monsoon:   [{row:2,col:9},{row:3,col:8},{row:3,col:9},{row:3,col:10},{row:4,col:9},{row:4,col:10}],
  tropical:  [{row:5,col:3},{row:6,col:3},{row:6,col:4},{row:6,col:5},{row:7,col:4},{row:7,col:5}]
};

var TILE_YIELD_ICON = {
  o: '💰',
  t: '🔬',
  p: '🌾',
  f: '⚙️',
  d: '💰',
  m: '⚙️',
  j: '🌾',
  h: '🔬'
};

var BUILDING_ICON_FALLBACK = {
  farm:'🌾', aqueduct:'💧', workshop:'🔧', foundry:'🏭', market:'🏪', harbor:'⚓',
  library:'📚', university:'🎓', temple:'🏛️', theater:'🎭', barracks:'⚔️', fortress:'🏰',
  rice_terrace:'🌾', caravanserai:'🏕️', windmill:'⚙️', fur_post:'🦊', rice_paddy:'🌿', observatory:'🔭'
};

/* ─── 유틸리티 ───────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') return [255, 255, 255];
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

function rgbaFromHex(hex, alpha) {
  var rgb = hexToRgb(hex);
  return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToPixel(row, col, scale) {
  var size = HEX_SIZE * scale;
  var w = Math.sqrt(3) * size;
  var step = size * 1.5;
  return {
    x: MAP_OFFSET_X * scale + col * w + (row % 2) * (w / 2),
    y: MAP_OFFSET_Y * scale + row * step
  };
}

function drawHexPath(ctx, x, y, size) {
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    var angle = Math.PI / 180 * (60 * i - 30);
    var px = x + size * Math.cos(angle);
    var py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function getMapScale(W, H) {
  var cols = CIV_MAP[0].length;
  var rows = CIV_MAP.length;
  var mapWidth = MAP_OFFSET_X + cols * HEX_W + HEX_W;
  var mapHeight = MAP_OFFSET_Y + rows * HEX_H_STEP + HEX_SIZE;
  return Math.min(W / mapWidth, H / mapHeight, 1.05);
}

function sameTile(a, b) {
  return a && b && a.row === b.row && a.col === b.col;
}

function tileInList(tile, list) {
  if (!list) return false;
  for (var i = 0; i < list.length; i++) {
    if (sameTile(tile, list[i])) return true;
  }
  return false;
}

function getPlayerColor(player, climateId) {
  if (player && player.color) return player.color;
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId] && CLIMATES[climateId].color) {
    return CLIMATES[climateId].color;
  }
  return '#f0c040';
}

function getClimateName(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) return CLIMATES[climateId].name;
  return climateId;
}

function getClimateEmoji(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) return CLIMATES[climateId].emoji;
  return '🏛️';
}

function getBuildingCatalog() {
  var list = [];
  if (typeof BUILDINGS !== 'undefined' && BUILDINGS) list = list.concat(BUILDINGS);
  if (typeof UNIQUE_BUILDINGS !== 'undefined' && UNIQUE_BUILDINGS) list = list.concat(UNIQUE_BUILDINGS);
  return list;
}

function getBuildingEmojiById(id) {
  var catalog = getBuildingCatalog();
  for (var i = 0; i < catalog.length; i++) {
    if (catalog[i].id === id) return catalog[i].emoji || BUILDING_ICON_FALLBACK[id] || '🏗️';
  }
  return BUILDING_ICON_FALLBACK[id] || '🏗️';
}

function pushBuildingId(result, key, value) {
  if (!key) return;
  if (value === false || value === 0 || value === null || typeof value === 'undefined') return;
  result.push(key);
}

function getPlayerBuildingIds(player) {
  if (!player) return [];
  var result = [];
  var candidates = [player.buildings, player.builtBuildings, player.ownedBuildings, player.buildingIds];

  candidates.forEach(function(src) {
    if (!src) return;
    if (Array.isArray(src)) {
      src.forEach(function(item) {
        if (typeof item === 'string') result.push(item);
        else if (item && item.id) result.push(item.id);
      });
    } else if (typeof src === 'object') {
      Object.keys(src).forEach(function(key) {
        pushBuildingId(result, key, src[key]);
      });
    }
  });

  /* 중복 제거 */
  var seen = {};
  return result.filter(function(id) {
    if (seen[id]) return false;
    seen[id] = true;
    return true;
  });
}

function getPlayerTechCount(player) {
  if (!player) return 0;
  var src = player.techs || player.technologies || player.researchedTechs || player.doneTechs;
  if (!src) return 0;
  if (Array.isArray(src)) return src.length;
  if (typeof src === 'object') {
    return Object.keys(src).filter(function(k){ return !!src[k]; }).length;
  }
  return 0;
}

/* ─── 메인 드로우 함수 ───────────────────────────── */
function drawWorldMap(canvas, players, currentPlayerId) {
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;
  var scale = getMapScale(W, H);
  var hexSize = HEX_SIZE * scale;

  ctx.clearRect(0, 0, W, H);

  var playerByClimate = {};
  if (players) {
    players.forEach(function(p) {
      if (!p || !p.climate) return;
      if (!playerByClimate[p.climate]) playerByClimate[p.climate] = [];
      playerByClimate[p.climate].push(p);
    });
  }

  drawCivOcean(ctx, W, H);
  drawSoftGrid(ctx, W, H);
  drawTiles(ctx, W, H, scale, hexSize, playerByClimate);
  drawTerritoryOutlines(ctx, scale, hexSize, playerByClimate);
  drawCapitals(ctx, W, H, scale, hexSize, playerByClimate, currentPlayerId);
  drawMapTitle(ctx, W, H);
  drawLegend(ctx, W, H, players);

  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.textAlign = 'right';
  ctx.fillText('made by 박선생', W - 8, H - 6);
}

/* ─── 배경 ───────────────────────────────────────── */
function drawCivOcean(ctx, W, H) {
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#04101e');
  grad.addColorStop(0.45, '#071a2f');
  grad.addColorStop(1, '#10243a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#88c8ff';
  ctx.lineWidth = 1;
  for (var y = 24; y < H; y += 34) {
    ctx.beginPath();
    for (var x = 0; x <= W; x += 16) {
      var yy = y + Math.sin((x + y) / 42) * 4;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSoftGrid(ctx, W, H) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 9]);
  for (var x = 30; x < W; x += 90) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (var y = 30; y < H; y += 70) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/* ─── 타일 ───────────────────────────────────────── */
function drawTiles(ctx, W, H, scale, hexSize, playerByClimate) {
  for (var row = 0; row < CIV_MAP.length; row++) {
    for (var col = 0; col < CIV_MAP[row].length; col++) {
      drawSingleTile(ctx, row, col, scale, hexSize, playerByClimate);
    }
  }
}

function drawSingleTile(ctx, row, col, scale, hexSize, playerByClimate) {
  var code = CIV_MAP[row][col];
  var tile = TILE_TYPES[code] || TILE_TYPES.p;
  var pos = hexToPixel(row, col, scale);
  var ownerInfo = findOwnerClimate(row, col, playerByClimate);

  ctx.save();

  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.fillStyle = tile.color;
  ctx.fill();

  /* 지형별 가벼운 입체감 */
  var grad = ctx.createLinearGradient(pos.x - hexSize, pos.y - hexSize, pos.x + hexSize, pos.y + hexSize);
  grad.addColorStop(0, 'rgba(255,255,255,0.16)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.01)');
  grad.addColorStop(1, 'rgba(0,0,0,0.20)');
  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.fillStyle = grad;
  ctx.fill();

  /* 소유 영토 색상 오버레이 */
  if (ownerInfo) {
    drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
    ctx.fillStyle = rgbaFromHex(ownerInfo.color, 0.25);
    ctx.fill();
  }

  ctx.lineWidth = ownerInfo ? 1.6 : 1;
  ctx.strokeStyle = ownerInfo ? rgbaFromHex(ownerInfo.color, 0.75) : 'rgba(255,255,255,0.18)';
  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.stroke();

  /* 지형 아이콘 */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = Math.round(12 * scale) + 'px sans-serif';
  ctx.fillStyle = code === 'o' ? 'rgba(210,235,255,0.45)' : 'rgba(255,255,255,0.58)';
  ctx.fillText(tile.icon, pos.x, pos.y - 1 * scale);

  /* 생산량 힌트 */
  if (code !== 'o') {
    ctx.font = Math.round(9 * scale) + 'px sans-serif';
    ctx.globalAlpha = 0.55;
    ctx.fillText(TILE_YIELD_ICON[code] || '·', pos.x + 12 * scale, pos.y + 10 * scale);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function findOwnerClimate(row, col, playerByClimate) {
  for (var i = 0; i < CLIMATE_ORDER.length; i++) {
    var cid = CLIMATE_ORDER[i];
    var list = playerByClimate[cid];
    if (!list || list.length === 0) continue;
    if (tileInList({row:row, col:col}, CLIMATE_TERRITORY[cid])) {
      return { climateId: cid, color: getPlayerColor(list[0], cid) };
    }
  }
  return null;
}

function drawTerritoryOutlines(ctx, scale, hexSize, playerByClimate) {
  CLIMATE_ORDER.forEach(function(cid) {
    var players = playerByClimate[cid];
    var hasPlayer = players && players.length > 0;
    var color = hasPlayer ? getPlayerColor(players[0], cid) : (CLIMATES && CLIMATES[cid] ? CLIMATES[cid].color : '#ffffff');
    var territory = CLIMATE_TERRITORY[cid] || [];

    ctx.save();
    ctx.lineWidth = hasPlayer ? 2.2 : 1.1;
    ctx.strokeStyle = hasPlayer ? rgbaFromHex(color, 0.75) : 'rgba(255,255,255,0.16)';
    territory.forEach(function(t) {
      var pos = hexToPixel(t.row, t.col, scale);
      drawHexPath(ctx, pos.x, pos.y, hexSize - 0.6);
      ctx.stroke();
    });
    ctx.restore();
  });
}

/* ─── 수도 / 플레이어 ───────────────────────────── */
function drawCapitals(ctx, W, H, scale, hexSize, playerByClimate, currentPlayerId) {
  CLIMATE_ORDER.forEach(function(cid) {
    var players = playerByClimate[cid];
    var start = CLIMATE_START[cid];
    if (!start) return;

    if (!players || players.length === 0) {
      drawEmptyCapital(ctx, scale, hexSize, cid, start);
      return;
    }

    players.forEach(function(player, idx) {
      drawPlayerCapital(ctx, W, H, scale, hexSize, cid, start, player, idx, player.id === currentPlayerId);
    });
  });
}

function drawEmptyCapital(ctx, scale, hexSize, cid, start) {
  var pos = hexToPixel(start.row, start.col, scale);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.45;
  ctx.font = Math.round(18 * scale) + 'px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(getClimateEmoji(cid), pos.x, pos.y - 2 * scale);
  ctx.font = Math.round(9 * scale) + 'px sans-serif';
  ctx.fillText(getClimateName(cid), pos.x, pos.y + 18 * scale);
  ctx.restore();
}

function drawPlayerCapital(ctx, W, H, scale, hexSize, cid, start, player, stackIndex, isHighlight) {
  var pos = hexToPixel(start.row, start.col, scale);
  var color = getPlayerColor(player, cid);
  var dx = stackIndex * 15 * scale;
  var dy = stackIndex * 8 * scale;
  var cx = pos.x + dx;
  var cy = pos.y + dy;
  var r = isHighlight ? 19 * scale : 16 * scale;

  ctx.save();

  /* 현재 차례 강조 링 */
  if (isHighlight) {
    var t = (Date.now() % 1800) / 1800;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 12 * scale + t * 8 * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgbaFromHex(color, 0.22 * (1 - t));
    ctx.fill();
  }

  /* 수도가 위치한 타일 강조 */
  drawHexPath(ctx, pos.x, pos.y, hexSize - 2 * scale);
  ctx.fillStyle = rgbaFromHex(color, isHighlight ? 0.45 : 0.32);
  ctx.fill();
  ctx.lineWidth = isHighlight ? 3 : 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  /* 도시 원 */
  ctx.shadowColor = color;
  ctx.shadowBlur = isHighlight ? 20 : 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7,9,22,0.92)';
  ctx.fill();
  ctx.lineWidth = isHighlight ? 2.4 : 1.7;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.shadowBlur = 0;

  /* 왕관/수도 아이콘 */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = Math.round((isHighlight ? 16 : 14) * scale) + 'px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(player.emoji || '👑', cx, cy - 1 * scale);

  drawBuildingIcons(ctx, scale, cid, start, player, color);
  drawInfoCard(ctx, W, H, cx, cy + r + 5 * scale, player, color, isHighlight, scale);

  ctx.restore();
}

function drawBuildingIcons(ctx, scale, cid, start, player, color) {
  var ids = getPlayerBuildingIds(player);
  if (ids.length === 0) return;

  var slots = [
    {row:start.row-1, col:start.col},
    {row:start.row,   col:start.col+1},
    {row:start.row+1, col:start.col},
    {row:start.row,   col:start.col-1},
    {row:start.row-1, col:start.col-1},
    {row:start.row+1, col:start.col+1}
  ];

  ctx.save();
  ids.slice(0, 6).forEach(function(id, idx) {
    var slot = slots[idx];
    if (!slot || slot.row < 0 || slot.row >= CIV_MAP.length || slot.col < 0 || slot.col >= CIV_MAP[slot.row].length) return;
    var pos = hexToPixel(slot.row, slot.col, scale);
    var rr = 10 * scale;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, rr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(5,7,18,0.82)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgbaFromHex(color, 0.75);
    ctx.stroke();

    ctx.font = Math.round(11 * scale) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(getBuildingEmojiById(id), pos.x, pos.y);
  });
  ctx.restore();
}

function drawInfoCard(ctx, W, H, cx, topY, player, color, isHighlight, scale) {
  var cardW = (isHighlight ? 116 : 104) * scale;
  var cardH = 48 * scale;
  var x = clamp(cx - cardW / 2, 4, W - cardW - 4);
  var y = topY;
  if (y + cardH > H - 6) y = topY - cardH - 52 * scale;

  ctx.save();
  ctx.fillStyle = 'rgba(8,9,26,0.90)';
  roundRect(ctx, x, y, cardW, cardH, 7 * scale);
  ctx.fill();

  ctx.lineWidth = isHighlight ? 1.6 : 1;
  ctx.strokeStyle = rgbaFromHex(color, isHighlight ? 0.9 : 0.55);
  roundRect(ctx, x, y, cardW, cardH, 7 * scale);
  ctx.stroke();

  var name = player.name || '플레이어';
  var country = player.country || '문명';
  if (name.length > 7) name = name.slice(0, 7) + '…';
  if (country.length > 8) country = country.slice(0, 8) + '…';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = 'bold ' + Math.round(10 * scale) + 'px sans-serif';
  ctx.fillStyle = isHighlight ? color : '#e8dfc8';
  ctx.fillText(name, x + cardW / 2, y + 5 * scale);

  ctx.font = Math.round(8.5 * scale) + 'px sans-serif';
  ctx.fillStyle = rgbaFromHex(color, 0.82);
  ctx.fillText(country, x + cardW / 2, y + 18 * scale);

  ctx.font = 'bold ' + Math.round(11 * scale) + 'px sans-serif';
  ctx.fillStyle = '#f0c040';
  var total = player.scores ? player.scores.total : 0;
  var techCount = getPlayerTechCount(player);
  ctx.fillText('★ ' + total + '  🔬' + techCount, x + cardW / 2, y + 31 * scale);

  drawMiniResBar(ctx, x + 8 * scale, y + 43 * scale, cardW - 16 * scale, player, scale);
  ctx.restore();
}

function drawMiniResBar(ctx, x, y, w, player, scale) {
  var res = player.resources || {};
  var items = [
    { key:'food',       color:'#60d060', val: Math.floor(res.food || 0) },
    { key:'gold',       color:'#f0c040', val: Math.floor(res.gold || 0) },
    { key:'production', color:'#80aac8', val: Math.floor(res.production || 0) },
    { key:'science',    color:'#50a8e8', val: Math.floor(res.science || 0) },
    { key:'culture',    color:'#b050e8', val: Math.floor(res.culture || 0) }
  ];
  var maxVal = Math.max.apply(null, items.map(function(i){ return i.val; }).concat([1]));
  var gap = 2 * scale;
  var segW = (w - (items.length - 1) * gap) / items.length;
  var bh = 3 * scale;

  items.forEach(function(item, idx) {
    var sx = x + idx * (segW + gap);
    var pct = Math.min(1, item.val / Math.max(maxVal, 1));
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.fillRect(sx, y - bh, segW, bh);
    ctx.fillStyle = item.color;
    ctx.fillRect(sx, y - bh, segW * pct, bh);
  });
}

/* ─── 제목 / 범례 ────────────────────────────────── */
function drawMapTitle(ctx, W, H) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = 'rgba(246,231,181,0.95)';
  ctx.fillText('문명 지도', 12, 10);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(210,225,245,0.58)';
  ctx.fillText('육각형 타일 · 수도 · 영토 · 건물 표시', 12, 28);
  ctx.restore();
}

function drawLegend(ctx, W, H, players) {
  ctx.save();

  drawTileLegend(ctx, 10, H - 74);

  if (!players || players.length === 0) {
    ctx.restore();
    return;
  }

  var sorted = players.slice().sort(function(a,b) {
    return (b.scores ? b.scores.total : 0) - (a.scores ? a.scores.total : 0);
  });

  var legendW = 140;
  var legendH = 16 + sorted.length * 17;
  var lx = W - legendW - 7;
  var ly = H - legendH - 7;

  ctx.fillStyle = 'rgba(6,8,20,0.86)';
  roundRect(ctx, lx, ly, legendW, legendH, 7);
  ctx.fill();

  ctx.lineWidth = 0.9;
  ctx.strokeStyle = 'rgba(240,192,64,0.25)';
  roundRect(ctx, lx, ly, legendW, legendH, 7);
  ctx.stroke();

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = 'rgba(240,192,64,0.82)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('🏆 국력 순위', lx + 8, ly + 5);

  var maxTotal = Math.max(1, sorted[0].scores ? sorted[0].scores.total : 1);
  sorted.forEach(function(p, idx) {
    var ry = ly + 17 + idx * 17;
    var total = p.scores ? p.scores.total : 0;

    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(lx + 8, ry + 4, legendW - 16, 9);

    var barW = Math.max(4, (legendW - 16) * (total / maxTotal));
    ctx.fillStyle = rgbaFromHex(p.color || '#f0c040', 0.70);
    ctx.fillRect(lx + 8, ry + 4, barW, 9);

    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#e8dfc8';
    ctx.textAlign = 'left';
    var label = (idx + 1) + '. ' + (p.emoji || '👑') + ' ' + ((p.name || '플레이어').length > 5 ? (p.name || '플레이어').slice(0,5) + '…' : (p.name || '플레이어'));
    ctx.fillText(label, lx + 10, ry + 4);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f0c040';
    ctx.fillText(total, lx + legendW - 6, ry + 4);
  });

  ctx.restore();
}

function drawTileLegend(ctx, x, y) {
  var items = [
    { code:'p', label:'초원' }, { code:'f', label:'숲' }, { code:'d', label:'사막' },
    { code:'m', label:'산' }, { code:'t', label:'설원' }, { code:'j', label:'열대' }
  ];

  ctx.save();
  var boxW = 178;
  var boxH = 64;
  ctx.fillStyle = 'rgba(6,8,20,0.74)';
  roundRect(ctx, x, y, boxW, boxH, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.stroke();

  ctx.font = 'bold 9px sans-serif';
  ctx.fillStyle = 'rgba(246,231,181,0.85)';
  ctx.textAlign = 'left';
  ctx.fillText('타일 지형', x + 8, y + 6);

  items.forEach(function(item, idx) {
    var tile = TILE_TYPES[item.code];
    var ix = x + 10 + (idx % 3) * 55;
    var iy = y + 24 + Math.floor(idx / 3) * 18;
    ctx.fillStyle = tile.color;
    ctx.fillRect(ix, iy, 11, 11);
    ctx.strokeStyle = tile.edge;
    ctx.strokeRect(ix, iy, 11, 11);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#dfe8f2';
    ctx.fillText(item.label, ix + 15, iy + 1);
  });
  ctx.restore();
}

/* ─── 외부 호출용: 기존 함수명 유지 ──────────────── */
var _mapDrawScheduled = false;
var _mapLastPlayers = null;
var _mapLastCurId = null;
var _mapAnimFrame = null;

function scheduleMapDraw(players, currentPlayerId) {
  _mapLastPlayers = players || [];
  _mapLastCurId = currentPlayerId;

  if (_mapDrawScheduled) return;
  _mapDrawScheduled = true;

  setTimeout(function() {
    _mapDrawScheduled = false;
    var canvas = document.getElementById('worldMap');
    if (!canvas) return;

    drawWorldMap(canvas, _mapLastPlayers, _mapLastCurId);

    /* 현재 플레이어 강조 링이 살아 보이도록 가벼운 애니메이션 */
    if (_mapAnimFrame) cancelAnimationFrame(_mapAnimFrame);
    function animate() {
      var c = document.getElementById('worldMap');
      if (!c) return;
      drawWorldMap(c, _mapLastPlayers, _mapLastCurId);
      _mapAnimFrame = requestAnimationFrame(animate);
    }
    _mapAnimFrame = requestAnimationFrame(animate);
  }, 0);
}
