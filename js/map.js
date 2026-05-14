/* =========================================================
   나라 경영 시뮬레이션 · map.js
   PC 고화질 + 대형 문명식 선택형 육각 타일 지도
   made by 박선생

   적용 방법:
   - GitHub 저장소에서 js/map.js 파일을 연다.
   - 기존 내용을 전부 삭제한다.
   - 이 코드 전체를 붙여넣는다.
   - Commit changes 한다.

   핵심 기능:
   1. PC 환경 고해상도 Canvas 렌더링
   2. G.maxTurns 값에 따라 지도 크기 변경
      - 15턴: 확장형 소형 지도
      - 20턴: 대형 표준 지도
      - 30턴: 초대형 장기 지도
   3. 육각형 하나하나를 MAP_TILES 데이터 객체로 생성
   4. Canvas 클릭 좌표를 실제 타일 데이터와 연결
   5. 선택한 타일 강조 + 정보창 표시
   6. 국가별 영토 색상과 테두리 강화
   7. 기존 index.html 수정 없이 scheduleMapDraw() 유지
========================================================= */

/* ─── 기본 상수 ─────────────────────────────────── */
var MAP_W = 760;
var MAP_H = 420;

var HEX_GAP = 1.4;
var MAP_OFFSET_X = 70;
var MAP_OFFSET_Y = 54;

var CLIMATE_ORDER = ['cold', 'highland', 'temperate', 'arid', 'monsoon', 'tropical'];

var MAP_TILES = [];
var MAP_TILE_INDEX = {};
var SELECTED_TILE = null;

var CURRENT_MAP_PROFILE = null;
var CURRENT_MAP_KEY = null;

var _mapDrawScheduled = false;
var _mapLastPlayers = null;
var _mapLastCurId = null;
var _mapAnimFrame = null;
var _mapClickBoundCanvas = null;

/* ─── 타일 지형 정의 ─────────────────────────────── */
var TILE_TYPES = {
  o: {
    id: 'ocean',
    name: '바다',
    color: '#12395f',
    edge: '#1e5a88',
    icon: '≈',
    yield: { gold: 1 },
    buildable: false
  },
  t: {
    id: 'tundra',
    name: '설원',
    color: '#9fc7d7',
    edge: '#d4eef8',
    icon: '❄',
    yield: { science: 1, production: 1 },
    buildable: true
  },
  p: {
    id: 'plains',
    name: '초원',
    color: '#3f8d3d',
    edge: '#66c466',
    icon: '·',
    yield: { food: 2 },
    buildable: true
  },
  f: {
    id: 'forest',
    name: '숲',
    color: '#1f6436',
    edge: '#3fa05a',
    icon: '♣',
    yield: { food: 1, production: 1 },
    buildable: true
  },
  d: {
    id: 'desert',
    name: '사막',
    color: '#b88932',
    edge: '#e4c15d',
    icon: '·',
    yield: { gold: 2 },
    buildable: true
  },
  m: {
    id: 'mountain',
    name: '산악',
    color: '#666a74',
    edge: '#b8bdc8',
    icon: '▲',
    yield: { production: 2, science: 1 },
    buildable: false
  },
  j: {
    id: 'jungle',
    name: '열대우림',
    color: '#157a3a',
    edge: '#35b85d',
    icon: '🌿',
    yield: { food: 2, culture: 1 },
    buildable: true
  },
  h: {
    id: 'highland',
    name: '고원',
    color: '#555372',
    edge: '#b0b0d8',
    icon: '▲',
    yield: { science: 2 },
    buildable: true
  }
};

/* ─── 지도 프로필: 턴 수에 따라 지도 규모 변경 ───── */
var MAP_PROFILES = {
  short: {
    key: 'short',
    label: '확장형 소형 지도',
    turnLabel: '15턴',
    cssW: 1180,
    cssH: 660,
    hexSize: 34,
    map: [
      ['o','o','t','t','t','m','m','h','h','o','o','o','o'],
      ['o','t','t','p','p','m','h','h','p','p','o','o','o'],
      ['o','t','p','p','f','m','d','d','p','f','f','o','o'],
      ['o','p','p','f','d','d','d','p','p','f','j','j','o'],
      ['o','p','f','f','p','d','d','p','f','j','j','j','o'],
      ['o','o','f','p','p','p','p','f','j','j','j','o','o'],
      ['o','o','o','j','j','p','f','f','j','j','o','o','o'],
      ['o','o','o','o','j','j','f','p','p','o','o','o','o']
    ],
    starts: {
      cold:      { row: 1, col: 2 },
      highland:  { row: 1, col: 7 },
      temperate: { row: 3, col: 2 },
      arid:      { row: 3, col: 5 },
      monsoon:   { row: 3, col: 9 },
      tropical:  { row: 6, col: 4 }
    }
  },

  standard: {
    key: 'standard',
    label: '대형 표준 지도',
    turnLabel: '20턴',
    cssW: 1440,
    cssH: 820,
    hexSize: 33,
    map: [
      ['o','o','t','t','t','t','m','m','h','h','h','o','o','o','o'],
      ['o','t','t','t','p','p','m','h','h','p','p','p','o','o','o'],
      ['o','t','p','p','p','f','m','d','d','p','p','f','f','o','o'],
      ['o','p','p','f','f','d','d','d','d','p','f','f','j','j','o'],
      ['o','p','f','f','p','p','d','d','p','p','f','j','j','j','o'],
      ['o','o','f','p','p','p','p','p','f','f','j','j','j','j','o'],
      ['o','o','o','j','j','p','p','f','f','j','j','j','j','o','o'],
      ['o','o','o','o','j','j','p','f','p','p','j','j','o','o','o'],
      ['o','o','o','o','o','j','j','f','f','p','p','o','o','o','o'],
      ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o']
    ],
    starts: {
      cold:      { row: 1, col: 2 },
      highland:  { row: 1, col: 8 },
      temperate: { row: 3, col: 2 },
      arid:      { row: 3, col: 7 },
      monsoon:   { row: 3, col: 12 },
      tropical:  { row: 7, col: 5 }
    }
  },

  long: {
    key: 'long',
    label: '초대형 장기 지도',
    turnLabel: '30턴',
    cssW: 1680,
    cssH: 940,
    hexSize: 32,
    map: [
      ['o','o','o','t','t','t','t','m','m','h','h','h','h','o','o','o','o'],
      ['o','o','t','t','t','p','p','m','m','h','h','p','p','p','o','o','o'],
      ['o','t','t','p','p','p','f','m','d','d','p','p','f','f','o','o','o'],
      ['o','t','p','p','f','f','d','d','d','d','p','f','f','j','j','o','o'],
      ['o','p','p','f','f','p','p','d','d','p','p','f','j','j','j','j','o'],
      ['o','p','f','f','p','p','p','p','p','f','f','j','j','j','j','j','o'],
      ['o','o','f','p','p','p','p','f','f','f','j','j','j','j','j','o','o'],
      ['o','o','o','j','j','p','p','p','f','j','j','j','j','j','o','o','o'],
      ['o','o','o','o','j','j','p','f','f','p','p','j','j','o','o','o','o'],
      ['o','o','o','o','o','j','j','f','f','p','p','p','o','o','o','o','o'],
      ['o','o','o','o','o','o','j','j','f','f','p','o','o','o','o','o','o'],
      ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o']
    ],
    starts: {
      cold:      { row: 1, col: 3 },
      highland:  { row: 1, col: 10 },
      temperate: { row: 4, col: 2 },
      arid:      { row: 4, col: 8 },
      monsoon:   { row: 4, col: 14 },
      tropical:  { row: 8, col: 6 }
    }
  }
};

/* ─── 현재 턴 수 기준 지도 선택 ─────────────────── */
function getMaxTurnsForMap() {
  if (typeof G !== 'undefined' && G && G.maxTurns) {
    return parseInt(G.maxTurns, 10);
  }
  return 20;
}

function getMapProfile() {
  var turns = getMaxTurnsForMap();

  if (turns <= 15) return MAP_PROFILES.short;
  if (turns >= 30) return MAP_PROFILES.long;
  return MAP_PROFILES.standard;
}

function getClimateStart(climateId) {
  var profile = CURRENT_MAP_PROFILE || getMapProfile();
  return profile.starts[climateId];
}

/* ─── 유틸리티 ──────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') {
    return [255, 255, 255];
  }

  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgbaFromHex(hex, alpha) {
  var rgb = hexToRgb(hex);
  return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function tileKey(row, col) {
  return row + ',' + col;
}

function getTile(row, col) {
  return MAP_TILE_INDEX[tileKey(row, col)] || null;
}

function getClimateName(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) {
    return CLIMATES[climateId].name;
  }
  return climateId || '없음';
}

function getClimateEmoji(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) {
    return CLIMATES[climateId].emoji;
  }
  return '🏛️';
}

function getPlayerColor(player, climateId) {
  if (player && player.color) return player.color;

  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) {
    return CLIMATES[climateId].color;
  }

  return '#f0c040';
}

function getPlayerById(players, id) {
  if (!players || id === null || typeof id === 'undefined') return null;

  for (var i = 0; i < players.length; i++) {
    if (players[i].id === id) return players[i];
  }

  return null;
}

function getPlayerByClimate(players, climateId) {
  if (!players) return null;

  for (var i = 0; i < players.length; i++) {
    if (players[i].climate === climateId) return players[i];
  }

  return null;
}

function formatYield(yieldObj) {
  if (!yieldObj) return '없음';

  var labels = {
    food: '🌾 식량',
    production: '⚙️ 생산력',
    gold: '💰 금화',
    science: '🔬 과학',
    culture: '🎨 문화'
  };

  var result = [];

  Object.keys(yieldObj).forEach(function(key) {
    if (yieldObj[key]) {
      result.push(labels[key] + ' +' + yieldObj[key]);
    }
  });

  return result.length ? result.join(', ') : '없음';
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

/* ─── PC 고화질 Canvas 준비 ─────────────────────── */
function prepareCanvasForHighQuality(canvas) {
  var profile = getMapProfile();
  var parent = canvas.parentNode;
  var parentW = parent ? parent.clientWidth : profile.cssW;

  var maxCssW = profile.cssW;
  var cssW = Math.min(maxCssW, Math.max(900, parentW || maxCssW));
  var cssH = Math.round(cssW * (profile.cssH / profile.cssW));

  var dpr = window.devicePixelRatio || 1;
  var renderRatio = Math.min(dpr, 2.5);

  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.style.maxWidth = '100%';
  canvas.style.display = 'block';
  canvas.style.marginLeft = 'auto';
  canvas.style.marginRight = 'auto';

  var targetW = Math.round(cssW * renderRatio);
  var targetH = Math.round(cssH * renderRatio);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  var ctx = canvas.getContext('2d');
  ctx.setTransform(renderRatio, 0, 0, renderRatio, 0, 0);

  return {
    ctx: ctx,
    W: cssW,
    H: cssH,
    ratio: renderRatio,
    profile: profile
  };
}

/* ─── 타일 데이터 생성 ───────────────────────────── */
function buildMapTiles(force) {
  var profile = getMapProfile();

  if (!force && CURRENT_MAP_KEY === profile.key && MAP_TILES.length > 0) {
    return;
  }

  CURRENT_MAP_PROFILE = profile;
  CURRENT_MAP_KEY = profile.key;

  MAP_TILES = [];
  MAP_TILE_INDEX = {};

  var map = profile.map;

  for (var row = 0; row < map.length; row++) {
    for (var col = 0; col < map[row].length; col++) {
      var typeCode = map[row][col];
      var typeDef = TILE_TYPES[typeCode] || TILE_TYPES.p;

      var tile = {
        id: tileKey(row, col),
        row: row,
        col: col,
        type: typeCode,
        typeId: typeDef.id,
        typeName: typeDef.name,
        ownerClimate: null,
        ownerPlayerId: null,
        buildingId: null,
        unitId: null,
        isCapital: false,
        capitalClimate: null,
        discovered: true,
        selected: false,
        yield: Object.assign({}, typeDef.yield || {}),
        buildable: !!typeDef.buildable
      };

      MAP_TILES.push(tile);
      MAP_TILE_INDEX[tile.id] = tile;
    }
  }

  markCapitalTiles();

  if (SELECTED_TILE) {
    var restored = getTile(SELECTED_TILE.row, SELECTED_TILE.col);
    SELECTED_TILE = restored || null;
  }
}

function ensureMapTiles() {
  buildMapTiles(false);
}

function markCapitalTiles() {
  CLIMATE_ORDER.forEach(function(climateId) {
    var pos = getClimateStart(climateId);
    if (!pos) return;

    var tile = getTile(pos.row, pos.col);

    if (tile) {
      tile.isCapital = true;
      tile.capitalClimate = climateId;
    }
  });
}

/* ─── 영토 생성: 수도 주변 반경 기반 ─────────────── */
function offsetToCube(row, col) {
  var x = col - (row - (row & 1)) / 2;
  var z = row;
  var y = -x - z;

  return { x: x, y: y, z: z };
}

function getHexDistance(a, b) {
  var ac = offsetToCube(a.row, a.col);
  var bc = offsetToCube(b.row, b.col);

  return Math.max(
    Math.abs(ac.x - bc.x),
    Math.abs(ac.y - bc.y),
    Math.abs(ac.z - bc.z)
  );
}

function getTerritoryRadiusByTurns() {
  var turns = getMaxTurnsForMap();

  if (turns <= 15) return 2;
  if (turns >= 30) return 3;
  return 2;
}

function getClimateTerritory(climateId) {
  var start = getClimateStart(climateId);
  if (!start) return [];

  var radius = getTerritoryRadiusByTurns();
  var result = [];

  MAP_TILES.forEach(function(tile) {
    if (tile.type === 'o') return;

    var dist = getHexDistance(start, tile);

    if (dist <= radius) {
      result.push({ row: tile.row, col: tile.col });
    }
  });

  return result;
}

/* ─── 플레이어 데이터와 타일 데이터 연결 ─────────── */
function syncTilesWithPlayers(players) {
  ensureMapTiles();

  MAP_TILES.forEach(function(tile) {
    tile.ownerClimate = null;
    tile.ownerPlayerId = null;
  });

  if (!players) return;

  players.forEach(function(player) {
    if (!player || !player.climate) return;

    var territory = getClimateTerritory(player.climate);

    territory.forEach(function(pos) {
      var tile = getTile(pos.row, pos.col);

      if (tile && tile.type !== 'o') {
        tile.ownerClimate = player.climate;
        tile.ownerPlayerId = player.id;
      }
    });
  });
}

/* ─── 좌표 변환 ─────────────────────────────────── */
function getMapScale(W, H) {
  var profile = CURRENT_MAP_PROFILE || getMapProfile();
  var map = profile.map;
  var rows = map.length;
  var cols = map[0].length;

  var hexSize = profile.hexSize;
  var hexW = Math.sqrt(3) * hexSize;
  var hexStep = hexSize * 1.5;

  var naturalW = MAP_OFFSET_X + cols * hexW + hexW + 80;
  var naturalH = MAP_OFFSET_Y + rows * hexStep + hexSize + 110;

  return Math.min(W / naturalW, H / naturalH);
}

function getScaledHexSize(scale) {
  var profile = CURRENT_MAP_PROFILE || getMapProfile();
  return profile.hexSize * scale;
}

function hexToPixel(row, col, scale) {
  var size = getScaledHexSize(scale);
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

function pointInHex(px, py, cx, cy, size) {
  var dx = Math.abs(px - cx);
  var dy = Math.abs(py - cy);

  if (dx > Math.sqrt(3) * size / 2) return false;
  if (dy > size) return false;

  return Math.sqrt(3) * dx + dy <= Math.sqrt(3) * size;
}

function getCanvasCssMetrics(canvas) {
  var rect = canvas.getBoundingClientRect();

  return {
    W: rect.width || MAP_W,
    H: rect.height || MAP_H
  };
}

function findTileByPoint(x, y, canvas) {
  ensureMapTiles();

  var metrics = getCanvasCssMetrics(canvas);
  var scale = getMapScale(metrics.W, metrics.H);
  var hexSize = getScaledHexSize(scale);

  for (var i = 0; i < MAP_TILES.length; i++) {
    var tile = MAP_TILES[i];
    var pos = hexToPixel(tile.row, tile.col, scale);

    if (pointInHex(x, y, pos.x, pos.y, hexSize)) {
      return tile;
    }
  }

  return null;
}

/* ─── 클릭 이벤트 ───────────────────────────────── */
function bindMapClick(canvas) {
  if (!canvas) return;
  if (_mapClickBoundCanvas === canvas) return;

  _mapClickBoundCanvas = canvas;
  canvas.style.cursor = 'pointer';

  canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();

    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    var clickedTile = findTileByPoint(x, y, canvas);

    if (clickedTile) {
      selectTile(clickedTile);
    }
  });

  canvas.addEventListener('mousemove', function(event) {
    var rect = canvas.getBoundingClientRect();

    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    var hoverTile = findTileByPoint(x, y, canvas);
    canvas.style.cursor = hoverTile ? 'pointer' : 'default';
  });
}

function selectTile(tile) {
  ensureMapTiles();

  MAP_TILES.forEach(function(t) {
    t.selected = false;
  });

  tile.selected = true;
  SELECTED_TILE = tile;

  var canvas = document.getElementById('worldMap');

  if (canvas) {
    drawWorldMap(canvas, _mapLastPlayers || [], _mapLastCurId);
  }

  showTileInfo(tile, _mapLastPlayers || []);
}

/* ─── 타일 정보창 ───────────────────────────────── */
function ensureTileInfoBox() {
  var box = document.getElementById('tileInfoBox');

  if (!box) {
    box = document.createElement('div');
    box.id = 'tileInfoBox';

    box.style.marginTop = '10px';
    box.style.padding = '12px 14px';
    box.style.border = '1px solid rgba(255,255,255,0.20)';
    box.style.borderRadius = '12px';
    box.style.background = 'rgba(8,9,26,0.92)';
    box.style.color = '#f6e7b5';
    box.style.fontSize = '13px';
    box.style.lineHeight = '1.55';
    box.style.boxShadow = '0 10px 24px rgba(0,0,0,0.25)';

    var canvas = document.getElementById('worldMap');

    if (canvas && canvas.parentNode) {
      canvas.parentNode.appendChild(box);
    }
  }

  return box;
}

function showTileInfo(tile, players) {
  var box = ensureTileInfoBox();
  var tileType = TILE_TYPES[tile.type] || TILE_TYPES.p;
  var owner = getPlayerById(players, tile.ownerPlayerId);
  var profile = CURRENT_MAP_PROFILE || getMapProfile();

  var ownerText = owner
    ? (owner.emoji || '👑') + ' ' + owner.name + ' / ' + owner.country
    : '없음';

  var capitalText = tile.isCapital
    ? getClimateEmoji(tile.capitalClimate) + ' ' + getClimateName(tile.capitalClimate) + ' 수도'
    : '아님';

  var buildableText = tile.buildable ? '가능' : '불가';

  box.innerHTML =
    '<div style="font-weight:700;font-size:15px;margin-bottom:6px;">🧭 선택한 타일</div>' +
    '<div>지도 유형: ' + profile.turnLabel + ' · ' + profile.label + '</div>' +
    '<div>위치: ' + tile.row + '행 ' + tile.col + '열</div>' +
    '<div>지형: ' + tileType.icon + ' ' + tileType.name + '</div>' +
    '<div>생산량: ' + formatYield(tile.yield) + '</div>' +
    '<div>소유자: ' + ownerText + '</div>' +
    '<div>수도 여부: ' + capitalText + '</div>' +
    '<div>건설 가능: ' + buildableText + '</div>' +
    '<div>건물: ' + (tile.buildingId || '없음') + '</div>' +
    '<div style="margin-top:8px;color:rgba(246,231,181,0.68);font-size:12px;">' +
      '※ 이 타일 데이터에 건물, 유닛, 영토 확장 정보를 연결할 수 있습니다.' +
    '</div>';
}

/* ─── 메인 렌더링 ───────────────────────────────── */
function drawWorldMap(canvas, players, currentPlayerId) {
  if (!canvas) return;

  ensureMapTiles();
  syncTilesWithPlayers(players);

  var prepared = prepareCanvasForHighQuality(canvas);
  var ctx = prepared.ctx;
  var W = prepared.W;
  var H = prepared.H;
  var profile = prepared.profile;

  var scale = getMapScale(W, H);
  var hexSize = getScaledHexSize(scale);

  ctx.clearRect(0, 0, W, H);

  drawBackground(ctx, W, H);
  drawMapTitle(ctx, profile);
  drawAllTiles(ctx, scale, hexSize, players || []);
  drawTerritoryBorders(ctx, scale, hexSize, players || []);
  drawSelectedTile(ctx, scale, hexSize);
  drawCapitals(ctx, W, H, scale, hexSize, players || [], currentPlayerId);
  drawTileLegend(ctx, 10, H - 78);
  drawRankLegend(ctx, W, H, players || []);
  drawWatermark(ctx, W, H);

  bindMapClick(canvas);
}

/* ─── 배경 ─────────────────────────────────────── */
function drawBackground(ctx, W, H) {
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

/* ─── 타일 그리기 ───────────────────────────────── */
function drawAllTiles(ctx, scale, hexSize, players) {
  ensureMapTiles();

  MAP_TILES.forEach(function(tile) {
    drawSingleTile(ctx, tile, scale, hexSize, players);
  });
}

function drawSingleTile(ctx, tile, scale, hexSize, players) {
  var tileType = TILE_TYPES[tile.type] || TILE_TYPES.p;
  var pos = hexToPixel(tile.row, tile.col, scale);

  var owner = getPlayerById(players, tile.ownerPlayerId);
  var ownerColor = owner ? getPlayerColor(owner, owner.climate) : null;

  ctx.save();

  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.fillStyle = tileType.color;
  ctx.fill();

  var grad = ctx.createLinearGradient(
    pos.x - hexSize,
    pos.y - hexSize,
    pos.x + hexSize,
    pos.y + hexSize
  );

  grad.addColorStop(0, 'rgba(255,255,255,0.18)');
  grad.addColorStop(0.52, 'rgba(255,255,255,0.015)');
  grad.addColorStop(1, 'rgba(0,0,0,0.24)');

  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.fillStyle = grad;
  ctx.fill();

  if (ownerColor) {
    drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
    ctx.fillStyle = rgbaFromHex(ownerColor, 0.38);
    ctx.fill();

    drawHexPath(ctx, pos.x, pos.y, hexSize - 7 * scale);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
  }

  drawHexPath(ctx, pos.x, pos.y, hexSize - HEX_GAP);
  ctx.lineWidth = ownerColor ? 1.8 : 1;
  ctx.strokeStyle = ownerColor
    ? rgbaFromHex(ownerColor, 0.85)
    : 'rgba(255,255,255,0.20)';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = Math.round(12 * scale) + 'px sans-serif';
  ctx.fillStyle = tile.type === 'o'
    ? 'rgba(210,235,255,0.45)'
    : 'rgba(255,255,255,0.62)';
  ctx.fillText(tileType.icon, pos.x, pos.y - 1 * scale);

  drawYieldMiniIcon(ctx, tile, pos, scale);

  if (tile.buildingId) {
    drawTileBuilding(ctx, tile, pos, scale);
  }

  ctx.restore();
}

function drawYieldMiniIcon(ctx, tile, pos, scale) {
  var yieldObj = tile.yield || {};
  var icon = null;

  if (yieldObj.food) icon = '🌾';
  else if (yieldObj.production) icon = '⚙️';
  else if (yieldObj.gold) icon = '💰';
  else if (yieldObj.science) icon = '🔬';
  else if (yieldObj.culture) icon = '🎨';

  if (!icon) return;

  ctx.save();
  ctx.font = Math.round(8.5 * scale) + 'px sans-serif';
  ctx.globalAlpha = 0.66;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, pos.x + 12 * scale, pos.y + 10 * scale);
  ctx.restore();
}

function drawTileBuilding(ctx, tile, pos, scale) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 10 * scale, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5,7,18,0.82)';
  ctx.fill();

  ctx.lineWidth = 1.1;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.stroke();

  ctx.font = Math.round(11 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(getBuildingEmojiById(tile.buildingId), pos.x, pos.y);

  ctx.restore();
}

/* ─── 국가별 영토 경계 강화 ─────────────────────── */
function drawTerritoryBorders(ctx, scale, hexSize, players) {
  if (!players || players.length === 0) return;

  players.forEach(function(player) {
    var color = getPlayerColor(player, player.climate);
    var ownedTiles = MAP_TILES.filter(function(tile) {
      return tile.ownerPlayerId === player.id;
    });

    if (ownedTiles.length === 0) return;

    ctx.save();

    ownedTiles.forEach(function(tile) {
      var pos = hexToPixel(tile.row, tile.col, scale);

      drawHexPath(ctx, pos.x, pos.y, hexSize - 0.8 * scale);
      ctx.lineWidth = 4.2 * scale;
      ctx.strokeStyle = rgbaFromHex(color, 0.95);
      ctx.stroke();

      drawHexPath(ctx, pos.x, pos.y, hexSize - 4.8 * scale);
      ctx.lineWidth = 1.35 * scale;
      ctx.strokeStyle = 'rgba(255,255,255,0.50)';
      ctx.stroke();
    });

    drawTerritoryLabel(ctx, scale, player, color);

    ctx.restore();
  });
}

function drawTerritoryLabel(ctx, scale, player, color) {
  var ownedTiles = MAP_TILES.filter(function(tile) {
    return tile.ownerPlayerId === player.id;
  });

  if (ownedTiles.length === 0) return;

  var sumX = 0;
  var sumY = 0;

  ownedTiles.forEach(function(tile) {
    var pos = hexToPixel(tile.row, tile.col, scale);
    sumX += pos.x;
    sumY += pos.y;
  });

  var cx = sumX / ownedTiles.length;
  var cy = sumY / ownedTiles.length;

  var label = player.country || player.name || '문명';
  if (label.length > 7) label = label.slice(0, 7) + '…';

  ctx.save();

  ctx.font = 'bold ' + Math.round(11 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  var textW = ctx.measureText(label).width;
  var boxW = textW + 18 * scale;
  var boxH = 20 * scale;

  ctx.fillStyle = 'rgba(6,8,20,0.72)';
  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 8 * scale);
  ctx.fill();

  ctx.lineWidth = 1.2 * scale;
  ctx.strokeStyle = rgbaFromHex(color, 0.88);
  roundRect(ctx, cx - boxW / 2, cy - boxH / 2, boxW, boxH, 8 * scale);
  ctx.stroke();

  ctx.fillStyle = '#f6e7b5';
  ctx.fillText(label, cx, cy);

  ctx.restore();
}

/* ─── 선택 타일 표시 ────────────────────────────── */
function drawSelectedTile(ctx, scale, hexSize) {
  if (!SELECTED_TILE) return;

  var tile = getTile(SELECTED_TILE.row, SELECTED_TILE.col);
  if (!tile) return;

  var pos = hexToPixel(tile.row, tile.col, scale);

  ctx.save();

  drawHexPath(ctx, pos.x, pos.y, hexSize + 2 * scale);
  ctx.lineWidth = 4.4 * scale;
  ctx.strokeStyle = '#f0c040';
  ctx.stroke();

  drawHexPath(ctx, pos.x, pos.y, hexSize - 2 * scale);
  ctx.fillStyle = 'rgba(240,192,64,0.18)';
  ctx.fill();

  ctx.restore();
}

/* ─── 수도 / 플레이어 표시 ─────────────────────── */
function drawCapitals(ctx, W, H, scale, hexSize, players, currentPlayerId) {
  CLIMATE_ORDER.forEach(function(climateId) {
    var start = getClimateStart(climateId);
    if (!start) return;

    var player = getPlayerByClimate(players, climateId);

    if (!player) {
      drawEmptyCapital(ctx, scale, climateId, start);
      return;
    }

    drawPlayerCapital(ctx, W, H, scale, hexSize, climateId, start, player, player.id === currentPlayerId);
  });
}

function drawEmptyCapital(ctx, scale, climateId, start) {
  var pos = hexToPixel(start.row, start.col, scale);

  ctx.save();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.50;
  ctx.font = Math.round(17 * scale) + 'px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(getClimateEmoji(climateId), pos.x, pos.y - 2 * scale);

  ctx.font = Math.round(9 * scale) + 'px sans-serif';
  ctx.fillText(getClimateName(climateId), pos.x, pos.y + 18 * scale);

  ctx.restore();
}

function drawPlayerCapital(ctx, W, H, scale, hexSize, climateId, start, player, isHighlight) {
  var pos = hexToPixel(start.row, start.col, scale);
  var color = getPlayerColor(player, climateId);
  var r = isHighlight ? 19 * scale : 16 * scale;

  ctx.save();

  if (isHighlight) {
    var t = (Date.now() % 1800) / 1800;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 13 * scale + t * 8 * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgbaFromHex(color, 0.22 * (1 - t));
    ctx.fill();
  }

  drawHexPath(ctx, pos.x, pos.y, hexSize - 2 * scale);
  ctx.fillStyle = rgbaFromHex(color, isHighlight ? 0.52 : 0.42);
  ctx.fill();

  ctx.lineWidth = isHighlight ? 3 : 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.shadowColor = color;
  ctx.shadowBlur = isHighlight ? 20 : 12;

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7,9,22,0.92)';
  ctx.fill();

  ctx.lineWidth = isHighlight ? 2.4 : 1.7;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = Math.round((isHighlight ? 16 : 14) * scale) + 'px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(player.emoji || '👑', pos.x, pos.y - 1 * scale);

  drawPlayerInfoCard(ctx, W, H, pos.x, pos.y + r + 5 * scale, player, color, isHighlight, scale);

  ctx.restore();
}

function drawPlayerInfoCard(ctx, W, H, cx, topY, player, color, isHighlight, scale) {
  var cardW = (isHighlight ? 116 : 104) * scale;
  var cardH = 48 * scale;

  var x = clamp(cx - cardW / 2, 4, W - cardW - 4);
  var y = topY;

  if (y + cardH > H - 6) {
    y = topY - cardH - 52 * scale;
  }

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
  ctx.fillText('★ ' + total, x + cardW / 2, y + 31 * scale);

  drawMiniResBar(ctx, x + 8 * scale, y + 43 * scale, cardW - 16 * scale, player, scale);

  ctx.restore();
}

function drawMiniResBar(ctx, x, y, w, player, scale) {
  var res = player.resources || {};

  var items = [
    { key: 'food',       color: '#60d060', val: Math.floor(res.food || 0) },
    { key: 'gold',       color: '#f0c040', val: Math.floor(res.gold || 0) },
    { key: 'production', color: '#80aac8', val: Math.floor(res.production || 0) },
    { key: 'science',    color: '#50a8e8', val: Math.floor(res.science || 0) },
    { key: 'culture',    color: '#b050e8', val: Math.floor(res.culture || 0) }
  ];

  var maxVal = Math.max.apply(null, items.map(function(i) {
    return i.val;
  }).concat([1]));

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

/* ─── 건물 아이콘 헬퍼 ───────────────────────────── */
function getBuildingCatalog() {
  var list = [];

  if (typeof BUILDINGS !== 'undefined' && BUILDINGS) {
    list = list.concat(BUILDINGS);
  }

  if (typeof UNIQUE_BUILDINGS !== 'undefined' && UNIQUE_BUILDINGS) {
    list = list.concat(UNIQUE_BUILDINGS);
  }

  return list;
}

function getBuildingEmojiById(id) {
  var catalog = getBuildingCatalog();

  for (var i = 0; i < catalog.length; i++) {
    if (catalog[i].id === id) {
      return catalog[i].emoji || '🏗️';
    }
  }

  var fallback = {
    farm: '🌾',
    aqueduct: '💧',
    workshop: '🔧',
    foundry: '🏭',
    market: '🏪',
    harbor: '⚓',
    library: '📚',
    university: '🎓',
    temple: '🏛️',
    theater: '🎭',
    barracks: '⚔️',
    fortress: '🏰',
    rice_terrace: '🌾',
    caravanserai: '🏕️',
    windmill: '⚙️',
    fur_post: '🦊',
    rice_paddy: '🌿',
    observatory: '🔭'
  };

  return fallback[id] || '🏗️';
}

/* ─── 제목 / 범례 / 워터마크 ─────────────────────── */
function drawMapTitle(ctx, profile) {
  ctx.save();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = 'rgba(246,231,181,0.95)';
  ctx.fillText('문명 지도', 12, 10);

  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(210,225,245,0.66)';
  ctx.fillText(profile.turnLabel + ' · ' + profile.label + ' · 국가별 영토 강화', 12, 30);

  ctx.restore();
}

function drawTileLegend(ctx, x, y) {
  var items = [
    { code: 'p', label: '초원' },
    { code: 'f', label: '숲' },
    { code: 'd', label: '사막' },
    { code: 'm', label: '산' },
    { code: 't', label: '설원' },
    { code: 'j', label: '열대' }
  ];

  ctx.save();

  var boxW = 184;
  var boxH = 64;

  ctx.fillStyle = 'rgba(6,8,20,0.76)';
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
    var ix = x + 10 + (idx % 3) * 58;
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

function drawRankLegend(ctx, W, H, players) {
  if (!players || players.length === 0) return;

  var sorted = players.slice().sort(function(a, b) {
    return (b.scores ? b.scores.total : 0) - (a.scores ? a.scores.total : 0);
  });

  var legendW = 140;
  var legendH = 16 + sorted.length * 17;
  var lx = W - legendW - 7;
  var ly = H - legendH - 7;

  ctx.save();

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

    var playerName = p.name || '플레이어';
    if (playerName.length > 5) playerName = playerName.slice(0, 5) + '…';

    var label = (idx + 1) + '. ' + (p.emoji || '👑') + ' ' + playerName;
    ctx.fillText(label, lx + 10, ry + 4);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f0c040';
    ctx.fillText(total, lx + legendW - 6, ry + 4);
  });

  ctx.restore();
}

function drawWatermark(ctx, W, H) {
  ctx.save();

  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.textAlign = 'right';
  ctx.fillText('made by 박선생', W - 8, H - 6);

  ctx.restore();
}

/* ─── 리사이즈 대응 ─────────────────────────────── */
function requestMapRedraw() {
  var canvas = document.getElementById('worldMap');
  if (!canvas) return;

  drawWorldMap(canvas, _mapLastPlayers || [], _mapLastCurId);
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', function() {
    requestMapRedraw();
  });
}

/* ─── 외부 호출 함수: 기존 이름 유지 ─────────────── */
function scheduleMapDraw(players, currentPlayerId) {
  _mapLastPlayers = players || [];
  _mapLastCurId = currentPlayerId;

  buildMapTiles(false);
  syncTilesWithPlayers(_mapLastPlayers);

  if (_mapDrawScheduled) return;

  _mapDrawScheduled = true;

  setTimeout(function() {
    _mapDrawScheduled = false;

    var canvas = document.getElementById('worldMap');
    if (!canvas) return;

    drawWorldMap(canvas, _mapLastPlayers, _mapLastCurId);

    if (_mapAnimFrame) {
      cancelAnimationFrame(_mapAnimFrame);
    }

    function animate() {
      var c = document.getElementById('worldMap');

      if (!c) return;

      drawWorldMap(c, _mapLastPlayers, _mapLastCurId);
      _mapAnimFrame = requestAnimationFrame(animate);
    }

    _mapAnimFrame = requestAnimationFrame(animate);
  }, 0);
}
